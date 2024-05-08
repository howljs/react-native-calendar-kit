import type { LocaleConfigs, ThemeConfigs } from './types';

export const DEFAULT_THEME: ThemeConfigs = {
  colors: {
    primary: '#1a73e8',
    onPrimary: '#fff',
    background: '#fff',
    onBackground: '#000',
    border: '#dadce0',
    text: '#000',
    surface: '#ECECEC',
  },
};

export const DEFAULT_DARK_THEME: ThemeConfigs = {
  colors: {
    primary: '#4E98FA',
    onPrimary: '#FFF',
    background: '#1A1B21',
    onBackground: '#FFF',
    border: '#46464C',
    text: '#FFF',
    surface: '#545454',
  },
};

export const HOUR_WIDTH = 60;
export const DAY_BAR_HEIGHT = 60;

export const INITIAL_DATE = new Date().toISOString();

export const MIN_DATE = new Date(
  new Date().getFullYear() - 2,
  new Date().getMonth(),
  new Date().getDate()
).toISOString();

export const MAX_DATE = new Date(
  new Date().getFullYear() + 2,
  new Date().getMonth(),
  new Date().getDate()
).toISOString();

export const DEFAULT_LOCALES: Record<string, LocaleConfigs> = {
  en: {
    weekDayShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
    meridiem: { ante: 'am', post: 'pm' },
  },
};

export const MILLISECONDS_IN_DAY = 86400000;
export const MILLISECONDS_IN_MINUTE = 60000;
export const MINUTES_IN_DAY = 1440;

export enum ScrollType {
  dayBar,
  calendarGrid,
}

export const EXTRA_HEIGHT = 300;
export const HOUR_SHORT_LINE_WIDTH = 8;
export const MIN_ALL_DAY_EVENT_HEIGHT = 15;
export const MAX_ALL_DAY_EVENT_HEIGHT = 25;
export const COLLAPSED_ROW_COUNT = 2;

export const NUMBER_OF_DAYS = { day: 1, week: 7, workWeek: 5 };
