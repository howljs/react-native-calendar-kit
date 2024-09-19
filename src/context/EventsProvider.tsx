import type { WeekdayNumbers } from 'luxon';
import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
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
import { forceUpdateZone, parseDateTime } from '../utils/dateUtils';
import {
  divideAllDayEvents,
  divideEvents,
  filterEvents,
  populateAllDayEvents,
  populateEvents,
} from '../utils/eventUtils';
import { useDateChangedListener } from './VisibleDateProvider';

interface EventsState {
  allDayEvents: Record<string, PackedAllDayEvent[]>;
  allDayEventsByDay: Record<string, PackedAllDayEvent[]>;
  regularEvents: Record<string, PackedEvent[]>;
  eventCountsByDay: Record<string, number>;
  eventCountsByWeek: Record<string, number>;
}

const eventStore = createStore<EventsState>({
  allDayEvents: {},
  allDayEventsByDay: {},
  regularEvents: {},
  eventCountsByDay: {},
  eventCountsByWeek: {},
});

const EventsContext = React.createContext<Store<EventsState> | undefined>(
  undefined
);

interface EventsProviderProps {
  firstDay: WeekdayNumbers;
  events?: EventItem[];
  timezone: string;
  useAllDayEvent?: boolean;
  pagesPerSide: number;
  hideWeekDays: WeekdayNumbers[];
}

const EventsProvider: FC<PropsWithChildren<EventsProviderProps>> = ({
  pagesPerSide,
  events = [],
  children,
  timezone,
  firstDay,
  useAllDayEvent,
  hideWeekDays,
}) => {
  const currentStartDate = useDateChangedListener();

  const notifyDataChanged = useCallback(
    (date: number, offset: number = 7) => {
      const zonedDate = forceUpdateZone(date, timezone).toMillis();
      const minUnix = zonedDate - MILLISECONDS_IN_DAY * (offset * pagesPerSide);
      const maxUnix =
        zonedDate + MILLISECONDS_IN_DAY * (offset * (pagesPerSide + 1));
      const filteredEvents = filterEvents(
        events,
        minUnix,
        maxUnix,
        useAllDayEvent
      );

      const eventsByDate: Record<string, EventItemInternal[]> = {};
      for (const event of filteredEvents.regular) {
        const processedEvents: EventItemInternal[] = divideEvents(
          event,
          timezone
        );
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

      const groupedAllDayEventsByWeek: Record<string, EventItemInternal[]> = {};
      for (const event of filteredEvents.allDays) {
        let processedEvents: EventItemInternal[] = divideAllDayEvents(
          event,
          timezone,
          firstDay,
          hideWeekDays
        );
        for (const evt of processedEvents) {
          const weekStart = evt._internal.weekStart;
          if (!weekStart) {
            continue;
          }

          if (!groupedAllDayEventsByWeek[weekStart]) {
            groupedAllDayEventsByWeek[weekStart] = [];
          }
          groupedAllDayEventsByWeek[weekStart]!.push(evt);
        }
      }

      // Process all-day events
      const packedAllDayEvents: Record<string, PackedAllDayEvent[]> = {};
      const packedAllDayEventsByDay: Record<string, PackedAllDayEvent[]> = {};
      const eventCountsByWeek: Record<string, number> = {};
      const eventCountsByDay: Record<string, number> = {};
      for (const weekStart in groupedAllDayEventsByWeek) {
        const eventsForWeek = groupedAllDayEventsByWeek[weekStart]!;
        const weekStartDate = Number(weekStart);
        const weekEndDate = weekStartDate + 7 * MILLISECONDS_IN_DAY - 1;
        const visibleDays: number[] = [];
        for (
          let currentDayUnix = weekStartDate;
          currentDayUnix <= weekEndDate;
          currentDayUnix += MILLISECONDS_IN_DAY
        ) {
          const dateTime = parseDateTime(currentDayUnix, { zone: timezone });
          const weekday = dateTime.weekday;
          if (!hideWeekDays.includes(weekday)) {
            visibleDays.push(currentDayUnix);
          }
        }

        const { packedEvents, maxRowCount } = populateAllDayEvents(
          eventsForWeek,
          {
            startDate: weekStartDate,
            endDate: weekEndDate,
            timezone,
            visibleDays,
          }
        );
        for (const event of packedEvents) {
          if (!packedAllDayEvents[weekStart]) {
            packedAllDayEvents[weekStart] = [];
          }
          packedAllDayEvents[weekStart]!.push(event);

          const eventStart = event._internal.startUnix;
          const eventEnd = event._internal.endUnix;

          for (
            let day = eventStart;
            day <= eventEnd;
            day = day += MILLISECONDS_IN_DAY
          ) {
            if (visibleDays.includes(day)) {
              eventCountsByDay[day] = (eventCountsByDay[day] || 0) + 1;
              if (!packedAllDayEventsByDay[day]) {
                packedAllDayEventsByDay[day] = [];
              }
              packedAllDayEventsByDay[day]!.push(event);
            }
          }
        }
        eventCountsByWeek[weekStart] = maxRowCount;
      }

      eventStore.setState({
        regularEvents: packedRegularEvents,
        allDayEvents: packedAllDayEvents,
        allDayEventsByDay: packedAllDayEventsByDay,
        eventCountsByDay,
        eventCountsByWeek,
      });
    },
    [events, firstDay, hideWeekDays, pagesPerSide, timezone, useAllDayEvent]
  );

  useEffect(() => {
    notifyDataChanged(currentStartDate);
  }, [events, notifyDataChanged, currentStartDate]);

  return (
    <EventsContext.Provider value={eventStore}>
      {children}
    </EventsContext.Provider>
  );
};

export default EventsProvider;

export const useAllDayEvents = (
  date: number,
  numberOfDays: number,
  visibleDays: Record<number, { unix: number }>
) => {
  const eventsContext = useContext(EventsContext);

  const selectorByDate = useCallback(
    (state: EventsState) => {
      let data: PackedAllDayEvent[] = [];
      let eventCounts: Record<string, number> = {};
      const totalDays = numberOfDays === 1 ? 1 : 7;
      for (let i = 0; i < totalDays; i++) {
        const dateUnix = date + i * MILLISECONDS_IN_DAY;
        if (visibleDays[dateUnix]) {
          const events = state.allDayEvents[dateUnix];
          const count = state.eventCountsByDay[dateUnix];
          if (count) {
            eventCounts[dateUnix] = count;
          }
          if (events) {
            data.push(...events);
          }
        }
      }

      return { data, eventCounts };
    },
    [date, numberOfDays, visibleDays]
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

export const useAllDayEventsByDay = (date: number) => {
  const eventsContext = useContext(EventsContext);

  const selectorByDate = useCallback(
    (state: EventsState) => {
      const events = state.allDayEventsByDay[date] ?? [];
      const eventCounts = state.eventCountsByDay[date] ?? 0;

      return { data: events, eventCounts };
    },
    [date]
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

export const useRegularEvents = (
  date: number,
  numberOfDays: number,
  visibleDays: Record<string, { diffDays: number; unix: number }>
) => {
  const eventsContext = useContext(EventsContext);

  const selectorByDate = useCallback(
    (state: EventsState) => {
      let data: PackedEvent[] = [];
      const totalDays = numberOfDays === 1 ? 1 : 7;
      for (let i = 0; i < totalDays; i++) {
        const dateUnix = date + i * MILLISECONDS_IN_DAY;
        if (visibleDays[dateUnix]) {
          const events = state.regularEvents[dateUnix];
          if (events) {
            data.push(...events);
          }
        }
      }

      return { data };
    },
    [date, numberOfDays, visibleDays]
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

export const useEventCountsByWeek = (type: 'week' | 'day') => {
  const eventsContext = useContext(EventsContext);

  const selectEventCountByWeek = useCallback(
    () =>
      type === 'week'
        ? eventsContext?.getState().eventCountsByWeek ?? {}
        : eventsContext?.getState().eventCountsByDay ?? {},
    [eventsContext, type]
  );

  if (!eventsContext) {
    throw new Error('useRegularEvents must be used within a EventsProvider');
  }

  const state = useSyncExternalStoreWithSelector(
    eventsContext.subscribe,
    eventsContext.getState,
    selectEventCountByWeek
  );
  return state;
};
