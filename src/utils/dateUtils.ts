import moment from 'moment-timezone';
import type { DateData, HourItemType, PagesType } from '../types';
import { padStart } from './utils';

export const calculateHours = (
  start: number,
  end: number,
  step: number,
  hourFormat?: string
) => {
  const hours: HourItemType[] = [];

  // Convert the step from minutes to hours
  const stepInHours = step / 60;

  let tempStart = start,
    roundedHour: number,
    minutes: number,
    roundedMinutes: number,
    time: string;

  // Iterate over the time range from 'start' to 'end' with the specified 'step'.
  while (tempStart < end) {
    // Extract the whole hour from the 'tempStart' value.
    roundedHour = Math.floor(tempStart);

    // Calculate the minutes part of the hour.
    minutes = (tempStart - roundedHour) * 60;

    // Round the minutes to the nearest minute.
    roundedMinutes = Math.round(minutes);

    // Convert the hour and minutes to two-digit strings (e.g., "02" instead of "2").
    const hourStr = ('0' + roundedHour).slice(-2);
    const minuteStr = ('0' + roundedMinutes).slice(-2);

    if (hourFormat) {
      time = moment(
        `1970/1/1 ${hourStr}:${minuteStr}`,
        'YYYY/M/D HH:mm'
      ).format(hourFormat);
    } else {
      time = `${hourStr}:${minuteStr}`;
    }

    hours.push({
      text: time,
      hourNumber: tempStart,
    });

    // Move to the next time slot based on the 'stepInHours'.
    tempStart += stepInHours;
  }
  return hours;
};

export const parseMinutesToString = (minutes: number): string => {
  'worklet';
  const roundedHours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const formattedHours = String(roundedHours).padStart(2, '0');
  const formattedMinutes = String(remainingMinutes).padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}`;
};

const SECONDS_IN_DAY = 86400;

export const calculateDates = (
  minDateStr: string,
  maxDateStr: string,
  initialDateStr: number,
  initialFirstDay: number
): PagesType => {
  // Convert input date strings to Unix timestamps
  const initialDate = new Date(initialDateStr * 1000);
  initialDate.setHours(0, 0, 0, 0);
  const minDate = new Date(minDateStr);
  minDate.setHours(0, 0, 0, 0);
  const maxDate = new Date(maxDateStr);
  maxDate.setHours(0, 0, 0, 0);

  const initialDateUnix = initialDate.getTime() / 1000;
  const minDateUnix = minDate.getTime() / 1000;
  const maxDateUnix = maxDate.getTime() / 1000;

  const minWeekDay = minDate.getDay();
  const maxWeekDay = maxDate.getDay();

  const fDow = (7 + initialFirstDay) % 7;
  const lDow = (fDow + 6) % 7;

  const diffBefore = (minWeekDay + 7 - fDow) % 7;
  const minWeekDateUnix = minDateUnix - diffBefore * SECONDS_IN_DAY;

  const diffAfter = (lDow + 7 - maxWeekDay) % 7;
  const maxWeekDateUnix = maxDateUnix + diffAfter * SECONDS_IN_DAY;

  const day = getDataAndIndex(minDateUnix, maxDateUnix, 1, initialDateUnix);
  const threeDays = getDataAndIndex(
    minDateUnix,
    maxDateUnix,
    3,
    initialDateUnix
  );
  const week = getDataAndIndex(
    minWeekDateUnix,
    maxWeekDateUnix,
    7,
    initialDateUnix
  );

  // Calculate the starting date for the work week (excluding weekends) based on the 'initialFirstDay' parameter.
  let startWorkWeekDate = minWeekDateUnix;
  if (diffBefore === 5) {
    startWorkWeekDate = minDateUnix + 2 * SECONDS_IN_DAY;
  } else if (diffBefore === 6) {
    startWorkWeekDate = minDateUnix + SECONDS_IN_DAY;
  }

  const workWeek = getDataAndIndex(
    startWorkWeekDate,
    maxWeekDateUnix,
    7,
    initialDateUnix
  );

  // Month View
  const month: DateData = {
    extraColumns: 0,
    index: -1,
    data: [],
    minDate: minDateUnix,
    maxDate: maxDateUnix,
  };

  const minDateMonth = minDate.getMonth();
  const minDateYear = minDate.getFullYear();
  const initialDateMonth = initialDate.getMonth();
  const initialDateYear = initialDate.getFullYear();
  month.index =
    (initialDateYear - minDateYear) * 12 + (initialDateMonth - minDateMonth);

  const maxDateMonth = maxDate.getMonth();
  const maxDateYear = maxDate.getFullYear();
  const totalMonths =
    (maxDateYear - minDateYear) * 12 + (maxDateMonth - minDateMonth) + 1;

  const monthData = new Array(totalMonths);
  for (let i = 0; i < totalMonths; i++) {
    monthData[i] = i;
  }
  month.data = monthData;

  return {
    day,
    week,
    threeDays,
    workWeek,
    month,
  };
};

export const getDataAndIndex = (
  minUnixTime: number,
  maxUnixTime: number,
  columns: number,
  initialDateUnix: number
): DateData => {
  const totalDays = Math.ceil((maxUnixTime - minUnixTime) / SECONDS_IN_DAY) + 1;
  const totalPages = Math.ceil(totalDays / columns);

  const data = new Array(totalPages);
  let index = 0,
    extraColumns = 0;

  // Populate the 'data' array with Unix timestamps for each day in the range.
  for (let i = 0; i < totalPages; i++) {
    const minUnix = minUnixTime + i * SECONDS_IN_DAY * columns;
    data[i] = minUnix;

    // Find the index of the initial date in the array and calculate the number of extra columns for 'threeDays'.
    const maxUnix = minUnix + SECONDS_IN_DAY * columns;
    if (initialDateUnix >= minUnix && initialDateUnix <= maxUnix) {
      index = i;
      if (columns === 3) {
        const diffDays = (initialDateUnix - minUnix) / SECONDS_IN_DAY;
        extraColumns = diffDays;
      }
    }
  }

  return {
    data,
    index,
    extraColumns,
    minDate: minUnixTime,
    maxDate: maxUnixTime,
  };
};

export const parseUnixToDateStr = (unixTime: number) => {
  'worklet';
  const date = new Date(unixTime * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getWeekDayFromUnix = (unixTime: number) => {
  const date = new Date(unixTime * 1000);
  return date.getDay();
};

export const isSameDate = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const buildDtStart = (dateUnix: number) => {
  const date = new Date(dateUnix * 1000);
  return [
    'DTSTART:',
    padStart(date.getUTCFullYear().toString(), 4, '0'),
    padStart(date.getUTCMonth() + 1, 2, '0'),
    padStart(date.getUTCDate(), 2, '0'),
    'T',
    padStart(date.getUTCHours(), 2, '0'),
    padStart(date.getUTCMinutes(), 2, '0'),
    padStart(date.getUTCSeconds(), 2, '0'),
    'Z',
  ].join('');
};

export const dateWithZone = (
  timeZone?: string,
  date?: Date | number | string
) => {
  let dateObject;
  if (typeof date === 'number') {
    dateObject = new Date(date * 1000);
  } else if (typeof date === 'object' || typeof date === 'string') {
    dateObject = new Date(date);
  } else {
    dateObject = new Date();
  }
  if (!timeZone) {
    return dateObject;
  }
  const timeZoneOffset = moment(dateObject).tz(timeZone).utcOffset();
  const localOffset = moment(dateObject).utcOffset();
  const offset = timeZoneOffset - localOffset;
  dateObject.setMinutes(dateObject.getMinutes() + offset);
  return dateObject;
};

export const unixTimeWithZone = (timeZone?: string, date?: Date | number) => {
  const dateObj = dateWithZone(timeZone, date);
  return Math.floor(dateObj.getTime() / 1000);
};
