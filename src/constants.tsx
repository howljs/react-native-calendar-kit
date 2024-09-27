import type { LocaleConfigsProps, ThemeConfigs } from './types';

export const DEFAULT_THEME: ThemeConfigs = {
  colors: {
    primary: '#1a73e8',
    onPrimary: '#fff',
    background: '#fff',
    onBackground: '#000',
    border: '#dadce0',
    text: '#000',
    surface: '#ECECEC',
    onSurface: '#000',
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

export const DEFAULT_LOCALES: Record<string, LocaleConfigsProps> = {
  en: {
    weekDayShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
    meridiem: { ante: 'am', post: 'pm' },
    more: '{count} more',
  },
};

export const MILLISECONDS_IN_DAY = 86400000;
export const MILLISECONDS_IN_MINUTE = 60000;
export const MINUTES_IN_DAY = 1440;

export enum ScrollType {
  dayBar,
  calendarGrid,
}

export enum ScrollTypeMonth {
  header,
  body,
}

export const EXTRA_HEIGHT = 300;
export const HOUR_SHORT_LINE_WIDTH = 8;

export const COLLAPSED_ITEMS = 2;
export const HEADER_BOTTOM_HEIGHT = 20;
export const DEFAULT_SIZE = { width: 0, height: 0 };
export const DEBOUNCE_TIME = 200;

export const MIN_ALL_DAY_MINUTES = 20;
export const MAX_ALL_DAY_MINUTES = 30;
export const DEFAULT_ALL_DAY_MINUTES = 20;

export const DEFAULT_MIN_START_DIFFERENCE = 30;
