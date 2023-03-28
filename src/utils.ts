import { merge } from 'lodash';
import moment, { Moment } from 'moment-timezone';
import { Platform } from 'react-native';
import { DEFAULT_PROPS, SECONDS_IN_DAY } from './constants';
import type { EventItem, PackedEvent, ThemeProperties } from './types';

type DateData = { data: string[]; index: number };

export const calculateDates = (
  initialFirstDay: number,
  minDateStr: string,
  maxDateStr: string,
  initialDate: string
) => {
  let day: DateData = { data: [], index: -1 },
    week: DateData = { data: [], index: -1 },
    threeDays: DateData = { data: [], index: -1 },
    workWeek: DateData = { data: [], index: -1 };

  const minDate = moment(minDateStr);
  const maxDate = moment(maxDateStr);
  const minDateUnix = minDate.unix();
  const maxDateUnix = maxDate.unix();
  const minWeekDay = minDate.day();
  const maxWeekDay = maxDate.day();

  const fDow = (7 + initialFirstDay) % 7;
  const diffBefore = (minWeekDay + 7 - fDow) % 7;

  const minWeekDate = minDate.subtract(diffBefore, 'd');
  const minWeekDateUnix = minWeekDate.unix();
  let minWorkWorkDateUnix = minWeekDateUnix;
  if (diffBefore === 5) {
    minWorkWorkDateUnix = minDateUnix + 2 * SECONDS_IN_DAY;
  } else if (diffBefore === 6) {
    minWorkWorkDateUnix = minDateUnix + SECONDS_IN_DAY;
  }

  const lDow = (fDow + 6) % 7;
  const diffAfter = (lDow + 7 - maxWeekDay) % 7;
  const maxWeekDateUnix = maxDateUnix + diffAfter * SECONDS_IN_DAY;

  const totalDays = (maxWeekDateUnix - minWeekDateUnix) / SECONDS_IN_DAY;
  let startWorkWeekDate = minWorkWorkDateUnix,
    startWeekDate = minWeekDateUnix,
    startThreeDays = minDateUnix,
    startDay = minDateUnix;
  for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
    const currentUnix = minWeekDateUnix + dayIndex * SECONDS_IN_DAY;
    const dateStr = minWeekDate.clone().add(dayIndex, 'd').format('YYYY-MM-DD');
    if (startDay === currentUnix) {
      if (currentUnix <= maxDateUnix) {
        day.data.push(dateStr);
      }
      startDay = currentUnix + SECONDS_IN_DAY;
    }
    if (startWorkWeekDate === currentUnix) {
      workWeek.data.push(dateStr);
      startWorkWeekDate = currentUnix + 7 * SECONDS_IN_DAY;
    }
    if (startWeekDate === currentUnix) {
      week.data.push(dateStr);
      startWeekDate = currentUnix + 7 * SECONDS_IN_DAY;
    }
    if (startThreeDays === currentUnix && startThreeDays <= maxDateUnix) {
      threeDays.data.push(dateStr);
      startThreeDays = currentUnix + 3 * SECONDS_IN_DAY;
    }
    if (dateStr === initialDate) {
      day.index = day.data.length - 1;
      threeDays.index = threeDays.data.length - 1;
      week.index = week.data.length - 1;
      workWeek.index = workWeek.data.length - 1;
    }
  }

  return { day, week, threeDays, workWeek };
};

export const calculateHours = (
  start: number,
  end: number,
  step: number,
  hourFormat?: string
) => {
  const hours: { text: string; hourNumber: number }[] = [];
  let tempStart = start;
  while (tempStart < end) {
    const roundHour = Math.floor(tempStart);
    const minutes = (tempStart - roundHour) * 60;
    const rMinutes = Math.round(minutes);
    const hourStr = ('0' + roundHour).slice(-2);
    const minuteStr = ('0' + rMinutes).slice(-2);
    let time = `${hourStr}:${minuteStr}`;
    if (hourFormat) {
      time = moment(
        `1970/1/1 ${hourStr}:${minuteStr}`,
        'YYYY/M/D HH:mm'
      ).format(hourFormat);
    }

    hours.push({
      text: time,
      hourNumber: tempStart,
    });
    tempStart += step / 60;
  }
  return hours;
};

export const convertPositionToISOString = (
  locationX: number,
  locationY: number,
  startDate: string,
  hourHeight: number,
  columnWidth: number
) => {
  const dayIndex = Math.floor(locationX / columnWidth);
  const hourFromY = locationY / hourHeight;
  const dateMoment = moment(startDate)
    .add(dayIndex, 'd')
    .add(hourFromY, 'hour');
  return dateMoment.toISOString();
};

export const groupEventsByDate = (
  events: EventItem[] = [],
  tzOffset: string
) => {
  let groupedEvents: Record<string, EventItem[]> = {};
  events.forEach((event) => {
    const startEvent = moment.tz(event.start, tzOffset).startOf('d');
    const endEvent = moment.tz(event.end, tzOffset).startOf('d');
    const diffDays = endEvent.diff(startEvent, 'd');
    for (let i = 0; i <= diffDays; i++) {
      const dateStr = startEvent.clone().add(i, 'd').format('YYYY-MM-DD');
      const prevEvents = groupedEvents[dateStr] || [];
      groupedEvents[dateStr] = [...prevEvents, event];
    }
  });
  return groupedEvents;
};

const hasCollision = (a: EventItem, b: EventItem) => {
  return a.end > b.start && a.start < b.end;
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

const buildEvent = (
  event: EventItem,
  left: number,
  width: number,
  options: PopulateOptions
): PackedEvent => {
  const eventStart = moment.tz(event.start, options.tzOffset);
  const eventEnd = moment.tz(event.end, options.tzOffset);
  const timeToHour = eventStart.hour() + eventStart.minute() / 60;
  let start = timeToHour - options.startHour;
  const diffHour = eventEnd.diff(eventStart, 'm') / 60;
  const isSameDate = eventStart.isSame(eventEnd, 'd');
  if (!isSameDate) {
    const currentDate = moment
      .tz(options.startDate, options.tzOffset)
      .add(options.dayIndex, 'd');
    const diffCurrent = eventStart.diff(currentDate, 'm') / 60;
    if (diffCurrent < 0) {
      start = 0 + diffCurrent - options.startHour;
    }
  }

  return {
    ...event,
    startHour: start,
    duration: diffHour,
    left,
    width,
  };
};

const packOverlappingEventGroup = (
  columns: EventItem[][],
  calculatedEvents: PackedEvent[],
  populateOptions: PopulateOptions
) => {
  const { columnWidth, rightEdgeSpacing, overlapEventsSpacing } =
    populateOptions;

  columns.forEach((column, columnIndex) => {
    column.forEach((event) => {
      const totalWidth = columnWidth - rightEdgeSpacing;
      const columnSpan = calcColumnSpan(event, columnIndex, columns);
      const eventLeft = (columnIndex / columns.length) * totalWidth;

      let eventWidth = totalWidth * (columnSpan / columns.length);
      if (columnIndex + columnSpan <= columns.length - 1) {
        eventWidth -= overlapEventsSpacing;
      }

      calculatedEvents.push(
        buildEvent(event, eventLeft, eventWidth, populateOptions)
      );
    });
  });
};

type PopulateOptions = {
  columnWidth: number;
  startHour: number;
  dayIndex: number;
  startDate: string;
  overlapEventsSpacing: number;
  rightEdgeSpacing: number;
  tzOffset: string;
};

export const populateEvents = (
  events: EventItem[],
  options: PopulateOptions
) => {
  let lastEnd: string | null = null;
  let columns: EventItem[][] = [];
  let calculatedEvents: PackedEvent[] = [];
  const cloneEvents = [...events];
  const sortedEvents = cloneEvents.sort((a, b) => {
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
  sortedEvents.forEach(function (ev) {
    if (lastEnd !== null && ev.start >= lastEnd) {
      packOverlappingEventGroup(columns, calculatedEvents, options);
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

    if (lastEnd === null || ev.end > lastEnd) {
      lastEnd = ev.end;
    }
  });

  if (columns.length > 0) {
    packOverlappingEventGroup(columns, calculatedEvents, options);
  }

  return calculatedEvents;
};

interface DivideEventsProps {
  events?: {
    [date: string]: EventItem[];
  };
  startDate: string;
  columns: number;
  columnWidth: number;
  startHour: number;
  overlapEventsSpacing: number;
  rightEdgeSpacing: number;
  tzOffset: string;
}

export const divideEventsByColumns = (props: DivideEventsProps) => {
  const { events = {}, startDate, columns, ...other } = props;
  let eventsByColumns: EventItem[][] = [];
  const startUnix = moment(startDate).unix();
  for (let i = 0; i < columns; i++) {
    const currentUnix = startUnix + i * SECONDS_IN_DAY;
    const dateStr = moment.unix(currentUnix).format('YYYY-MM-DD');
    let eventsInDate: EventItem[] = [];
    const eventInDate = events[dateStr];
    if (eventInDate) {
      eventsInDate = eventInDate;
    }
    eventsByColumns[i] = eventsInDate;
  }

  return eventsByColumns.map((event, index) =>
    populateEvents(event, {
      ...other,
      dayIndex: index,
      startDate,
    })
  );
};

export const getTheme = (
  theme: ThemeProperties | undefined
): ThemeProperties => {
  let defaultTheme = {
    cellBorderColor: DEFAULT_PROPS.CELL_BORDER_COLOR,
    backgroundColor: DEFAULT_PROPS.WHITE_COLOR,
    loadingBarColor: DEFAULT_PROPS.PRIMARY_COLOR,
    unavailableBackgroundColor: DEFAULT_PROPS.UNAVAILABLE_BACKGROUND_COLOR,
    editIndicatorColor: DEFAULT_PROPS.BLACK_COLOR,
    nowIndicatorColor: DEFAULT_PROPS.PRIMARY_COLOR,
    dragCreateItemBackgroundColor: DEFAULT_PROPS.CREATE_ITEM_BACKGROUND_COLOR,

    //Header
    todayName: { color: DEFAULT_PROPS.PRIMARY_COLOR },
    todayNumber: { color: DEFAULT_PROPS.WHITE_COLOR },
    todayNumberContainer: { backgroundColor: DEFAULT_PROPS.PRIMARY_COLOR },
  };

  if (theme) {
    defaultTheme = merge(defaultTheme, theme);
  }

  return defaultTheme;
};

type DayBarStyle = {
  dayNumberColor?: string;
  dayNumberBackgroundColor?: string;
  dayNameColor?: string;
};

type StyleKey = 'day' | 'today' | 'sunday' | 'saturday';
export const getDayBarStyle = (
  currentDate: string,
  date: Moment,
  theme: ThemeProperties,
  highlightDate: DayBarStyle = {}
) => {
  const dateStr = date.format('YYYY-MM-DD');
  const isToday = dateStr === currentDate;
  const weekDay = date.day();
  const isSunday = weekDay === 0;
  const isSaturday = weekDay === 6;

  let styleKey: StyleKey = 'day';
  if (isToday) {
    styleKey = 'today';
  } else if (isSunday) {
    styleKey = 'sunday';
  } else if (isSaturday) {
    styleKey = 'saturday';
  }

  let style = {
    dayName: { ...theme[`${styleKey}Name`] },
    dayNumber: { ...theme[`${styleKey}Number`] },
    dayNumberContainer: { ...theme[`${styleKey}NumberContainer`] },
  };

  if (!isToday) {
    if (highlightDate.dayNameColor) {
      style.dayName.color = highlightDate.dayNameColor;
    }
    if (highlightDate.dayNumberColor) {
      style.dayNumber.color = highlightDate.dayNumberColor;
    }
    if (highlightDate.dayNumberBackgroundColor) {
      style.dayNumberContainer.backgroundColor =
        highlightDate.dayNumberBackgroundColor;
    }
  }

  return style;
};

export const triggerHaptic = () => {
  try {
    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    };
    const hapticFeedback = require('react-native-haptic-feedback').default;
    const type = Platform.select({ ios: 'selection', default: 'soft' });
    hapticFeedback.trigger(type, options);
  } catch (ex) {}
};

export const getCurrentDate = (tzOffset: string, date?: string) => {
  return moment.tz(date, tzOffset).format('YYYY-MM-DD');
};

export const clampValues = (value: number, min: number, max: number) => {
  'worklet';
  return Math.max(min, Math.min(value, max));
};

export const shallowEqual = (object1: any, object2: any) => {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false;
    }
  }
  return true;
};

export const roundTo = (hour: number, step: number, type: 'up' | 'down') => {
  'worklet';
  const totalMinutes = hour * 60;
  if (type === 'up') {
    const nextMinutes = Math.ceil(totalMinutes / step) * step;
    return nextMinutes / 60;
  }
  const nextMinutes = Math.floor(totalMinutes / step) * step;
  return nextMinutes / 60;
};
