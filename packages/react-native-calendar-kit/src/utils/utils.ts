import type { WeekdayNumbers } from 'luxon';
import type { DateType } from '../types';
import { parseDateTime, startOfWeek } from './dateUtils';

type CalendarRangeOptions = {
  minDate: DateType;
  maxDate: DateType;
  firstDay: WeekdayNumbers;
  isSingleDay: boolean;
  hideWeekDays?: WeekdayNumbers[];
  timeZone?: string;
};

export type DataByMode = {
  count: number;
  minDateUnix: number;
  maxDateUnix: number;
  originalMinDateUnix: number;
  originalMaxDateUnix: number;
  visibleDates: Record<
    string,
    { index: number; unix: number; weekday: WeekdayNumbers }
  >;
  visibleDatesArray: number[];
  diffMinDays: number;
  diffMaxDays: number;
};

export const prepareCalendarRange = (
  props: CalendarRangeOptions
): DataByMode => {
  const { minDate, maxDate, firstDay, isSingleDay, timeZone } = props;
  const minIsoDate = parseDateTime(minDate, { zone: timeZone }).toISODate();
  const maxIsoDate = parseDateTime(maxDate, { zone: timeZone }).toISODate();
  const min = parseDateTime(minIsoDate);
  const max = parseDateTime(maxIsoDate);
  const originalMinDateUnix = min.toMillis();
  const originalMaxDateUnix = max.toMillis();

  // Single Day Mode
  if (isSingleDay) {
    const visibleDates: Record<
      string,
      { unix: number; index: number; weekday: WeekdayNumbers }
    > = {};
    const visibleDatesArray: number[] = [];

    let currentDateTime = min;
    let index = 0;

    // Iterate over days, ensuring time zone and DST are accounted for
    while (currentDateTime.toMillis() <= originalMaxDateUnix) {
      const currentWeekDay = currentDateTime.weekday;
      const dateUnix = currentDateTime.toMillis();

      if (!props.hideWeekDays?.includes(currentWeekDay)) {
        visibleDates[dateUnix] = {
          unix: dateUnix,
          index,
          weekday: currentWeekDay,
        };
        visibleDatesArray.push(dateUnix);
        index++;
      }
      currentDateTime = currentDateTime.plus({ days: 1 });
    }

    return {
      count: visibleDatesArray.length,
      minDateUnix: originalMinDateUnix,
      maxDateUnix: originalMaxDateUnix,
      originalMinDateUnix,
      originalMaxDateUnix,
      visibleDates,
      visibleDatesArray,
      diffMinDays: 0,
      diffMaxDays: 0,
    };
  }

  // Multi-day Mode (week-based)
  const minWeekDay = min.weekday;
  const diffToFirstDay = (minWeekDay - firstDay + 7) % 7;
  const adjustedMin = min.minus({ days: diffToFirstDay });

  const maxWeekDay = max.weekday;
  const diffFromLastDay = (maxWeekDay - firstDay + 7) % 7;
  const adjustedMax = max.plus({ days: 7 - diffFromLastDay });

  const visibleDates: Record<
    string,
    { unix: number; index: number; weekday: WeekdayNumbers }
  > = {};
  const visibleDatesArray: number[] = [];

  let currentDateTime = adjustedMin;
  let index = 0;
  let diffMinDays = 0;
  let diffMaxDays = 0;

  while (currentDateTime.toMillis() < adjustedMax.toMillis()) {
    const currentWeekDay = currentDateTime.weekday;
    const dateUnix = currentDateTime.toMillis();

    if (!props.hideWeekDays?.includes(currentWeekDay)) {
      visibleDates[dateUnix] = {
        unix: dateUnix,
        index,
        weekday: currentWeekDay,
      };
      visibleDatesArray.push(dateUnix);
      index++;
      if (dateUnix < originalMinDateUnix) {
        diffMinDays++;
      }
      if (dateUnix > originalMaxDateUnix) {
        diffMaxDays++;
      }
    }
    currentDateTime = currentDateTime.plus({ days: 1 });
  }
  const diffWeeks = Math.floor(adjustedMax.diff(adjustedMin, 'weeks').weeks);

  return {
    count: diffWeeks,
    minDateUnix: adjustedMin.toMillis(),
    maxDateUnix: adjustedMax.toMillis(),
    originalMinDateUnix,
    originalMaxDateUnix,
    visibleDates,
    visibleDatesArray,
    diffMinDays,
    diffMaxDays,
  };
};

export const findNearestNumber = (
  numbers: number[],
  target: number
): number => {
  'worklet';
  if (numbers.includes(target)) {
    return target;
  }

  return numbers.reduce((nearest, current) =>
    Math.abs(current - target) < Math.abs(nearest - target) ? current : nearest
  );
};

export const isNumbersEqual = (
  num1: number,
  num2: number,
  epsilon: number = 0.2
) => {
  return Math.abs(num1 - num2) < epsilon;
};

export const calculateSlots = (start: number, end: number, step: number) => {
  const slots = [];
  const endInMinutes = end;
  let tempStart = start;
  while (tempStart < endInMinutes) {
    slots.push(tempStart);
    tempStart += step;
  }
  return slots;
};

export const clampValues = (value: number, min: number, max: number) => {
  'worklet';
  return Math.max(min, Math.min(value, max));
};

export const roundMinutes = (
  minutes: number,
  step: number,
  type: 'round' | 'ceil' | 'floor' = 'round'
) => {
  'worklet';
  return Math[type](minutes / step) * step;
};

type PrepareMonthDataOptions = {
  minDate: DateType;
  maxDate: DateType;
  firstDay: WeekdayNumbers;
  timeZone?: string;
};

export type MonthData = {
  count: number;
  minDateUnix: number;
  originalMinDateUnix: number;
  originalMaxDateUnix: number;
  minStartOfMonthUnix: number;
  maxStartOfMonthUnix: number;
};

export const prepareMonthData = (props: PrepareMonthDataOptions): MonthData => {
  const minDateStr = parseDateTime(props.minDate, {
    zone: props.timeZone,
  }).toISODate();
  const maxDateStr = parseDateTime(props.maxDate, {
    zone: props.timeZone,
  }).toISODate();
  const minDate = parseDateTime(minDateStr);
  const maxDate = parseDateTime(maxDateStr);
  const minStartOfMonth = minDate.startOf('month');
  const maxStartOfMonth = maxDate.startOf('month');
  const min = startOfWeek(minStartOfMonth, props.firstDay);

  const minDateUnix = min.toMillis();
  const diffMonths = maxStartOfMonth.diff(minStartOfMonth, 'months').months;
  const minStartOfMonthUnix = minStartOfMonth.toMillis();
  const maxStartOfMonthUnix = maxStartOfMonth.toMillis();
  return {
    count: diffMonths,
    minDateUnix,
    originalMinDateUnix: minDate.toMillis(),
    originalMaxDateUnix: maxDate.toMillis(),
    minStartOfMonthUnix,
    maxStartOfMonthUnix,
  };
};
