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

export const filterEvents = (
  events: EventItem[],
  minUnix: number,
  maxUnix: number,
  useAllDayEvent?: boolean
) => {
  const allDays: EventItemInternal[] = [];
  const regular: EventItemInternal[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i]!;
    const eventStartUnix = parseDateTime(event.start).toMillis();
    const eventEndUnix = parseDateTime(event.end).toMillis();
    let isValidDate = eventEndUnix <= eventStartUnix;
    if (event.isAllDay) {
      isValidDate = eventEndUnix < eventStartUnix;
    }
    if (isValidDate || eventEndUnix <= minUnix || eventStartUnix >= maxUnix) {
      continue;
    }

    const duration = (eventEndUnix - eventStartUnix) / MILLISECONDS_IN_MINUTE;
    const customEvent: EventItemInternal = {
      ...event,
      _internal: {
        startUnix: eventStartUnix,
        endUnix: eventEndUnix,
        originalStartUnix: eventStartUnix,
        originalEndUnix: eventEndUnix,
        duration,
        id: event.id,
        index: 0,
      },
    };

    if (useAllDayEvent && (event.isAllDay || duration >= MINUTES_IN_DAY)) {
      allDays.push(customEvent);
    } else {
      regular.push(customEvent);
    }
  }

  return { allDays, regular };
};

const buildInstanceId = (id: string, date: DateTime<true>) => {
  const dateStr = [
    padStart(date.year, 4, '0'),
    padStart(date.month, 2, '0'),
    padStart(date.day, 2, '0'),
    'T',
    padStart(date.hour, 2, '0'),
    padStart(date.minute, 2, '0'),
    padStart(date.second, 2, '0'),
    'Z',
  ].join('');

  return `${id}_${dateStr}`;
};

export const divideEvents = (event: EventItemInternal, timezone: string) => {
  let events: EventItemInternal[] = [];
  const eventStart = parseDateTime(event._internal.startUnix, {
    zone: timezone,
  });
  const eventEnd = parseDateTime(event._internal.endUnix, {
    zone: timezone,
  });
  const startOfEventStart = eventStart.startOf('day');
  const startOfEventEnd = eventEnd.startOf('day');
  const days = startOfEventEnd.diff(startOfEventStart, 'days').days + 1;
  for (let i = 0; i < days; i++) {
    let startUnix = forceUpdateZone(eventStart).toMillis();
    let endUnix = forceUpdateZone(eventEnd).toMillis();
    let startMinutes = eventStart.hour * 60 + eventStart.minute;

    const dateObj = parseDateTime(startUnix + i * MILLISECONDS_IN_DAY);
    let id = event.id;
    if (days > 1) {
      if (i === 0) {
        id = buildInstanceId(event.id, dateObj.toUTC());
        endUnix = dateObj.endOf('day').toMillis();
      } else {
        startUnix = dateObj.startOf('day').toMillis();
        startMinutes = 0;
        if (i !== days - 1) {
          endUnix = dateObj.endOf('day').toMillis();
        }
        id = buildInstanceId(
          event.id,
          parseDateTime(dateObj.startOf('day')).toUTC()
        );
      }
    }
    const duration = (endUnix - startUnix) / MILLISECONDS_IN_MINUTE;
    const nextEvent: EventItemInternal = {
      ...event,
      _internal: {
        ...event._internal,
        id,
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

export const divideAllDayEvents = (
  event: EventItemInternal,
  timezone: string,
  firstDay: WeekdayNumbers,
  hideWeekDays: WeekdayNumbers[]
) => {
  let events: EventItemInternal[] = [];
  const eventStart = forceUpdateZone(
    parseDateTime(event._internal.startUnix, {
      zone: timezone,
    })
  );
  const eventEnd = forceUpdateZone(
    parseDateTime(event._internal.endUnix, {
      zone: timezone,
    })
  );

  const startUnix = startOfWeek(eventStart.toISODate(), firstDay).toMillis();
  const endUnix = startOfWeek(eventEnd.toISODate(), firstDay).toMillis();
  const diffWeeks =
    Math.floor((endUnix - startUnix) / (7 * MILLISECONDS_IN_DAY)) + 1;
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
      timezone,
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
          weekStart: startUnix,
        },
      });
    }
    return events;
  }

  for (let i = 0; i < diffWeeks; i++) {
    const weekStart = startUnix + 7 * MILLISECONDS_IN_DAY * i;

    let nextWeekStart = weekStart + 7 * MILLISECONDS_IN_DAY - 1;
    if (eventEndUnix < nextWeekStart) {
      nextWeekStart = eventEndUnix;
    }
    const duration = calculateVisibleDuration(
      eventStartUnix,
      nextWeekStart,
      timezone,
      hideWeekDays
    );

    if (duration > 0) {
      const newEvent = {
        ...event,
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

// Helper function to calculate visible duration
const calculateVisibleDuration = (
  startUnix: number,
  endUnix: number,
  timezone: string,
  hideWeekDays: WeekdayNumbers[]
) => {
  let duration = 0;
  let currentUnix = startUnix;
  while (currentUnix <= endUnix) {
    const dateTime = parseDateTime(currentUnix, { zone: timezone });
    const weekday = dateTime.weekday as WeekdayNumbers;
    if (!hideWeekDays.includes(weekday)) {
      duration += 1;
    }
    currentUnix += MILLISECONDS_IN_DAY;
  }
  return duration;
};

const padStart = (value: number, length: number, pad: string) => {
  return value.toString().padStart(length, pad);
};

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

  // Sort events by start time
  const sortedEvents = events
    .slice()
    .sort((a, b) => a._internal.startUnix - b._internal.startUnix);

  // Assign events to columns
  const eventColumns: EventItemInternal[][] = [];

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

  // Calculate column spans
  const packedEvents: PackedEvent[] = [];

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
  timezone: string;
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
