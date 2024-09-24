import { DateTime, WeekdayNumbers } from 'luxon';
import {
  MILLISECONDS_IN_DAY,
  MILLISECONDS_IN_MINUTE,
  MINUTES_IN_DAY,
} from '../constants';
import type {
  EventItem,
  EventItemInternal,
  PackedAllDayEvent,
  PackedEvent,
} from '../types';
import { forceUpdateZone, parseDateTime, startOfWeek } from './dateUtils';
import { RRuleGenerator } from '../service/rrule';

const isValidEventDates = (event: EventItem): boolean => {
  return (
    !!(event.start.date && event.end.date) ||
    !!(event.start.dateTime && event.end.dateTime)
  );
};

const getEventTimes = (
  event: EventItem
): { eventStartUnix: number; eventEndUnix: number; isAllDay: boolean } => {
  const isAllDay = Boolean(event.start.date && event.end.date);

  if (isAllDay) {
    const eventStartUnix = parseDateTime(event.start.date).toMillis();
    const eventEndUnix = parseDateTime(event.end.date).endOf('day').toMillis();
    return { eventStartUnix, eventEndUnix, isAllDay };
  } else {
    const eventStartUnix = parseDateTime(event.start.dateTime!, {
      zone: event.start.timeZone,
    }).toMillis();
    const eventEndUnix = parseDateTime(event.end.dateTime!, {
      zone: event.end.timeZone,
    }).toMillis();
    return { eventStartUnix, eventEndUnix, isAllDay };
  }
};

const isValidEventRange = (
  eventStartUnix: number,
  eventEndUnix: number,
  minUnix: number,
  maxUnix: number
): boolean => {
  return (
    eventEndUnix > eventStartUnix &&
    eventEndUnix > minUnix &&
    eventStartUnix < maxUnix
  );
};

const createInternalEvent = (
  event: EventItem,
  startUnix: number,
  endUnix: number,
  duration: number
): EventItemInternal => {
  return {
    ...event,
    localId: event.id,
    _internal: {
      startUnix,
      endUnix,
      duration,
      index: 0,
    },
  };
};

export type FilteredEvents = {
  allDays: EventItemInternal[];
  regular: EventItemInternal[];
};

export const filterEvents = (
  events: EventItem[],
  minUnix: number,
  maxUnix: number,
  useAllDayEvent?: boolean
): FilteredEvents => {
  const allDays: EventItemInternal[] = [];
  const regular: EventItemInternal[] = [];

  for (const event of events) {
    if (!isValidEventDates(event)) {
      console.warn('Event has invalid date or dateTime', event);
      continue;
    }

    const { eventStartUnix, eventEndUnix, isAllDay } = getEventTimes(event);
    if (
      !isValidEventRange(eventStartUnix, eventEndUnix, minUnix, maxUnix) &&
      !event.recurrence
    ) {
      continue;
    }

    const duration = (eventEndUnix - eventStartUnix) / MILLISECONDS_IN_MINUTE;
    const customEvent: EventItemInternal = createInternalEvent(
      event,
      eventStartUnix,
      eventEndUnix,
      duration
    );

    if (useAllDayEvent && (isAllDay || duration >= MINUTES_IN_DAY)) {
      allDays.push(customEvent);
    } else {
      regular.push(customEvent);
    }
  }

  return { allDays, regular };
};

export const buildInstanceId = (id: string, date: DateTime) => {
  return `${id}_${date.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'")}`;
};

export const divideEvents = (
  event: EventItemInternal,
  timeZone?: string,
  minRegularEventMinutes?: number
) => {
  let events: EventItemInternal[] = [];
  const eventStart = parseDateTime(event.start.dateTime, {
    zone: event.start.timeZone,
  }).setZone(timeZone);
  const eventEnd = parseDateTime(event.end.dateTime, {
    zone: event.end.timeZone,
  }).setZone(timeZone);

  const startDayOfEventStart = eventStart.startOf('day');
  const startDayOfEventEnd = eventEnd.startOf('day');
  const days = startDayOfEventEnd.diff(startDayOfEventStart, 'days').days + 1;
  for (let i = 0; i < days; i++) {
    let startUnix = forceUpdateZone(eventStart).toMillis();
    let endUnix = forceUpdateZone(eventEnd).toMillis();
    let startMinutes = eventStart.hour * 60 + eventStart.minute;

    const dateObj = parseDateTime(startUnix + i * MILLISECONDS_IN_DAY);
    let id = event.localId;
    if (days > 1) {
      if (i === 0) {
        id = `${event.localId}_${startUnix}`;
        endUnix = dateObj.endOf('day').toMillis();
      } else {
        startUnix = dateObj.startOf('day').toMillis();
        startMinutes = 0;
        if (i !== days - 1) {
          endUnix = dateObj.endOf('day').toMillis();
        }
        id = `${event.localId}_${startUnix}`;
      }
    }
    let duration = (endUnix - startUnix) / MILLISECONDS_IN_MINUTE;
    if (minRegularEventMinutes && duration < minRegularEventMinutes) {
      duration = minRegularEventMinutes;
      endUnix = startUnix + duration * MILLISECONDS_IN_MINUTE;
    }
    const nextEvent: EventItemInternal = {
      ...event,
      localId: id,
      _internal: {
        ...event._internal,
        startUnix,
        endUnix,
        duration,
        startMinutes,
      },
    };
    events.push(nextEvent);
  }

  return events;
};

const calculateVisibleDuration = (
  startUnix: number,
  endUnix: number,
  timeZone: string,
  hideWeekDays: WeekdayNumbers[]
) => {
  let duration = 0;
  for (
    let currentUnix = startUnix;
    currentUnix <= endUnix;
    currentUnix += MILLISECONDS_IN_DAY
  ) {
    const dateTime = parseDateTime(currentUnix, { zone: timeZone });
    if (!hideWeekDays.includes(dateTime.weekday as WeekdayNumbers)) {
      duration++;
    }
  }
  return duration;
};

export const divideAllDayEvents = (
  event: EventItemInternal,
  timeZone: string,
  firstDay: WeekdayNumbers,
  hideWeekDays: WeekdayNumbers[]
) => {
  let events: EventItemInternal[] = [];
  let eventStart = parseDateTime(event._internal.startUnix);
  let eventEnd = parseDateTime(event._internal.endUnix);
  if (event.start.dateTime) {
    eventStart = parseDateTime(event._internal.startUnix, {
      zone: event.start.timeZone,
    }).setZone(timeZone);
  }
  if (event.end.dateTime) {
    eventEnd = parseDateTime(event._internal.endUnix, {
      zone: event.end.timeZone,
    }).setZone(timeZone);
  }

  eventStart = forceUpdateZone(eventStart);
  eventEnd = forceUpdateZone(eventEnd);

  const weekStartUnix = startOfWeek(
    eventStart.toISODate(),
    firstDay
  ).toMillis();
  const weekEndUnix = startOfWeek(eventEnd.toISODate(), firstDay).toMillis();
  const diffWeeks =
    Math.floor((weekEndUnix - weekStartUnix) / (7 * MILLISECONDS_IN_DAY)) + 1;
  const isSameDay = event._internal.startUnix === event._internal.endUnix;
  let eventStartUnix = eventStart.startOf('day').toMillis();
  const eventEndUnix = isSameDay
    ? eventStart.endOf('day').toMillis()
    : parseDateTime(eventEnd.toMillis() - 1)
        .endOf('day')
        .toMillis();

  if (diffWeeks <= 1) {
    // Adjust duration to exclude hidden days
    const duration = calculateVisibleDuration(
      eventStartUnix,
      eventEndUnix,
      timeZone,
      hideWeekDays
    );

    if (duration > 0) {
      events.push({
        ...event,
        _internal: {
          ...event._internal,
          startUnix: eventStartUnix,
          endUnix: eventEndUnix,
          duration,
          weekStart: weekStartUnix,
        },
      });
    }
    return events;
  }

  for (let i = 0; i < diffWeeks; i++) {
    const weekStart = weekStartUnix + 7 * MILLISECONDS_IN_DAY * i;

    let nextWeekStart = weekStart + 7 * MILLISECONDS_IN_DAY - 1;
    if (eventEndUnix < nextWeekStart) {
      nextWeekStart = eventEndUnix;
    }
    const duration = calculateVisibleDuration(
      eventStartUnix,
      nextWeekStart,
      timeZone,
      hideWeekDays
    );

    if (duration > 0) {
      const newEvent = {
        ...event,
        localId: `${event.localId}_${weekStart}`,
        _internal: {
          ...event._internal,
          startUnix: eventStartUnix,
          endUnix: nextWeekStart,
          duration,
          weekStart,
        },
      };
      events.push(newEvent);
    }
    eventStartUnix = nextWeekStart + 1;
  }

  return events;
};

// Helper function to process event occurrences
export function processEventOccurrences(
  event: EventItemInternal,
  minUnix: number,
  maxUnix: number,
  timeZone: string,
  divideFunction: (
    event: EventItemInternal,
    timeZone: string
  ) => EventItemInternal[]
): EventItemInternal[] {
  if (event.recurrence) {
    const rrule = new RRuleGenerator(
      event.recurrence,
      parseDateTime(event.start.dateTime || event.start.date, {
        zone: event.start.timeZone,
      }),
      event.excludeDates
    );

    const occurrences = rrule.generateOccurrences(
      parseDateTime(minUnix, { zone: timeZone }),
      parseDateTime(maxUnix, { zone: timeZone })
    );
    const firstOccurrence = rrule.firstOccurrence(event.start.timeZone);

    const duration = event._internal.duration;
    const {
      recurrence: originalRrule,
      excludeDates,
      _internal,
      ...rest
    } = event;
    return occurrences.flatMap((occurrence) => {
      let eventStart = occurrence;
      if (event.start.dateTime) {
        eventStart = parseDateTime(occurrence, {
          zone: event.start.timeZone,
        });
      }
      const eventEnd = eventStart
        .plus({ minutes: duration })
        .setZone(event.end.timeZone);
      const instanceId = buildInstanceId(event.id, eventStart.toUTC());
      const recurringEvent: EventItemInternal = {
        ...rest,
        start: event.start.dateTime
          ? { dateTime: eventStart.toISO(), timeZone: eventStart.zoneName }
          : { date: eventStart.toISODate() },
        end: event.end.dateTime
          ? {
              dateTime: eventEnd.toISO(),
              timeZone: eventEnd.zoneName,
            }
          : { date: eventEnd.toISODate() },
        id: instanceId,
        localId: instanceId,
        originalStartTime: event.start.dateTime
          ? { dateTime: eventStart.toISO(), timeZone: eventStart.zoneName }
          : { date: eventStart.toISODate() },
        isFirstOccurrence:
          firstOccurrence?.toMillis() === eventStart.toMillis(),
        _internal: {
          ..._internal,
          startUnix: eventStart.toMillis(),
          endUnix: eventEnd.toMillis(),
        },
        originalRecurringEvent: {
          ...rest,
          recurrence: originalRrule,
          excludeDates: [...(excludeDates || []), eventStart.toUTC().toISO()],
        },
      };
      return divideFunction(recurringEvent, timeZone);
    });
  } else {
    return divideFunction(event, timeZone);
  }
}

// Helper function to process all-day events
export function processAllDayEventMap(
  allDayEventMap: Map<number, EventItemInternal[]>,
  timeZone: string,
  hideWeekDays: WeekdayNumbers[]
) {
  const packedAllDayEvents: Record<string, PackedAllDayEvent[]> = {};
  const packedAllDayEventsByDay: Record<string, PackedAllDayEvent[]> = {};
  const eventCountsByWeek: Record<string, number> = {};
  const eventCountsByDay: Record<string, number> = {};

  allDayEventMap.forEach((eventsForWeek, weekStart) => {
    const visibleDays: number[] = getVisibleDays(
      weekStart,
      timeZone,
      hideWeekDays
    );

    const { packedEvents, maxRowCount } = populateAllDayEvents(eventsForWeek, {
      startDate: weekStart,
      endDate: weekStart + 7 * MILLISECONDS_IN_DAY - 1,
      timeZone,
      visibleDays,
    });

    packedAllDayEvents[weekStart] = packedEvents;
    eventCountsByWeek[weekStart] = maxRowCount;

    packedEvents.forEach((event) => {
      const eventStart = event._internal.startUnix;
      const eventEnd = event._internal.endUnix;

      for (let day = eventStart; day <= eventEnd; day += MILLISECONDS_IN_DAY) {
        if (visibleDays.includes(day)) {
          eventCountsByDay[day] = (eventCountsByDay[day] || 0) + 1;
          if (!packedAllDayEventsByDay[day]) {
            packedAllDayEventsByDay[day] = [];
          }
          packedAllDayEventsByDay[day]!.push(event);
        }
      }
    });
  });

  return {
    packedAllDayEvents,
    packedAllDayEventsByDay,
    eventCountsByWeek,
    eventCountsByDay,
  };
}

// Helper function to get visible days
export function getVisibleDays(
  weekStart: number,
  timeZone: string,
  hideWeekDays: WeekdayNumbers[]
): number[] {
  const visibleDays: number[] = [];
  for (
    let currentDayUnix = weekStart;
    currentDayUnix < weekStart + 7 * MILLISECONDS_IN_DAY;
    currentDayUnix += MILLISECONDS_IN_DAY
  ) {
    const dateTime = parseDateTime(currentDayUnix, { zone: timeZone });
    const weekday = dateTime.weekday;
    if (!hideWeekDays.includes(weekday)) {
      visibleDays.push(currentDayUnix);
    }
  }
  return visibleDays;
}

const hasCollision = (a: EventItemInternal, b: EventItemInternal) => {
  return (
    a._internal.endUnix > b._internal.startUnix &&
    a._internal.startUnix < b._internal.endUnix
  );
};

export const populateEvents = (events: EventItemInternal[]) => {
  if (!events.length) {
    return [];
  }

  const sortedEvents = events.slice().sort((a, b) => {
    if (a._internal.startUnix !== b._internal.startUnix) {
      return a._internal.startUnix - b._internal.startUnix;
    }
    return a._internal.endUnix - b._internal.endUnix;
  });

  const eventColumns: EventItemInternal[][] = [];
  const packedEvents: PackedEvent[] = [];

  for (const event of sortedEvents) {
    let placed = false;
    for (let i = 0; i < eventColumns.length; i++) {
      const column = eventColumns[i]!;
      if (!hasCollision(column[column.length - 1]!, event)) {
        column.push(event);
        event._internal.index = i;
        placed = true;
        break;
      }
    }

    if (!placed) {
      eventColumns.push([event]);
      event._internal.index = eventColumns.length - 1;
    }
  }

  const maxColumns = eventColumns.length;

  for (const event of sortedEvents) {
    const colIndex = event._internal.index;
    if (colIndex === undefined) {
      continue;
    }
    let colSpan = 1;

    for (let i = colIndex + 1; i < maxColumns; i++) {
      const column = eventColumns[i];
      if (!column) {
        continue;
      }
      const hasOverlap = column.some((e) => hasCollision(event, e));
      if (hasOverlap) {
        break;
      }
      colSpan++;
    }

    packedEvents.push({
      ...event,
      _internal: {
        ...event._internal,
        total: maxColumns,
        columnSpan: colSpan,
      },
    });
  }

  return packedEvents;
};

export const sortAllDayEvents = (
  events: EventItemInternal[]
): EventItemInternal[] => {
  return events.slice().sort((a, b) => {
    // Compare by start time
    if (a._internal.startUnix !== b._internal.startUnix) {
      return a._internal.startUnix - b._internal.startUnix;
    }

    // Compare by duration (longer duration comes first)
    const durationA = a._internal.endUnix - a._internal.startUnix;
    const durationB = b._internal.endUnix - b._internal.startUnix;
    if (durationA !== durationB) {
      return durationB - durationA;
    }

    // Compare by title
    const titleA = a.title || '';
    const titleB = b.title || '';
    return titleA.localeCompare(titleB);
  });
};

interface PopulateAllDayOptions {
  startDate: number;
  endDate: number;
  timeZone: string;
  visibleDays: number[];
}
interface PopulateAllDayResult {
  packedEvents: PackedAllDayEvent[];
  maxRowCount: number;
}
export const populateAllDayEvents = (
  events: EventItemInternal[],
  options: PopulateAllDayOptions
): PopulateAllDayResult => {
  const sortedEvents = sortAllDayEvents(events);
  const rows: EventItemInternal[][] = [];
  const dateToIndexMap: Record<string, number> = {};

  options.visibleDays.forEach((dateUnix, index) => {
    dateToIndexMap[dateUnix] = index;
  });

  for (const event of sortedEvents) {
    let placed = false;
    for (const row of rows) {
      if (!row.some((e) => hasCollision(e, event))) {
        row.push(event);
        placed = true;
        break;
      }
    }
    if (!placed) {
      rows.push([event]);
    }
  }

  const packedEvents: PackedAllDayEvent[] = [];
  rows.forEach((row, rowIndex) => {
    for (const event of row) {
      const eventStart = event._internal.startUnix;
      const eventEnd = event._internal.endUnix;

      // Collect the visible days the event spans
      const eventVisibleDays: number[] = [];
      for (let day = eventStart; day <= eventEnd; day += MILLISECONDS_IN_DAY) {
        if (dateToIndexMap.hasOwnProperty(day)) {
          eventVisibleDays.push(day);
        }
      }

      if (eventVisibleDays.length === 0) {
        // Event does not span any visible days, skip it
        continue;
      }

      const adjustedStartStr = eventVisibleDays[0];
      const adjustedEndStr = eventVisibleDays[eventVisibleDays.length - 1];

      const startIndex = dateToIndexMap[adjustedStartStr!]!;
      const endIndex = dateToIndexMap[adjustedEndStr!]!;

      const columnSpan = endIndex - startIndex + 1;

      const packedEvent: PackedAllDayEvent = {
        ...event,
        _internal: {
          ...event._internal,
          rowIndex,
          startIndex,
          columnSpan,
        },
      };
      packedEvents.push(packedEvent);
    }
  });
  const maxRowCount = rows.length;
  return { packedEvents, maxRowCount };
};
