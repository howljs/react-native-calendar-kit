import { EventItem, PackedEvent } from '../types';

const hasCollision = (a: EventItem, b: EventItem) => {
  return a.endUnix > b.startUnix && a.startUnix < b.endUnix;
};

const calcColumnSpan = (
  event: EventItem,
  columnIndex: number,
  columns: EventItem[][]
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
  columns: EventItem[][],
  calculatedEvents: PackedEvent[]
) => {
  columns.forEach((column, columnIndex) => {
    column.forEach((event) => {
      const columnSpan = calcColumnSpan(event, columnIndex, columns);
      calculatedEvents.push({
        event,
        index: columnIndex,
        total: columns.length,
        columnSpan: columnSpan,
      });
    });
  });
};

export const populateEvents = (events: EventItem[]) => {
  let lastEnd: number | null = null;
  let columns: EventItem[][] = [];
  let packedEvents: PackedEvent[] = [];
  const clonedEvents = [...events];
  sortEventsByUnix(clonedEvents);
  clonedEvents.forEach(function (ev) {
    if (lastEnd !== null && ev.startUnix >= lastEnd) {
      packOverlappingEventGroup(columns, packedEvents);
      columns = [];
      lastEnd = null;
    }

    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i]!;
      if (!hasCollision(col[col.length - 1]!, ev)) {
        col.push(ev);
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([ev]);
    }

    if (lastEnd === null || ev.endUnix > lastEnd) {
      lastEnd = ev.endUnix;
    }
  });

  if (columns.length > 0) {
    packOverlappingEventGroup(columns, packedEvents);
  }

  return packedEvents;
};

export const findMaxEvents = (
  startTime: number,
  endTime: number,
  data: Record<string, number>
) => {
  let maxCount = 0;
  for (let unixTime = startTime; unixTime <= endTime; unixTime++) {
    if (data[unixTime]) {
      maxCount = Math.max(maxCount, data[unixTime]!);
    }
  }
  return maxCount;
};

export const sortEventsByUnix = (events: EventItem[]) =>
  events.sort((a, b) => {
    if (a.startUnix < b.startUnix) {
      return -1;
    }
    if (a.startUnix > b.startUnix) {
      return 1;
    }
    if (a.endUnix < b.endUnix) {
      return -1;
    }
    if (a.endUnix > b.endUnix) {
      return 1;
    }
    return 0;
  });

export const sortEvents = (events: EventItem[]) =>
  events.sort((a, b) => {
    if (a.start < b.start) {
      return -1;
    }
    if (a.start > b.start) {
      return 1;
    }
    if (a.end < b.end) {
      return -1;
    }
    if (a.end > b.end) {
      return 1;
    }
    return 0;
  });
