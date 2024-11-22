import isEqual from 'lodash.isequal';
import { type WeekdayNumbers } from 'luxon';
import type { ForwardRefRenderFunction, PropsWithChildren } from 'react';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import { DEFAULT_MIN_START_DIFFERENCE } from '../constants';
import { parseDateTime, toISODate } from '../dateUtils';
import { divideEvents, filterEvents, populateEvents, processEventOccurrences } from '../eventUtils';
import useLazyRef from '../hooks/useLazyRef';
import { createStore, type Store } from '../store/storeBuilder';
import { useSelector } from '../store/useSelector';
import type { EventItem, EventItemInternal, PackedEvent, ResourceItem } from '../types';
import { useCalendar } from './CalendarContext';
import { useTimezone } from './TimezoneContext';
import { useDateChangedListener } from './VisibleDateProvider';

export interface EventsState {
  regularEvents: Map<number, PackedEvent[]>;
  resources?: ResourceItem[];
  minDateUnix?: number;
  maxDateUnix?: number;
  overlapType?: 'no-overlap' | 'overlap';
  minStartDifference?: number;
}

export const EventsContext = createContext<Store<EventsState> | undefined>(undefined);

export interface EventsProviderProps {
  events?: EventItem[];
  hideWeekDays: WeekdayNumbers[];
  minRegularEventMinutes?: number;
  overlapType?: 'no-overlap' | 'overlap';
  minStartDifference?: number;
  resources?: ResourceItem[];
}

interface EventCache {
  regularEvents: Map<number, PackedEvent[]>;
  eventMap: Map<string, EventItem>;
}

export interface EventsRef {
  getEventStore: () => Store<EventsState>;
  getEventsByDate: (dateString: string) => PackedEvent[];
  clearCachedEvents: () => void;
}

const EventsProvider: ForwardRefRenderFunction<
  EventsRef,
  PropsWithChildren<EventsProviderProps>
> = (
  {
    events,
    children,
    minRegularEventMinutes = 1,
    overlapType = 'no-overlap',
    minStartDifference = DEFAULT_MIN_START_DIFFERENCE,
    resources,
  },
  ref
) => {
  const { gridListRef, pagesPerSide } = useCalendar();
  const { timeZone } = useTimezone();
  const currentStartDate = useDateChangedListener();
  const prevTimeZone = useRef(timeZone);

  const cacheRef = useRef<EventCache>({
    regularEvents: new Map(),
    eventMap: new Map(),
  });

  const eventsStore = useLazyRef(() =>
    createStore<EventsState>({
      regularEvents: new Map(),
      resources: undefined,
      minDateUnix: undefined,
      maxDateUnix: undefined,
      overlapType,
      minStartDifference,
    })
  ).current;

  const processRegularEvents = useCallback(
    (regularEvents: EventItemInternal[], minDateUnix: number, maxDateUnix: number) => {
      const regularEventMap = new Map<number, EventItemInternal[]>();

      regularEvents.forEach((event) => {
        const processedEvents = processEventOccurrences(
          event,
          minDateUnix,
          maxDateUnix,
          timeZone,
          (e, tz) => divideEvents(e, tz, minRegularEventMinutes)
        );

        processedEvents.forEach((evt) => {
          const isoDate = toISODate(evt._internal.startUnix, { zone: timeZone });
          const dayItem = parseDateTime(isoDate, { zone: 'utc' }).startOf('day').toMillis();
          if (!regularEventMap.has(dayItem)) {
            regularEventMap.set(dayItem, []);
          }
          regularEventMap.get(dayItem)!.push(evt);
        });
      });

      return regularEventMap;
    },
    [timeZone, minRegularEventMinutes]
  );

  const updateEventCache = useCallback(
    (
      eventChanges: {
        regular: {
          added: EventItemInternal[];
          updated: EventItemInternal[];
          deleted: string[];
          unchanged: EventItemInternal[];
        };
      },
      minDate: number,
      maxDate: number
    ) => {
      // Remove deleted events from cache
      eventChanges.regular.deleted.forEach((id) => {
        cacheRef.current.eventMap.delete(id);
      });

      // Add/update new events in cache
      eventChanges.regular.added.forEach((event) => {
        cacheRef.current.eventMap.set(event.id, event);
      });

      // Process only changed events
      const eventsToProcess = [...eventChanges.regular.added, ...eventChanges.regular.updated];
      if (eventsToProcess.length === 0 && eventChanges.regular.deleted.length === 0) {
        return null; // No changes needed
      }

      // Process new regular events
      const newRegularMap = processRegularEvents(eventsToProcess, minDate, maxDate);

      // Merge with existing events
      const mergedRegularMap = new Map(cacheRef.current.regularEvents);

      // Remove updated events from their original dates
      // TODO: Issue with recurrence events
      eventChanges.regular.updated.forEach((updatedEvent) => {
        mergedRegularMap.forEach((rEvents, date) => {
          mergedRegularMap.set(
            date,
            rEvents.filter((event) => event.id !== updatedEvent.id)
          );
        });
      });

      // Remove deleted events from existing maps
      if (eventChanges.regular.deleted.length > 0) {
        const deletedSet = new Set(eventChanges.regular.deleted);
        mergedRegularMap.forEach((rEvents, date) => {
          mergedRegularMap.set(
            date,
            rEvents.filter((event) => !deletedSet.has(event.id))
          );
        });
      }

      // Merge new events
      newRegularMap.forEach((rEvents, date) => {
        const existing = mergedRegularMap.get(date) || [];
        const filtered = existing.filter(
          (event) => !eventsToProcess.some((newEvent) => newEvent.id === event.id)
        );
        const newEvents = [...filtered, ...rEvents];
        mergedRegularMap.set(
          date,
          populateEvents(newEvents, {
            overlap: overlapType === 'overlap',
            minStartDifference,
            resources,
          })
        );
      });

      cacheRef.current.regularEvents = mergedRegularMap;

      return { regularEvents: mergedRegularMap };
    },
    [minStartDifference, overlapType, processRegularEvents, resources]
  );

  const isEventChanged = useCallback((cachedEvent: EventItem, event: EventItem) => {
    if (event.recurrence) {
      return true;
    }

    return !isEqual(cachedEvent, event);
  }, []);

  const getEventChanges = useCallback(
    (newEvents: EventItem[] = [], minDateUnix: number, maxDateUnix: number) => {
      // Initialize changes object with typed arrays
      const changesRegular: {
        added: EventItemInternal[];
        updated: EventItemInternal[];
        deleted: string[];
        unchanged: EventItemInternal[];
      } = {
        added: [],
        updated: [],
        deleted: [],
        unchanged: [],
      };

      // Filter events within the date range
      const { regular: regularEvents } = filterEvents(newEvents, false, minDateUnix, maxDateUnix);

      // Get current event IDs for tracking deletions
      const currentEventIds = new Set(cacheRef.current.eventMap.keys());

      // Process each filtered event
      for (const event of regularEvents) {
        const cachedEvent = cacheRef.current.eventMap.get(event.id);
        if (!cachedEvent) {
          changesRegular.added.push(event);
        } else if (isEventChanged(cachedEvent, event)) {
          changesRegular.updated.push(event);
        } else {
          changesRegular.unchanged.push(event);
        }

        currentEventIds.delete(event.id);
      }

      // Any remaining IDs represent deleted events
      changesRegular.deleted = Array.from(currentEventIds);

      return { regular: changesRegular };
    },
    [isEventChanged]
  );

  const notifyDataChanged = useCallback(
    (date: number) => {
      const listRef = gridListRef.current;
      const baseIndex = listRef?.getIndexByItem(date);
      if (baseIndex === undefined) {
        return;
      }
      const numberOfDays = listRef?.numColumns ?? 7;
      const minIndex = baseIndex - numberOfDays * pagesPerSide;
      const maxIndex = baseIndex + numberOfDays * (pagesPerSide + 1);
      const minDateUnix = listRef?.getItemByIndex(minIndex);
      const maxDateUnix = listRef?.getItemByIndex(maxIndex);
      if (!minDateUnix || !maxDateUnix) {
        return;
      }

      const eventChanges = getEventChanges(events, minDateUnix, maxDateUnix);
      const updatedMaps = updateEventCache(eventChanges, minDateUnix, maxDateUnix);
      if (!updatedMaps) {
        return;
      }

      eventsStore.setState({
        regularEvents: updatedMaps.regularEvents,
        resources,
        minDateUnix,
        maxDateUnix,
        overlapType,
        minStartDifference,
      });
    },
    [
      gridListRef,
      pagesPerSide,
      getEventChanges,
      events,
      updateEventCache,
      eventsStore,
      resources,
      overlapType,
      minStartDifference,
    ]
  );

  useImperativeHandle(ref, () => ({
    getEventStore: () => eventsStore,
    getEventsByDate: (dateString: string) => {
      const eventState = eventsStore.getState();
      const utcUnix = parseDateTime(dateString, { setZone: true })
        .startOf('day')
        .toUTC(undefined, {
          keepLocalTime: true,
        })
        .toMillis();

      const packedRegularEvents = eventState.regularEvents.get(utcUnix) ?? [];
      if (!packedRegularEvents) {
        return [];
      }

      const dateUnix = parseDateTime(dateString).toISO();
      return packedRegularEvents.filter((event) => {
        const eventStart = parseDateTime(event.start.dateTime).toISO();
        const eventEnd = parseDateTime(event.end.dateTime).toISO();
        return eventStart <= dateUnix && eventEnd >= dateUnix;
      });
    },
    clearCachedEvents: () => {
      cacheRef.current.regularEvents.clear();
      cacheRef.current.eventMap.clear();
    },
  }));

  useEffect(() => {
    if (prevTimeZone.current !== timeZone) {
      cacheRef.current.regularEvents.clear();
      cacheRef.current.eventMap.clear();
      prevTimeZone.current = timeZone;
    }
    notifyDataChanged(currentStartDate);
  }, [notifyDataChanged, currentStartDate, timeZone]);

  return <EventsContext.Provider value={eventsStore}>{children}</EventsContext.Provider>;
};

export default forwardRef(EventsProvider);

export const useRegularEventsByDay = (dateUnix: number) => {
  const eventsContext = useContext(EventsContext);

  if (!eventsContext) {
    throw new Error('useRegularEventsByDate must be used within a EventsProvider');
  }

  const selectorByDate = useCallback(
    (state: EventsState) => state.regularEvents.get(dateUnix) ?? [],
    [dateUnix]
  );

  return useSelector(eventsContext.subscribe, eventsContext.getState, selectorByDate);
};

export const useResources = () => {
  const eventsContext = useContext(EventsContext);
  const selectResources = useCallback(() => eventsContext?.getState().resources, [eventsContext]);

  if (!eventsContext) {
    throw new Error('useResources must be used within a EventsProvider');
  }

  const state = useSelector(eventsContext.subscribe, eventsContext.getState, selectResources);
  return state;
};
