import type { WeekdayNumbers } from 'luxon';

import { parseDateTime, toISODate } from './dateUtils';
import type { DateType } from './types';

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

type CalendarRangeOptions = {
  minDate: DateType;
  maxDate: DateType;
  firstDay: WeekdayNumbers;
  hideWeekDays?: WeekdayNumbers[];
  timeZone?: string;
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
  const { minDate, maxDate, firstDay, timeZone } = props;
  const minIsoDate = toISODate(minDate, { zone: timeZone });
  const maxIsoDate = toISODate(maxDate, { zone: timeZone });
  const min = parseDateTime(minIsoDate);
  const max = parseDateTime(maxIsoDate);
  const originalMinDateUnix = min.toMillis();
  const originalMaxDateUnix = max.toMillis();

  const minWeekDay = min.weekday;
  const diffToFirstDay = (minWeekDay - firstDay + 7) % 7;
  const adjustedMin = min.minus({ days: diffToFirstDay });

  const maxWeekDay = max.weekday;
  const diffFromLastDay = (maxWeekDay - firstDay + 7) % 7;
  const adjustedMax = max.plus({ days: 7 - diffFromLastDay });

  const availableDates: number[] = [];
  const bufferBefore: number[] = [];
  const bufferAfter: number[] = [];

  let currentDateTime = adjustedMin;

  while (currentDateTime.toMillis() < adjustedMax.toMillis()) {
    const currentWeekDay = currentDateTime.weekday;
    const dateUnix = currentDateTime.toMillis();

    if (!props.hideWeekDays?.includes(currentWeekDay)) {
      if (dateUnix < originalMinDateUnix) {
        bufferBefore.push(dateUnix);
      } else if (dateUnix > originalMaxDateUnix) {
        bufferAfter.push(dateUnix);
      } else {
        availableDates.push(dateUnix);
      }
    }
    currentDateTime = currentDateTime.plus({ days: 1 });
  }

  return {
    minDateUnix: adjustedMin.toMillis(),
    maxDateUnix: adjustedMax.toMillis(),
    originalMinDateUnix,
    originalMaxDateUnix,
    availableDates,
    bufferBefore,
    bufferAfter,
  };
};

export const findNearestDate = (numbers: number[], target: number) => {
  'worklet';
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

export const getFirstVisibleDate = (
  dateList: number[],
  dateUnix: number,
  numberOfDays: number,
  scrollByDay: boolean
) => {
  const index = findNearestDate(dateList, dateUnix).index;
  if (scrollByDay) {
    return dateList[index];
  }
  const roundedIndex = Math.floor(index / numberOfDays) * numberOfDays;
  return dateList[roundedIndex];
};
