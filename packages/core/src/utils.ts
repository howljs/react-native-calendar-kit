import type { WeekdayNumbers } from 'luxon';

import { MILLISECONDS_IN_DAY } from './constants';
import { parseDateTime } from './dateUtils';
import type { DateType } from './types';

type CalendarRangeOptions = {
  minDate: DateType;
  maxDate: DateType;
  firstDay: WeekdayNumbers;
  hideWeekDays?: WeekdayNumbers[];
};

export type CalendarData = {
  minDateUnix: number;
  maxDateUnix: number;
  originalMinDateUnix: number;
  originalMaxDateUnix: number;
  availableDates: number[];
  bufferBefore: number[];
  bufferAfter: number[];
};

export const prepareCalendarRange = (props: CalendarRangeOptions): CalendarData => {
  const { minDate, maxDate, firstDay, hideWeekDays = [] } = props;

  // Convert dates to UTC midnight and get Unix timestamps
  const min = parseDateTime(minDate).setZone('utc', { keepLocalTime: true }).startOf('day');
  const max = parseDateTime(maxDate).setZone('utc', { keepLocalTime: true }).startOf('day');
  const originalMinDateUnix = min.toMillis();
  const originalMaxDateUnix = max.toMillis();

  // Calculate adjusted date range to align with first day of week
  const diffToFirstDay = (min.weekday - firstDay + 7) % 7;
  const adjustedMin = originalMinDateUnix - diffToFirstDay * MILLISECONDS_IN_DAY;
  const diffFromLastDay = (max.weekday - firstDay + 7) % 7;
  const adjustedMax = originalMaxDateUnix - (diffFromLastDay - 6) * MILLISECONDS_IN_DAY;

  const availableDates: number[] = [];
  const bufferBefore: number[] = [];
  const bufferAfter: number[] = [];

  // Populate date arrays
  const totalDays = Math.ceil((adjustedMax - adjustedMin) / MILLISECONDS_IN_DAY) + 1;
  for (let i = 0; i < totalDays; i++) {
    const dateUnix = adjustedMin + i * MILLISECONDS_IN_DAY;
    const currentWeekDay = ((firstDay + i - 1) % 7) + 1;

    if (hideWeekDays.includes(currentWeekDay as WeekdayNumbers)) {
      continue;
    }

    if (dateUnix < originalMinDateUnix) {
      bufferBefore.push(dateUnix);
    } else if (dateUnix > originalMaxDateUnix) {
      bufferAfter.push(dateUnix);
    } else {
      availableDates.push(dateUnix);
    }
  }

  return {
    minDateUnix: adjustedMin,
    maxDateUnix: adjustedMax,
    originalMinDateUnix,
    originalMaxDateUnix,
    availableDates,
    bufferBefore,
    bufferAfter,
  };
};

export const findNearestDate = (numbers: number[], target: number) => {
  const index = numbers.indexOf(target);
  if (index !== -1) {
    return { target, index };
  }

  return numbers.reduce(
    (nearest, current, currentIndex) => {
      return Math.abs(current - target) < Math.abs(nearest.target - target)
        ? { target: current, index: currentIndex }
        : nearest;
    },
    { target: numbers[0], index: 0 }
  );
};

export const isNumbersEqual = (num1: number, num2: number, epsilon: number = 0.2) => {
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
