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
