import type { LocaleConfigsProps, ThemeConfigs } from './types';

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

export const HOUR_WIDTH = 60;
export const MIN_TIME_INTERVAL_HEIGHT = 60;
export const MAX_TIME_INTERVAL_HEIGHT = 124;
export const INITIAL_TIME_INTERVAL_HEIGHT = 60;
export const SPACE_FROM_TOP = 16;
export const SPACE_FROM_BOTTOM = 16;
export const DEFAULT_NUMBER_OF_DAYS = 7;
export const DEFAULT_START = 0;
export const DEFAULT_END = 1440;
export const DEFAULT_TIME_INTERVAL = 60;
export const DEFAULT_FIRST_DAY = 1;

export const MILLISECONDS_IN_DAY = 86400000;
export const MILLISECONDS_IN_MINUTE = 60000;
export const MINUTES_IN_DAY = 1440;

export enum ScrollType {
  dayBar,
  calendarGrid,
}

export const AUTO_SCROLL_INTERVAL = 800;
export const SCROLL_THRESHOLD = 100;
export const AUTO_SCROLL_SPEED = 100;

export const DEFAULT_LOCALES: Record<string, LocaleConfigsProps> = {
  en: {
    weekDayShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
    meridiem: { ante: 'am', post: 'pm' },
    more: '{count} more',
  },
};

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

export const DEFAULT_MIN_START_DIFFERENCE = 30;

export const DEFAULT_SIZE = { width: 0, height: 0 };
export const DEBOUNCE_TIME = 200;
