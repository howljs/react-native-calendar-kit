import { DateTime, type DateTimeOptions, type WeekdayNumbers } from 'luxon';
import type { DateType } from '../types';

export const parseDateTime = (date?: DateType, opts?: DateTimeOptions) => {
  if (date instanceof DateTime) {
    return opts ? DateTime.fromObject(date.toObject(), opts) : date;
  }
  if (date instanceof Date) {
    return DateTime.fromJSDate(date, opts);
  }
  if (typeof date === 'string') {
    return DateTime.fromISO(date, opts);
  }
  if (typeof date === 'number') {
    return DateTime.fromMillis(date, opts);
  }

  return DateTime.local(opts);
};

export const parseDate = (date?: DateType, forceNewDate: boolean = true) => {
  if (date instanceof Date && !forceNewDate) {
    return forceNewDate ? new Date(date) : date;
  }
  if (date instanceof DateTime) {
    return date.toJSDate();
  }
  if (date) {
    return new Date(date);
  }
  return new Date();
};

export const startOfWeek = (date: DateType, weekStartsOn: WeekdayNumbers) => {
  let currentDate = parseDateTime(date);
  let diff = (currentDate.weekday - weekStartsOn + 7) % 7;
  return currentDate.minus({ days: diff }).startOf('day');
};

export const endOfWeek = (date: DateType, weekStartsOn: WeekdayNumbers) => {
  return startOfWeek(date, weekStartsOn).plus({ days: 6 }).endOf('day');
};

export const diffDays = (date1: DateType, date2: DateType) => {
  const dt1 = parseDateTime(date1);
  const dt2 = parseDateTime(date2);
  return dt1.diff(dt2, 'days').days;
};

export const dateTimeToISOString = (date: DateTime) => date.toUTC().toISO();

export const dateToDtStart = (date: DateType) => {
  const parsedDate = parseDateTime(date).toUTC();
  return [
    'DTSTART:',
    parsedDate.year,
    parsedDate.month.toString().padStart(2, '0'),
    parsedDate.day.toString().padStart(2, '0'),
    'T',
    parsedDate.hour.toString().padStart(2, '0'),
    parsedDate.minute.toString().padStart(2, '0'),
    parsedDate.second.toString().padStart(2, '0'),
    'Z\n',
  ].join('');
};

export const toHourStr = (
  originalMinutes: number,
  hourFormat: string,
  meridiem: { ante: string; post: string }
) => {
  'worklet';
  const hours = Math.floor(originalMinutes / 60);
  const minutes = Math.floor(originalMinutes % 60);
  const formatTokens: Record<string, string | number> = {
    HH: hours.toString().padStart(2, '0'),
    hh: (hours % 12 || 12).toString().padStart(2, '0'),
    kk: (hours + 1).toString().padStart(2, '0'),
    mm: minutes.toString().padStart(2, '0'),
    ss: '00',
    H: hours,
    h: hours % 12 || 12,
    k: hours + 1,
    m: minutes,
    s: '0',
    A: hours >= 12 ? meridiem.post.toUpperCase() : meridiem.ante.toUpperCase(),
    a: hours >= 12 ? meridiem.post : meridiem.ante,
  };

  let formattedTime = hourFormat;
  for (const [token, value] of Object.entries(formatTokens)) {
    formattedTime = formattedTime.replace(token, value.toString());
  }
  return formattedTime;
};

export const getWeekNumberOfYear = (date: number) => {
  'worklet';
  const dt = new Date(date);
  const firstDayOfYear = new Date(dt.getFullYear(), 0, 1);
  const pastDaysOfYear = (dt.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const forceUpdateZone = (date: DateType, zone: string = 'local') => {
  return parseDateTime(date).setZone(zone, {
    keepLocalTime: true,
  });
};
