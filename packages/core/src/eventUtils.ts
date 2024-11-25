import type { DateTime, WeekdayNumbers } from 'luxon';

import {
  DEFAULT_MIN_START_DIFFERENCE,
  MILLISECONDS_IN_DAY,
  MILLISECONDS_IN_MINUTE,
  MINUTES_IN_DAY,
} from './constants';
import { forceUpdateZone, parseDateTime, startOfWeek } from './dateUtils';
import { RRuleGenerator } from './service/rrule';
import type {
  EventItem,
  EventItemInternal,
  NoOverlapEvent,
  OverlapEvent,
  PackedAllDayEvent,
  PackedEvent,
  ResourceItem,
} from './types';

const isValidEventDates = (event: EventItem): boolean => {
  return !!(event.start.date && event.end.date) || !!(event.start.dateTime && event.end.dateTime);
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
    const eventStartUnix = parseDateTime(event.start.dateTime, {
      zone: event.start.timeZone,
    }).toMillis();
    const eventEndUnix = parseDateTime(event.end.dateTime, {
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
  return eventEndUnix > eventStartUnix && eventEndUnix > minUnix && eventStartUnix < maxUnix;
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
    },
  };
};

export type FilteredEvents = {
  allDays: EventItemInternal[];
  regular: EventItemInternal[];
};

export const filterEvents = (
  events: EventItem[],
  useAllDayEvent: boolean,
  minDateUnix: number,
  maxDateUnix: number
) => {
  const result: FilteredEvents = {
    allDays: [],
    regular: [],
  };
  if (!events?.length) {
    return result;
  }

  for (const event of events) {
    if (!isValidEventDates(event)) {
      console.warn('Event has invalid date or dateTime', event);
      continue;
    }

    const { eventStartUnix, eventEndUnix, isAllDay } = getEventTimes(event);
    if (
      !isValidEventRange(eventStartUnix, eventEndUnix, minDateUnix, maxDateUnix) &&
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
      result.allDays.push(customEvent);
    } else {
      result.regular.push(customEvent);
    }
  }

  return result;
};

export const buildInstanceId = (id: string, date: DateTime) => {
  return `${id}_${date.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'")}`;
};

const calculateVisibleDuration = (
  startUnix: number,
  endUnix: number,
  timeZone: string,
  hideWeekDays: WeekdayNumbers[]
) => {
  let duration = 0;
  let currentUnix = startUnix;

  while (currentUnix <= endUnix) {
    const dateTime = parseDateTime(currentUnix, { zone: timeZone });
    const weekday = dateTime.weekday;
    if (!hideWeekDays.includes(weekday)) {
      duration++;
    }
    currentUnix = dateTime.plus({ days: 1 }).toMillis();
  }
  return duration;
};

export const divideAllDayEvents = (
  event: EventItemInternal,
  timeZone: string,
  firstDay: WeekdayNumbers,
  hideWeekDays: WeekdayNumbers[]
) => {
  const events: EventItemInternal[] = [];
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

  const weekStartUnix = startOfWeek(eventStart.toISODate(), firstDay).toMillis();
  const weekEndUnix = startOfWeek(eventEnd.toISODate(), firstDay).toMillis();

  const diffWeeks = Math.floor((weekEndUnix - weekStartUnix) / (7 * MILLISECONDS_IN_DAY)) + 1;
  const isSameDay = event._internal.startUnix === event._internal.endUnix;
  let eventStartUnix = eventStart.startOf('day').toMillis();
  const eventEndUnix = isSameDay
    ? eventStart.endOf('day').toMillis()
    : parseDateTime(eventEnd.toMillis() - 1)
        .endOf('day')
        .toMillis();

  if (diffWeeks <= 1) {
    // Adjust duration to exclude hidden days
    const duration = calculateVisibleDuration(eventStartUnix, eventEndUnix, timeZone, hideWeekDays);
    const weekStartUnixInUTC = forceUpdateZone(weekStartUnix, 'utc').toMillis();
    if (duration > 0) {
      events.push({
        ...event,
        _internal: {
          ...event._internal,
          startUnix: eventStartUnix,
          endUnix: eventEndUnix,
          duration,
          weekStart: weekStartUnixInUTC,
        },
      });
    }
    return events;
  }

  for (let i = 0; i < diffWeeks; i++) {
    const weekStartDateTime = parseDateTime(weekStartUnix).plus({
      days: 7 * i,
    });
    const weekStart = forceUpdateZone(weekStartDateTime.startOf('day'), 'utc').toMillis();

    let weekEnd = weekStartDateTime.plus({ days: 6 }).endOf('day').toMillis();
    if (eventEndUnix < weekEnd) {
      weekEnd = eventEndUnix;
    }

    const duration = calculateVisibleDuration(eventStartUnix, weekEnd, timeZone, hideWeekDays);
    if (duration > 0) {
      const newEvent = {
        ...event,
        localId: `${event.localId}_${weekStart}`,
        _internal: {
          ...event._internal,
          startUnix: eventStartUnix,
          endUnix: weekEnd,
          duration,
          weekStart,
          eventIndex: i,
        },
      };
      events.push(newEvent);
    }
    eventStartUnix = weekEnd + 1;
  }

  return events;
};

export const divideEvents = (
  event: EventItemInternal,
  timeZone: string,
  minRegularEventMinutes?: number
): EventItemInternal[] => {
  // Parse start and end times and convert to target timezone
  const eventStart = parseDateTime(event.start.dateTime || event.start.date, {
    zone: event.start.timeZone,
  }).setZone(timeZone);
  const eventEnd = parseDateTime(event.end.dateTime || event.end.date, {
    zone: event.end.timeZone,
  }).setZone(timeZone);

  // Calculate number of days the event spans
  const startDay = eventStart.startOf('day');
  const endDay = eventEnd.startOf('day');
  const dayCount = endDay.diff(startDay, 'days').days + 1;

  // If single day event, return as-is with minimum duration if needed
  if (dayCount === 1) {
    const startUnix = eventStart.toMillis();
    let endUnix = eventEnd.toMillis();
    let duration = (endUnix - startUnix) / MILLISECONDS_IN_MINUTE;

    if (minRegularEventMinutes && duration < minRegularEventMinutes) {
      duration = minRegularEventMinutes;
      endUnix = startUnix + duration * MILLISECONDS_IN_MINUTE;
    }

    return [
      {
        ...event,
        _internal: {
          ...event._internal,
          startUnix,
          endUnix,
          duration,
          startMinutes: eventStart.hour * 60 + eventStart.minute,
        },
      },
    ];
  }

  // Split multi-day events
  return Array.from({ length: dayCount }, (_, i) => {
    const currentDay = eventStart.plus({ days: i });
    const isFirstDay = i === 0;
    const isLastDay = i === dayCount - 1;

    // Calculate segment times
    const segmentStart = isFirstDay ? eventStart : currentDay.startOf('day');
    let segmentEnd = isLastDay ? eventEnd : currentDay.endOf('day');

    // Adjust for timezone offset changes on non-first days
    if (!isFirstDay) {
      const offsetDiff = segmentEnd.startOf('day').offset - segmentEnd.offset;
      if (offsetDiff !== 0) {
        segmentEnd = segmentEnd.minus({ minutes: offsetDiff });
      }
    }

    const startUnix = segmentStart.toMillis();
    const endUnix = segmentEnd.toMillis();
    const duration = (endUnix - startUnix) / MILLISECONDS_IN_MINUTE;

    return {
      ...event,
      localId: `${event.localId}_${startUnix}`,
      _internal: {
        ...event._internal,
        startUnix,
        endUnix,
        duration,
        startMinutes: segmentStart.hour * 60 + segmentStart.minute,
        eventIndex: i,
      },
    };
  });
};

export function processEventOccurrences(
  event: EventItemInternal,
  minUnix: number,
  maxUnix: number,
  timeZone: string,
  divideFunction: (event: EventItemInternal, timeZone: string) => EventItemInternal[]
): EventItemInternal[] {
  if (!event.recurrence) {
    return divideFunction(event, timeZone);
  }

  const originalStart = parseDateTime(event.start.dateTime || event.start.date, {
    zone: event.start.timeZone,
  });

  const rrule = new RRuleGenerator(event.recurrence, originalStart, event.excludeDates);
  const occurrences = rrule.generateOccurrences(
    parseDateTime(minUnix, { zone: timeZone }),
    parseDateTime(maxUnix, { zone: timeZone })
  );
  const firstOccurrence = rrule.firstOccurrence();

  const { recurrence: originalRrule, excludeDates, _internal, ...rest } = event;

  return occurrences.flatMap((occurrence) => {
    const eventStart = event.start.dateTime ? occurrence.setZone(timeZone) : occurrence;
    const eventEnd = eventStart.plus({ minutes: event._internal.duration }).setZone(timeZone);
    const instanceId = buildInstanceId(event.id, eventStart.toUTC());

    const recurringEvent: EventItemInternal = {
      ...rest,
      id: instanceId,
      localId: instanceId,
      start: event.start.dateTime
        ? { dateTime: eventStart.toISO(), timeZone: eventStart.zoneName }
        : { date: eventStart.toISODate() },
      end: event.end.dateTime
        ? { dateTime: eventEnd.toISO(), timeZone: eventEnd.zoneName }
        : { date: eventEnd.toISODate() },
      originalStartTime: event.start.dateTime
        ? { dateTime: eventStart.toISO(), timeZone: eventStart.zoneName }
        : { date: eventStart.toISODate() },
      isFirstOccurrence: firstOccurrence?.toMillis() === eventStart.toMillis(),
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
    const visibleDays: number[] = getVisibleDays(weekStart, timeZone, hideWeekDays);

    const { packedEvents, maxRowCount } = populateAllDayEvents(eventsForWeek, {
      visibleDays,
    });

    packedAllDayEvents[weekStart] = packedEvents;
    eventCountsByWeek[weekStart] = maxRowCount;

    packedEvents.forEach((event) => {
      const eventStart = event._internal.startUnix;
      const eventEnd = event._internal.endUnix;
      for (
        let dayUnix = eventStart;
        dayUnix <= eventEnd;
        dayUnix = parseDateTime(dayUnix).plus({ days: 1 }).toMillis()
      ) {
        const dayStartUnix = parseDateTime(dayUnix).startOf('day').toMillis();
        if (visibleDays.includes(dayStartUnix)) {
          eventCountsByDay[dayStartUnix] = (eventCountsByDay[dayStartUnix] || 0) + 1;
          if (!packedAllDayEventsByDay[dayStartUnix]) {
            packedAllDayEventsByDay[dayStartUnix] = [];
          }
          packedAllDayEventsByDay[dayStartUnix].push(event);
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
  let currentDayUnix = weekStart;

  for (let i = 0; i < 7; i++) {
    const dateTime = parseDateTime(currentDayUnix, { zone: timeZone });
    const weekday = dateTime.weekday;
    if (!hideWeekDays.includes(weekday)) {
      visibleDays.push(dateTime.toMillis());
    }
    currentDayUnix = dateTime.plus({ days: 1 }).toMillis();
  }
  return visibleDays;
}

const hasCollision = (a: EventItemInternal, b: EventItemInternal) => {
  return a._internal.endUnix > b._internal.startUnix && a._internal.startUnix < b._internal.endUnix;
};

export const sortEvents = (events: EventItemInternal[]): EventItemInternal[] => {
  return events.slice().sort((a, b) => {
    // Compare by start time
    if (a._internal.startUnix !== b._internal.startUnix) {
      return a._internal.startUnix - b._internal.startUnix;
    }

    // Compare by title
    const titleA = a.title || '';
    const titleB = b.title || '';
    const titleComparison = titleA.localeCompare(titleB);
    if (titleComparison !== 0) {
      return titleComparison;
    }

    // Compare by duration (longer duration comes first)
    const durationA = a._internal.endUnix - a._internal.startUnix;
    const durationB = b._internal.endUnix - b._internal.startUnix;
    return durationB - durationA;
  });
};

const calcColumnSpan = (
  event: EventItemInternal,
  columnIndex: number,
  columns: EventItemInternal[][]
) => {
  let colSpan = 1;
  for (let i = columnIndex + 1; i < columns.length; i++) {
    const column = columns[i];
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
  calculatedEvents: PackedEvent[],
  populateOptions: {
    resourceIndex?: number;
  }
) => {
  const { resourceIndex } = populateOptions;

  columns.forEach((column, columnIndex) => {
    column.forEach((event) => {
      const columnSpan = calcColumnSpan(event, columnIndex, columns);
      calculatedEvents.push({
        ...event,
        _internal: {
          ...event._internal,
          resourceIndex,
          index: columnIndex,
          columnSpan,
          total: columns.length,
        },
      });
    });
  });
};

const handleNoOverlap = (events: EventItemInternal[], resourceIndex?: number) => {
  const options = { resourceIndex };
  let lastEnd: number | null = null;
  let eventColumns: EventItemInternal[][] = [];
  const packedEvents: PackedEvent[] = [];

  const sortedEvents = sortEvents(events) as NoOverlapEvent[];
  for (const event of sortedEvents) {
    if (lastEnd !== null && event._internal.startUnix >= lastEnd) {
      packOverlappingEventGroup(eventColumns, packedEvents, options);
      eventColumns = [];
      lastEnd = null;
    }
    let placed = false;
    for (const column of eventColumns) {
      if (!hasCollision(column[column.length - 1], event)) {
        column.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) {
      eventColumns.push([event]);
    }

    if (lastEnd === null || event._internal.endUnix > lastEnd) {
      lastEnd = event._internal.endUnix;
    }
  }

  if (eventColumns.length > 0) {
    packOverlappingEventGroup(eventColumns, packedEvents, options);
  }

  return packedEvents;
};

function overlapSort(events: EventItemInternal[]): EventItemInternal[] {
  const sortedByTime = events.slice().sort((a, b) => {
    if (a._internal.startUnix !== b._internal.startUnix) {
      return a._internal.startUnix - b._internal.startUnix;
    }
    return b._internal.endUnix - a._internal.endUnix;
  });

  const sorted = [];
  let i = 0;
  while (i < sortedByTime.length) {
    const event = sortedByTime[i];
    sorted.push(event);
    i++;

    let j = i;
    while (j < sortedByTime.length) {
      if (event._internal.endUnix <= sortedByTime[j]._internal.startUnix) {
        sorted.push(sortedByTime[j]);
        sortedByTime.splice(j, 1);
        break;
      }
      j++;
    }
  }
  return sorted;
}

const onSameRow = (a: OverlapEvent, b: OverlapEvent, minimumStartDifference: number) => {
  return (
    Math.abs(b._internal.startUnix - a._internal.startUnix) < minimumStartDifference ||
    (b._internal.startUnix > a._internal.startUnix && b._internal.startUnix < a._internal.endUnix)
  );
};

const computeStylesForEvents = (containerEvents: OverlapEvent[]) => {
  for (const containerEvent of containerEvents) {
    const maxLeaves = containerEvent._internal.rows!.reduce(
      (max, row) => Math.max(max, (row._internal.leaves?.length ?? 0) + 1),
      0
    );
    const columns = maxLeaves + 1;
    containerEvent._internal._width = 100 / columns;

    const noOverlap = containerEvent._internal._width;
    const overlap = Math.min(100, containerEvent._internal._width * 1.7);
    if (containerEvent._internal.rows && containerEvent._internal.rows.length > 0) {
      containerEvent._internal.width = overlap;
    } else {
      containerEvent._internal.width = noOverlap;
    }

    containerEvent._internal.xOffset = 0;

    for (const rowEvent of containerEvent._internal.rows!) {
      const availableWidth = 100 - containerEvent._internal._width;
      rowEvent._internal._width = availableWidth / ((rowEvent._internal.leaves?.length ?? 0) + 1);

      const noOverlapRow = rowEvent._internal._width;
      const overlapRow = Math.min(100, rowEvent._internal._width * 1.7);
      if (rowEvent._internal.leaves && rowEvent._internal.leaves.length > 0) {
        rowEvent._internal.width = overlapRow;
      } else {
        rowEvent._internal.width = noOverlapRow;
      }

      rowEvent._internal.xOffset = containerEvent._internal._width!;

      if (rowEvent._internal.leaves && rowEvent._internal.leaves.length > 0) {
        for (const leafEvent of rowEvent._internal.leaves) {
          leafEvent._internal._width = rowEvent._internal._width!;

          const leaves = rowEvent._internal.leaves;
          const index = leaves.indexOf(leafEvent);
          const noOverlapLeaf = leafEvent._internal._width;
          const overlapLeaf = Math.min(100, leafEvent._internal._width * 1.7);
          leafEvent._internal.width = index === leaves.length - 1 ? noOverlapLeaf : overlapLeaf;

          leafEvent._internal.xOffset =
            rowEvent._internal.xOffset + (index + 1) * leafEvent._internal._width;
        }
      }
    }
  }
};

const handleOverlap = (
  events: EventItemInternal[],
  minimumStartDifference: number,
  resourceIndex?: number
) => {
  const sortedEvents = overlapSort(events) as OverlapEvent[];
  const containerEvents: OverlapEvent[] = [];
  for (const event of sortedEvents) {
    const container = containerEvents.find(
      (c) =>
        c._internal.endUnix > event._internal.startUnix ||
        Math.abs(event._internal.startUnix - c._internal.startUnix) < minimumStartDifference
    );

    if (!container) {
      event._internal.rows = [];
      containerEvents.push(event);
      continue;
    }
    event._internal.container = container;
    let row: OverlapEvent | null = null;
    for (let j = container._internal.rows!.length - 1; !row && j >= 0; j--) {
      if (onSameRow(container._internal.rows![j], event, minimumStartDifference)) {
        row = container._internal.rows![j]!;
      }
    }

    if (row) {
      row._internal.leaves = row._internal.leaves || [];
      row._internal.leaves.push(event);
      event._internal.row = row;
    } else {
      event._internal.leaves = [];
      container._internal.rows!.push(event);
    }
  }

  computeStylesForEvents(containerEvents);
  const packedEvents = sortedEvents.map((event) => {
    return {
      ...event,
      _internal: {
        startMinutes: event._internal.startMinutes,
        weekStart: event._internal.weekStart,
        duration: event._internal.duration,
        startUnix: event._internal.startUnix,
        endUnix: event._internal.endUnix,
        widthPercentage: event._internal.width,
        xOffsetPercentage: event._internal.xOffset,
        resourceIndex,
      },
    } as PackedEvent;
  });
  return packedEvents;
};

export const populateEvents = (
  events: EventItemInternal[],
  {
    overlap = false,
    minStartDifference = DEFAULT_MIN_START_DIFFERENCE,
    resources,
  }: {
    overlap?: boolean;
    minStartDifference?: number;
    resources?: ResourceItem[];
  } = {}
): PackedEvent[] => {
  if (!events.length) {
    return [];
  }

  const handleEvents = (
    eventsToHandle: EventItemInternal[],
    resourceIndex?: number
  ): PackedEvent[] =>
    overlap
      ? handleOverlap(eventsToHandle, minStartDifference * MILLISECONDS_IN_MINUTE, resourceIndex)
      : handleNoOverlap(eventsToHandle, resourceIndex);

  if (resources && resources.length > 0) {
    return resources.flatMap((resource, resourceIndex) => {
      const resourceEvents = events.filter((e) => e.resourceId === resource.id);
      return resourceEvents.length > 0 ? handleEvents(resourceEvents, resourceIndex) : [];
    });
  }

  return handleEvents(events);
};

interface PopulateAllDayOptions {
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
  const sortedEvents = sortEvents(events);
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

      for (
        let dayUnix = eventStart;
        dayUnix <= eventEnd;
        dayUnix = parseDateTime(dayUnix).plus({ days: 1 }).toMillis()
      ) {
        const dayStartUnix = forceUpdateZone(
          parseDateTime(dayUnix).startOf('day'),
          'utc'
        ).toMillis();
        if (Object.prototype.hasOwnProperty.call(dateToIndexMap, dayStartUnix)) {
          eventVisibleDays.push(dayStartUnix);
        }
      }

      if (eventVisibleDays.length === 0) {
        // Event does not span any visible days, skip it
        continue;
      }

      const adjustedStartStr = eventVisibleDays[0];
      const adjustedEndStr = eventVisibleDays[eventVisibleDays.length - 1];

      const startIndex = dateToIndexMap[adjustedStartStr];
      const endIndex = dateToIndexMap[adjustedEndStr];

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
