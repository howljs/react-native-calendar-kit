import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { RRuleSet, rrulestr } from 'rrule';

import debounce from 'lodash/debounce';
import { SECONDS_IN_DAY } from '../constants';
import type { EventItem, PackedEvent } from '../types';
import { buildDtStart, dateWithZone } from '../utils/dateUtils';
import { findMaxEvents, populateEvents, sortEvents } from '../utils/eventUtils';
import { useCalendarKit } from './CalendarKitProvider';

export interface EventsControllerValue {
  normalEvents: Record<string, PackedEvent[]>;
  allDayEvents: Record<string, EventItem[]>;
  notifyDataChanged: () => void;
  allDayHeight: SharedValue<number>;
}

const EventsController = createContext<EventsControllerValue | undefined>(
  undefined
);

interface EventsControllerProviderProps {
  events?: EventItem[];
}

const EventsControllerProvider: React.FC<EventsControllerProviderProps> = ({
  events = [],
  children,
}) => {
  const {
    timeZone,
    useAllDayFilter,
    numberOfColumns,
    allDayEventHeight,
    overlapEventsSpacing,
    maxAllDayHeight,
    visibleStartUnix,
    onChangeUnix,
    viewMode,
  } = useCalendarKit();

  const [normalEvents, setNormalEvents] = useState<
    Record<string, PackedEvent[]>
  >({});
  const [allDayEvents, setAllDayEvents] = useState<Record<string, EventItem[]>>(
    {}
  );

  const allDayHeightByDate = useRef<Record<string, number>>({});
  const notifyDataChanged = useCallback(() => {
    allDayHeightByDate.current = {};
    const minUnix = visibleStartUnix.value - 7 * SECONDS_IN_DAY;
    const minDate = new Date(minUnix * 1000);
    const maxUnix = visibleStartUnix.value + 14 * SECONDS_IN_DAY;
    const maxDate = new Date(maxUnix * 1000);

    const clonedEvents = [...events];
    sortEvents(clonedEvents);
    let normal: Record<string, EventItem[]> = {},
      allDay: Record<string, EventItem[]> = {};
    for (let i = 0; i < clonedEvents.length; i++) {
      const event = clonedEvents[i]!;
      if (event.start > maxDate && event.end > maxDate) {
        break;
      }
      if (
        event.start < minDate &&
        event.end < minDate &&
        !event.recurrenceRule
      ) {
        continue;
      }
      const start = dateWithZone(timeZone, event.start);
      const end = dateWithZone(timeZone, event.end);
      const eventStart = Math.floor(start.getTime() / 1000);
      const eventEnd = Math.floor(end.getTime() / 1000);
      const durationInSeconds = eventEnd - eventStart;
      const isAllDay = durationInSeconds >= SECONDS_IN_DAY;

      start.setHours(0, 0, 0, 0);
      const eventStartOfDay = start.getTime() / 1000;
      const diffDays = Math.floor(
        (eventStart - eventStartOfDay + durationInSeconds) / SECONDS_IN_DAY
      );

      if (event.recurrenceRule) {
        const dtStart = buildDtStart(eventStart);
        const rule = rrulestr(`${dtStart};\n${event.recurrenceRule}`, {
          forceset: true,
        }) as RRuleSet;
        event.recurrenceExDates?.forEach((exDate) =>
          rule.exdate(dateWithZone(timeZone, exDate))
        );
        const dates = rule.between(start, new Date(maxUnix * 1000));
        dates.forEach((date) => {
          const dateObj = new Date(date);
          dateObj.setHours(0, 0, 0, 0);
          const rDate = dateObj.getTime() / 1000;
          const diffSeconds = rDate - eventStartOfDay;
          for (let dayIndex = 0; dayIndex <= diffDays; dayIndex++) {
            const startByDayIndex = rDate + dayIndex * SECONDS_IN_DAY;
            const newStart =
              eventStart + diffSeconds + dayIndex * SECONDS_IN_DAY;
            const newEnd = newStart + durationInSeconds;
            const newEvent = {
              ...event,
              id: `${event.id}_${rDate}`,
              startUnix: newStart,
              endUnix: newEnd,
              isAllDay: isAllDay,
              dayIndex: dayIndex,
              totalDays: diffDays + 1,
            };

            if (isAllDay && useAllDayFilter) {
              const prevEvents = allDay[startByDayIndex] || [];
              const newData = [...prevEvents, newEvent];
              allDay[startByDayIndex] = newData;
              allDayHeightByDate.current[startByDayIndex] = newData.length;
            } else {
              const prevEvents = normal[startByDayIndex] || [];
              normal[startByDayIndex] = [...prevEvents, newEvent];
            }
          }
        });
      } else {
        for (let dayIndex = 0; dayIndex <= diffDays; dayIndex++) {
          const dateUnix = eventStartOfDay + dayIndex * SECONDS_IN_DAY;
          const newEvent = {
            ...event,
            startUnix: eventStart,
            endUnix: eventEnd,
            isAllDay: isAllDay,
            dayIndex: dayIndex,
            totalDays: diffDays + 1,
          };
          if (isAllDay && useAllDayFilter) {
            const prevEvents = allDay[dateUnix] || [];
            const newData = [...prevEvents, newEvent];
            allDay[dateUnix] = newData;
            allDayHeightByDate.current[dateUnix] = newData.length;
          } else {
            const prevEvents = normal[dateUnix] || [];
            normal[dateUnix] = [...prevEvents, newEvent];
          }
        }
      }
    }

    const packedEvents: Record<string, PackedEvent[]> = {};
    for (const date in normal) {
      packedEvents[date] = populateEvents(normal[date]!);
    }
    setNormalEvents(packedEvents);
    setAllDayEvents(allDay);
  }, [events, timeZone, useAllDayFilter, visibleStartUnix.value]);

  const timeZoneRef = useRef(timeZone);
  const useAllDayFilterRef = useRef(useAllDayFilter);
  const isMounted = useRef(false);
  useEffect(() => {
    if (
      isMounted.current &&
      timeZoneRef.current === timeZone &&
      useAllDayFilterRef.current === useAllDayFilter
    ) {
      return;
    }
    notifyDataChanged();
    timeZoneRef.current = timeZone;
    useAllDayFilterRef.current = useAllDayFilter;
    isMounted.current = true;
  }, [notifyDataChanged, timeZone, useAllDayFilter]);

  useAnimatedReaction(
    () => visibleStartUnix.value,
    (next, prev) => {
      if (prev !== null && prev !== next) {
        runOnJS(notifyDataChanged)();
      }
    }
  );

  const allDayHeight = useSharedValue(0);

  useEffect(() => {
    if (!useAllDayFilter || numberOfColumns === 1 || viewMode === 'month') {
      return;
    }
    const fromDate = onChangeUnix.value;
    const toDate = fromDate + (numberOfColumns - 1) * SECONDS_IN_DAY;
    const maxEvents = findMaxEvents(
      fromDate,
      toDate,
      allDayHeightByDate.current
    );
    const calcHeight =
      (allDayEventHeight + overlapEventsSpacing) * maxEvents + 4;
    allDayHeight.value = withTiming(
      maxEvents > 0 ? Math.min(calcHeight, maxAllDayHeight) : 0
    );
  }, [
    allDayEventHeight,
    allDayHeight,
    maxAllDayHeight,
    numberOfColumns,
    onChangeUnix,
    overlapEventsSpacing,
    useAllDayFilter,
    viewMode,
  ]);

  const _handleAllDayHeight = debounce((fromDate: number) => {
    const toDate = fromDate + (numberOfColumns - 1) * SECONDS_IN_DAY;
    const maxEvents = findMaxEvents(
      fromDate,
      toDate,
      allDayHeightByDate.current
    );
    const calcHeight =
      (allDayEventHeight + overlapEventsSpacing) * maxEvents + 4;
    allDayHeight.value = withTiming(
      maxEvents > 0 ? Math.min(calcHeight, maxAllDayHeight) : 0
    );
  }, 250);

  useAnimatedReaction(
    () => onChangeUnix.value,
    (next, prev) => {
      if (prev !== null && prev !== next && useAllDayFilterRef.current) {
        runOnJS(_handleAllDayHeight)(next);
      }
    }
  );

  const value = useMemo(
    () => ({
      normalEvents,
      allDayEvents,
      notifyDataChanged,
      allDayHeight,
    }),
    [normalEvents, allDayEvents, notifyDataChanged, allDayHeight]
  );

  return (
    <EventsController.Provider value={value}>
      {children}
    </EventsController.Provider>
  );
};

export default EventsControllerProvider;

export const useEventsController = () => {
  const value = useContext(EventsController);
  if (!value) {
    throw new Error(
      'useEventsController must be called from within EventsControllerProvider!'
    );
  }
  return value;
};
