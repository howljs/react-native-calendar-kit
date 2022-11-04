import dayjs from 'dayjs';
import { Dimensions } from 'react-native';

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

export const DEFAULT_PROPS = {
  VIEW_MODE: 'week' as const,
  FIRST_DAY: 1,
  MIN_DATE: dayjs().subtract(1, 'y').format('YYYY-MM-DD'),
  MAX_DATE: dayjs().add(1, 'y').format('YYYY-MM-DD'),
  INITIAL_DATE: dayjs().format('YYYY-MM-DD'),
  START: 0,
  END: 24,
  TIME_INTERVAL: 60,
  INIT_TIME_INTERVAL_HEIGHT: 60,
  MIN_TIME_INTERVAL_HEIGHT: 29,
  MAX_TIME_INTERVAL_HEIGHT: 116,
  CELL_BORDER_COLOR: '#E8E9ED',
  PRIMARY_COLOR: '#1973E7',
  SECONDARY_COLOR: '#5F6369',
  WHITE_COLOR: '#FFFFFF',
  HOUR_WIDTH: 53,
  DAY_BAR_HEIGHT: 60,
  SPACE_CONTENT: 16,
  DRAG_CREATE_INTERVAL: 60,
  DRAG_STEP: 10,
  UNAVAILABLE_BACKGROUND_COLOR: '#F5F5F5',
  RIGHT_EDGE_SPACING: 1,
  OVERLAP_EVENTS_SPACING: 1,
};

export const COLUMNS = { week: 7, threeDays: 3, workWeek: 5, day: 1 };

export const SECONDS_IN_DAY = 86400;
