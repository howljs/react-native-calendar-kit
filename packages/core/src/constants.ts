import type { LocaleConfigsProps, ThemeConfigs } from './types';

export enum ScrollType {
  dayBar,
  calendarGrid,
}

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

export const DEFAULT_LOCALES: Record<string, LocaleConfigsProps> = {
  en: {
    weekDayShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
    meridiem: { ante: 'am', post: 'pm' },
    more: '{count} more',
  },
};

export const DEFAULT_MIN_START_DIFFERENCE = 30;

export const MILLISECONDS_IN_DAY = 86400000;
export const MILLISECONDS_IN_MINUTE = 60000;
export const MINUTES_IN_DAY = 1440;

export const DEFAULT_SIZE = { width: 0, height: 0 };
export const DEBOUNCE_TIME = 200;
