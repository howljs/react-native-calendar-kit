import type { CalendarKitTheme, LocaleConfigs } from './types';

export const DEFAULT_THEME: CalendarKitTheme = {
  primaryColor: '#1973E7',
  supportPrimaryColor: '#6fa6ed',
  backgroundColor: '#FFFFFF',
  cellBorderColor: '#E8E9ED',

  dayBar: { backgroundColor: '#FFFFFF' },
  hourColumn: { backgroundColor: '#FFFFFF' },

  unavailableBackgroundColor: '#F5F5F5',

  nowIndicatorColor: '#1973E7',
};

export const START_OFFSET = 500;

export const LONG_PRESS_DELAY = 350;

export const HOUR_LINE_WIDTH = 8;

export enum ListType {
  DayBar,
  Timeline,
}

export const MONTH_ROWS = 6;
export const MONTH_COLUMNS = 7;

export const YMD_FORMAT = 'YYYY-MM-DD';

export const FIRST_DAY_NUMBER = { monday: 1, saturday: 6, sunday: 0 };

export const SECONDS_IN_DAY = 86400;

export const DEFAULT_LOCALES: Record<string, LocaleConfigs> = {
  en: { weekDayShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_') },
};

export enum VerticalScrollDirection {
  None,
  Up,
  Down,
}
