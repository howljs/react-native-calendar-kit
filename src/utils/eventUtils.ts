import { DateTime } from 'luxon';
import { RRuleSet, rrulestr } from 'rrule';
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
import {
  diffDays,
  forceUpdateZone,
  parseDate,
  parseDateTime,
} from './dateUtils';

export const filterEvents = (
  events: EventItem[],
  minUnix: number,
  maxUnix: number,
  useAllDayEvent?: boolean
) => {
  let allDays: EventItemInternal[] = [],
    regular: EventItemInternal[] = [];
  for (let i = 0; i < events.length; i++) {
    const event = events[i]!;
    const eventStart = parseDateTime(event.start).toMillis();
    const eventEnd = parseDateTime(event.end).toMillis();
    const isValidDate = eventEnd > eventStart;
    if (!isValidDate) {
      continue;
    }

    const isValidRange = eventEnd > minUnix && eventStart < maxUnix;
    if (!isValidRange && !event.recurrenceRule) {
      continue;
    }

    const duration = (eventEnd - eventStart) / MILLISECONDS_IN_MINUTE;
    const customEvent: EventItemInternal = {
      ...event,
      _internal: {
        startUnix: eventStart,
        endUnix: eventEnd,
        originalStartUnix: eventStart,
        originalEndUnix: eventEnd,
        duration,
        id: event.id,
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

export const divideEvents = (event: EventItemInternal, timeZone: string) => {
  let events: EventItemInternal[] = [];
  const eventStart = parseDateTime(event._internal.startUnix, {
    zone: timeZone,
  });
  const eventEnd = parseDateTime(event._internal.endUnix, {
    zone: timeZone,
  });
  const startOfEventStart = eventStart.startOf('day');
  const startOfEventEnd = eventEnd.startOf('day');
  const days = diffDays(startOfEventEnd, startOfEventStart) + 1;
  for (let i = 0; i < days; i++) {
    let startUnix = forceUpdateZone(eventStart).toMillis();
    let endUnix = forceUpdateZone(eventEnd).toMillis();
    let startMinutes = eventStart.hour * 60 + eventStart.minute;

    const dateObj = parseDateTime(startUnix + i * MILLISECONDS_IN_DAY);
    let id = event.recurrenceRule
      ? buildInstanceId(event.id, dateObj.toUTC())
      : event.id;

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

const padStart = (value: number, length: number, pad: string) => {
  return value.toString().padStart(length, pad);
};

export const processRecurrenceEvent = (
  event: EventItemInternal,
  minUnix: number,
  maxUnix: number,
  timeZone: string,
  isAllDay: boolean = false
) => {
  let events: EventItemInternal[] = [];
  if (!event.recurrenceRule) {
    return events;
  }

  if (event.recurrenceRule?.startsWith('DTSTART')) {
    console.warn('DTSTART is not supported in recurrenceRule');
    return events;
  }

  const parsedRRule = rrulestr(event.recurrenceRule, {
    dtstart: parseDateTime(event.start, { zone: 'utc' }).toJSDate(),
  });

  const newRRule = new RRuleSet();
  newRRule.rrule(parsedRRule);
  event.recurrenceExdates?.forEach((exDate) => {
    newRRule.exdate(parseDate(exDate));
  });
  const minDate = parseDateTime(minUnix).toJSDate();
  const maxDate = parseDateTime(maxUnix).toJSDate();
  const occurrences = parsedRRule.between(minDate, maxDate, true);
  for (let i = 0; i < occurrences.length; i++) {
    const occurrence = occurrences[i]!;
    const parsedStartDate = parseDateTime(occurrence, { zone: timeZone }).set({
      day: occurrence.getUTCDate(),
      month: occurrence.getUTCMonth() + 1,
      year: occurrence.getUTCFullYear(),
    });
    const parsedEndDate = parsedStartDate.plus({
      minutes: event._internal.duration,
    });
    const nextEvent: EventItemInternal = {
      ...event,
      originalStart: event.start,
      originalEnd: event.end,
      start: parsedStartDate.toUTC().toISO(),
      end: parsedEndDate.toUTC().toISO(),
      _internal: {
        ...event._internal,
        startUnix: parsedStartDate.toMillis(),
        endUnix: parsedEndDate.toMillis(),
      },
    };

    if (!isAllDay) {
      const nextEvents = divideEvents(nextEvent, timeZone);
      events = [...events, ...nextEvents];
    }
  }

  return events;
};

const hasCollision = (a: EventItemInternal, b: EventItemInternal) => {
  return (
    a._internal.endUnix > b._internal.startUnix &&
    a._internal.startUnix < b._internal.endUnix
  );
};

const calcColumnSpan = (
  event: EventItemInternal,
  columnIndex: number,
  columns: EventItemInternal[][]
) => {
  let colSpan = 1;
  for (let i = columnIndex + 1; i < columns.length; i++) {
    const column = columns[i]!;
    const foundCollision = column.find((ev) => hasCollision(event, ev));
    if (foundCollision) {
      return colSpan;
    }
    colSpan++;
  }
  return colSpan;
};

const packOverlappingEventGroup = (
  columns: EventItemInternal[][],
  calculatedEvents: PackedEvent[]
) => {
  columns.forEach((column, columnIndex) => {
    column.forEach((event) => {
      const columnSpan = calcColumnSpan(event, columnIndex, columns);
      calculatedEvents.push({
        ...event,
        _internal: {
          ...event._internal,
          index: columnIndex,
          total: columns.length,
          columnSpan,
        },
      });
    });
  });
};

const sortEvents = (events: EventItemInternal[]) =>
  events.sort(
    (a, b) =>
      a._internal.startUnix - b._internal.startUnix ||
      a._internal.endUnix - b._internal.endUnix
  );

export const populateEvents = (events: EventItemInternal[]) => {
  let lastEnd: number | null = null;
  let columns: EventItemInternal[][] = [];
  let packedEvents: PackedEvent[] = [];
  const clonedEvents = [...events];
  sortEvents(clonedEvents);
  clonedEvents.forEach(function (ev) {
    const eventStart = ev._internal.startUnix;
    const eventEnd = ev._internal.endUnix;

    if (lastEnd !== null && eventStart >= lastEnd) {
      packOverlappingEventGroup(columns, packedEvents);
      columns = [];
      lastEnd = null;
    }

    let placed = false;
    for (let col of columns) {
      if (!hasCollision(col[col.length - 1]!, ev)) {
        col.push(ev);
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([ev]);
    }

    if (lastEnd === null || eventEnd > lastEnd) {
      lastEnd = eventEnd;
    }
  });
  if (columns.length > 0) {
    packOverlappingEventGroup(columns, packedEvents);
  }

  return packedEvents;
};

export const sortAllDayEvents = (events: EventItemInternal[]) => {
  return [...events].sort((a, b) => {
    const startCompare = a._internal.startUnix - b._internal.startUnix;

    if (startCompare !== 0) {
      return startCompare;
    }

    const durationA = a._internal.endUnix - a._internal.startUnix;
    const durationB = b._internal.endUnix - b._internal.startUnix;
    if (durationA !== durationB) {
      return durationB - durationA;
    }

    const aTitle = a.title || '';
    const bTitle = b.title || '';
    return aTitle.localeCompare(bTitle);
  });
};

interface PopulateAllDayOptions {
  startDate: number;
}

export const populateAllDayEvents = (
  packedAllDayEvents: Record<string, PackedAllDayEvent[]> = {},
  eventCount: Record<string, number>,
  eventCountByWeek: Record<string, number>,
  events: EventItemInternal[],
  options: PopulateAllDayOptions
) => {
  let rows: EventItemInternal[][] = [];
  const sortedEvents = sortAllDayEvents([...events]);

  sortedEvents.forEach(function (ev) {
    let placed = false;
    for (let row of rows) {
      if (!hasCollision(row[row.length - 1]!, ev)) {
        row.push(ev);
        placed = true;
        break;
      }
    }

    if (!placed) {
      rows.push([ev]);
    }
  });

  if (rows.length > 0) {
    rows.forEach((row, rowIndex) => {
      row.forEach((event, columnIndex) => {
        const totalDays = Math.floor(event._internal.duration / MINUTES_IN_DAY);
        const startUnix = event._internal.startUnix;
        const startIndex = Math.floor(
          (startUnix - options.startDate) / MILLISECONDS_IN_DAY
        );

        for (let i = 0; i < totalDays; i++) {
          const nextEvent: PackedAllDayEvent = {
            ...event,
            _internal: {
              ...event._internal,
              rowIndex,
              columnIndex,
              totalColumns: row.length,
              startIndex,
            },
          };

          const key = `${startUnix + i * MILLISECONDS_IN_DAY}`;
          eventCount[key] = (eventCount[key] || 0) + 1;
          if (packedAllDayEvents[key]) {
            packedAllDayEvents[key]!.push(nextEvent);
          } else {
            packedAllDayEvents[key] = [nextEvent];
          }
        }
      });

      eventCountByWeek[options.startDate] = Math.max(
        eventCountByWeek[options.startDate] || 0,
        rowIndex + 1
      );
    });
  }
};
