import type { WeekdayNumbers } from 'luxon';
import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type PropsWithChildren,
} from 'react';
import { MILLISECONDS_IN_DAY } from '../constants';
import { useSyncExternalStoreWithSelector } from '../hooks/useSyncExternalStoreWithSelector';
import { createStore, type Store } from '../storeBuilder';
import type {
  EventItem,
  EventItemInternal,
  PackedAllDayEvent,
  PackedEvent,
} from '../types';
import {
  forceUpdateZone,
  parseDateTime,
  startOfWeek,
} from '../utils/dateUtils';
import {
  divideEvents,
  filterEvents,
  populateAllDayEvents,
  populateEvents,
  processRecurrenceEvent,
} from '../utils/eventUtils';

interface EventsState {
  allDayEvents: Record<string, PackedAllDayEvent[]>;
  regularEvents: Record<string, PackedEvent[]>;
  allDayEventCounter: Record<string, number>;
  allDayCountByWeek: Record<string, number>;
}

const eventStore = createStore<EventsState>({
  allDayEvents: {},
  regularEvents: {},
  allDayEventCounter: {},
  allDayCountByWeek: {},
});

const EventsContext = React.createContext<Store<EventsState> | undefined>(
  undefined
);

interface EventActionsContextProps {
  notifyDataChanged: (date: number, offset?: number) => void;
}

const EventsActionsContext = React.createContext<
  EventActionsContextProps | undefined
>(undefined);

interface EventsProviderProps {
  firstDay: WeekdayNumbers;
  events?: EventItem[];
  timeZone: string;
  visibleStart: React.MutableRefObject<number>;
  useAllDayEvent?: boolean;
}

const EventsProvider: FC<PropsWithChildren<EventsProviderProps>> = ({
  events = [],
  children,
  timeZone,
  firstDay,
  visibleStart,
  useAllDayEvent,
}) => {
  const prevEvents = useRef<EventItem[]>();
  const notifyDataChanged = useCallback(
    (date: number, offset: number = 7) => {
      prevEvents.current = events;
      const zonedDate = forceUpdateZone(date, timeZone).toMillis();
      const minUnix = zonedDate - MILLISECONDS_IN_DAY * offset;
      const maxUnix = zonedDate + MILLISECONDS_IN_DAY * (offset * 2);
      const filteredEvents = filterEvents(
        events,
        minUnix,
        maxUnix,
        useAllDayEvent
      );

      const eventsByDate: Record<string, EventItemInternal[]> = {};
      for (const event of filteredEvents.regular) {
        let processedEvents: EventItemInternal[] = [];
        if (event.recurrenceRule) {
          processedEvents = processRecurrenceEvent(
            event,
            minUnix,
            maxUnix,
            timeZone
          );
        } else {
          processedEvents = divideEvents(event, timeZone);
        }

        for (const evt of processedEvents) {
          const key = parseDateTime(evt._internal.startUnix)
            .startOf('day')
            .toMillis();

          if (!eventsByDate[key]) {
            eventsByDate[key] = [];
          }
          eventsByDate[key]!.push(evt);
        }
      }

      const packedRegularEvents: Record<string, PackedEvent[]> = {};
      for (const key in eventsByDate) {
        packedRegularEvents[key] = populateEvents(eventsByDate[key]!);
      }

      const groupedAllDayEvents: Record<string, EventItemInternal[]> = {};
      for (const event of filteredEvents.allDays) {
        let processedEvents: EventItemInternal[] = [];
        if (event.recurrenceRule) {
          processedEvents = processRecurrenceEvent(
            event,
            minUnix,
            maxUnix,
            timeZone,
            true
          );
        } else {
          processedEvents = [event];
        }

        for (const evt of processedEvents) {
          const startDate = startOfWeek(evt.start, firstDay).toMillis();
          const nextWeek = startDate + 7 * MILLISECONDS_IN_DAY;
          let endUnix = evt._internal.endUnix;
          let duration = evt._internal.duration;
          if (endUnix > nextWeek) {
            if (!groupedAllDayEvents[nextWeek]) {
              groupedAllDayEvents[nextWeek] = [];
            }
            const newDuration = endUnix - nextWeek;
            groupedAllDayEvents[nextWeek]!.push({
              ...evt,
              _internal: {
                ...evt._internal,
                startUnix: nextWeek,
                endUnix: nextWeek + newDuration,
                duration: newDuration,
              },
            });
            endUnix = nextWeek;
            duration -= newDuration;
          }

          if (!groupedAllDayEvents[startDate]) {
            groupedAllDayEvents[startDate] = [];
          }
          groupedAllDayEvents[startDate]!.push({
            ...evt,
            _internal: { ...evt._internal, endUnix, duration },
          });
        }
      }

      const packedAllDayEvents: Record<string, PackedAllDayEvent[]> = {};
      const allDayEventCounter: Record<string, number> = {};
      const allDayCountByWeek: Record<string, number> = {};
      for (const groupedDate in groupedAllDayEvents) {
        populateAllDayEvents(
          packedAllDayEvents,
          allDayEventCounter,
          allDayCountByWeek,
          groupedAllDayEvents[groupedDate]!,
          { startDate: Number(groupedDate) }
        );
      }

      eventStore.setState({
        allDayEvents: packedAllDayEvents,
        regularEvents: packedRegularEvents,
        allDayEventCounter: allDayEventCounter,
        allDayCountByWeek,
      });
    },
    [events, firstDay, timeZone, useAllDayEvent]
  );

  useEffect(() => {
    notifyDataChanged(visibleStart.current);
  }, [events, notifyDataChanged, visibleStart]);

  const actions = useMemo(() => ({ notifyDataChanged }), [notifyDataChanged]);

  return (
    <EventsActionsContext.Provider value={actions}>
      <EventsContext.Provider value={eventStore}>
        {children}
      </EventsContext.Provider>
    </EventsActionsContext.Provider>
  );
};

export default EventsProvider;

export const useNotifyDataChanged = () => {
  const store = React.useContext(EventsActionsContext);
  if (!store) {
    throw new Error(
      'useNotifyDataChanged must be used within a EventsProvider'
    );
  }
  return store.notifyDataChanged;
};

export const useAllDayEvents = (date: number, numberOfDays: number) => {
  const eventsContext = useContext(EventsContext);

  const selectorByDate = useCallback(
    (state: EventsState) => {
      let data: PackedAllDayEvent[] = [];

      for (let i = 0; i < numberOfDays; i++) {
        const dateUnix = date + i * MILLISECONDS_IN_DAY;
        const events = state.allDayEvents[dateUnix];
        if (events) {
          data.push(...events);
        }
      }

      return { data };
    },
    [date, numberOfDays]
  );

  if (!eventsContext) {
    throw new Error('useAllDayEvents must be used within a EventsProvider');
  }

  const state = useSyncExternalStoreWithSelector(
    eventsContext.subscribe,
    eventsContext.getState,
    selectorByDate
  );
  return state;
};

export const useRegularEvents = (date: number, numberOfDays: number) => {
  const eventsContext = useContext(EventsContext);

  const selectorByDate = useCallback(
    (state: EventsState) => {
      let data: PackedEvent[] = [];

      for (let i = 0; i < numberOfDays; i++) {
        const dateUnix = date + i * MILLISECONDS_IN_DAY;
        const events = state.regularEvents[dateUnix];
        if (events) {
          data.push(...events);
        }
      }

      return { data };
    },
    [date, numberOfDays]
  );

  if (!eventsContext) {
    throw new Error('useRegularEvents must be used within a EventsProvider');
  }

  const state = useSyncExternalStoreWithSelector(
    eventsContext.subscribe,
    eventsContext.getState,
    selectorByDate
  );
  return state;
};
