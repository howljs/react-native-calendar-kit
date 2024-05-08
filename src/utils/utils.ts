import { type WeekdayNumbers } from 'luxon';
import { MILLISECONDS_IN_DAY } from '../constants';
import type { DateType } from '../types';
import { parseDateTime } from './dateUtils';

type CalendarRangeOptions = {
  minDate: DateType;
  maxDate: DateType;
  firstDay: WeekdayNumbers;
  isSingleDay: boolean;
};

export type DataByMode = {
  count: number;
  minDateUnix: number;
  maxDateUnix: number;
  originalMinDateUnix: number;
  originalMaxDateUnix: number;
};

export const prepareCalendarRange = (
  props: CalendarRangeOptions
): DataByMode => {
  const { minDate, maxDate, firstDay, isSingleDay } = props;
  let min = parseDateTime(minDate).startOf('day');
  let max = parseDateTime(maxDate).startOf('day');
  const originalMinDateUnix = min.toMillis();
  const originalMaxDateUnix = max.toMillis();

  if (isSingleDay) {
    const diffInMs = originalMaxDateUnix - originalMinDateUnix;
    const diffDays = Math.floor(diffInMs / MILLISECONDS_IN_DAY);

    return {
      count: diffDays,
      minDateUnix: originalMinDateUnix,
      maxDateUnix: originalMaxDateUnix,
      originalMinDateUnix,
      originalMaxDateUnix,
    };
  }

  const minWeekDay = min.weekday;
  const diff = (minWeekDay - firstDay + 7) % 7;
  const newMin = originalMinDateUnix - diff * MILLISECONDS_IN_DAY;
  const diffMax = (max.weekday - firstDay + 7) % 7;
  const newMax = originalMaxDateUnix - diffMax * MILLISECONDS_IN_DAY;
  const diffWeeks =
    Math.floor((newMax - newMin) / (MILLISECONDS_IN_DAY * 7)) + 1;

  return {
    count: diffWeeks,
    minDateUnix: newMin,
    maxDateUnix: newMax,
    originalMinDateUnix,
    originalMaxDateUnix,
  };
};

export const isNumbersEqual = (
  num1: number,
  num2: number,
  epsilon: number = 0.2
) => {
  return Math.abs(num1 - num2) < epsilon;
};

export const calculateSlots = (start: number, end: number, step: number) => {
  const hours = [];
  const endInMinutes = end;
  let tempStart = start;
  while (tempStart < endInMinutes) {
    hours.push(tempStart);
    tempStart += step;
  }
  return hours;
};

export const clampValues = (value: number, min: number, max: number) => {
  'worklet';
  return Math.max(min, Math.min(value, max));
};
