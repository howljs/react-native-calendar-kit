import type { WeekdayNumbers } from 'luxon';
import {
  createContext,
  type FC,
  type MutableRefObject,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { PixelRatio } from 'react-native';
import type { ScrollView } from 'react-native-gesture-handler';
import {
  type AnimatedRef,
  type DerivedValue,
  type SharedValue,
  useAnimatedRef,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

import type { CalendarList } from '../CalendarList';
import {
  DEFAULT_END,
  DEFAULT_FIRST_DAY,
  DEFAULT_NUMBER_OF_DAYS,
  DEFAULT_START,
  DEFAULT_TIME_INTERVAL,
  HOUR_WIDTH,
  INITIAL_DATE,
  INITIAL_TIME_INTERVAL_HEIGHT,
  MAX_DATE,
  MAX_TIME_INTERVAL_HEIGHT,
  MIN_DATE,
  MIN_TIME_INTERVAL_HEIGHT,
  SPACE_FROM_BOTTOM,
  SPACE_FROM_TOP,
} from '../constants';
import { parseDateTime, toISODate } from '../dateUtils';
import useHideWeekDays from '../hooks/useHideWeekDays';
import useLazyRef from '../hooks/useLazyRef';
import type { DateType } from '../types';
import {
  calculateSlots,
  type CalendarData,
  getFirstVisibleDate,
  prepareCalendarRange,
} from '../utils';
import { useLayout } from './LayoutProvider';

export interface CalendarProviderProps {
  /**
   * Number of days to display
   *
   * Default: `7`
   */
  numberOfDays?: number;

  /**
   * Calendar start time (in minutes)
   *
   * - Default: `0`
   */
  start?: number;

  /**
   * Calendar end time (in minutes)
   *
   * - Default: `1440` (24 hours)
   */
  end?: number;

  /**
   * The interval of time slots in timeline. (in minutes)
   *
   * - Default: `60`
   */
  timeInterval?: number;

  /**
   * Enable scroll by day
   *
   * Default: `numberOfDays < 7 ? true : false`
   */
  scrollByDay?: boolean;

  /** Hide week days */
  hideWeekDays?: WeekdayNumbers[];

  /**
   * Initial time interval height
   *
   * - Default: `60`
   */
  timeIntervalHeight?: number;

  /**
   * Maximum time interval height.
   *
   * - Default: `116`
   */
  maxTimeIntervalHeight?: number;

  /**
   * Minimum time interval height
   *
   * - Default: `60`
   */
  minTimeIntervalHeight?: number;

  /**
   * Initial time interval height
   *
   * - Default: `60`
   */
  initialTimeIntervalHeight?: number;

  /**
   * Space from top
   *
   * - Default: `16`
   */
  spaceFromTop?: number;

  /**
   * Space from bottom
   *
   * - Default: `16`
   */
  spaceFromBottom?: number;

  /**
   * Hour width
   *
   * - Default: `60`
   */
  hourWidth?: number;

  /**
   * Minimum display date.
   *
   * - Default: 2 year ago from today
   */
  minDate?: DateType;

  /**
   * Maximum display date.
   *
   * - Default: 2 year later from today
   */
  maxDate?: DateType;

  /**
   * Initial display date.
   *
   * - Default: today
   */
  initialDate?: DateType;

  /**
   * First day of the week.
   *
   * - Default: `1` (Monday)
   */
  firstDay?: WeekdayNumbers;

  /** Custom time zone */
  timeZone?: string;
}

export type CalendarContextType = {
  gridListRef: AnimatedRef<CalendarList<number>>;
  verticalListRef: AnimatedRef<ScrollView>;
  headerListRef: AnimatedRef<CalendarList<number>>;
  calendarWidth: number;
  listWidth: number;
  listHeight: number;
  hourWidth: number;
  numberOfDays: number;
  totalSlots: number;
  minTimeIntervalHeight: number;
  maxTimeIntervalHeight: number;
  timeIntervalHeight: SharedValue<number>;
  scrollByDay: boolean;
  minuteHeight: DerivedValue<number>;
  timelineHeight: DerivedValue<number>;
  calendarData: CalendarData;
  visibleDateUnix: MutableRefObject<number>;
  dateList: number[];
  slots: number[];
  columnWidth: number;
};

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const CalendarProvider: FC<PropsWithChildren<CalendarProviderProps>> = ({
  numberOfDays: inputNumberOfDays = DEFAULT_NUMBER_OF_DAYS,
  start = DEFAULT_START,
  end = DEFAULT_END,
  timeInterval = DEFAULT_TIME_INTERVAL,
  maxTimeIntervalHeight = MAX_TIME_INTERVAL_HEIGHT,
  scrollByDay: inputScrollByDay = inputNumberOfDays < 7,
  minTimeIntervalHeight = MIN_TIME_INTERVAL_HEIGHT,
  initialTimeIntervalHeight = INITIAL_TIME_INTERVAL_HEIGHT,
  spaceFromTop = SPACE_FROM_TOP,
  spaceFromBottom = SPACE_FROM_BOTTOM,
  children,
  hourWidth: inputHourWidth = HOUR_WIDTH,
  hideWeekDays: inputHideWeekDays,
  minDate = MIN_DATE,
  maxDate = MAX_DATE,
  firstDay = DEFAULT_FIRST_DAY,
  initialDate = INITIAL_DATE,
  timeZone: inputTimeZone,
}) => {
  if (inputNumberOfDays > 7) {
    throw new Error('The maximum number of days is 7');
  }
  const calendarWidth = useLayout(useCallback((state) => state.width, []));

  const verticalListRef = useAnimatedRef<ScrollView>();
  const gridListRef = useAnimatedRef<CalendarList<number>>();
  const headerListRef = useAnimatedRef<CalendarList<number>>();
  const timeIntervalHeight = useSharedValue(initialTimeIntervalHeight);

  const hideWeekDays = useHideWeekDays(inputHideWeekDays);
  const daysToShow = 7 - hideWeekDays.length;
  const numberOfDays = inputNumberOfDays > daysToShow ? daysToShow : inputNumberOfDays;

  const hourWidth = useMemo(() => PixelRatio.roundToNearestPixel(inputHourWidth), [inputHourWidth]);
  const slots = useMemo(() => calculateSlots(start, end, timeInterval), [start, end, timeInterval]);
  const totalSlots = slots.length;
  const extraHeight = spaceFromTop + spaceFromBottom;
  const maxTimelineHeight = totalSlots * maxTimeIntervalHeight + extraHeight;
  const isSingleDay = numberOfDays === 1;
  const listWidth = isSingleDay ? calendarWidth : calendarWidth - hourWidth;
  const scrollByDay = isSingleDay || inputScrollByDay;
  const columnWidth = useMemo(() => listWidth / numberOfDays, [listWidth, numberOfDays]);

  const minuteHeight = useDerivedValue(() => timeIntervalHeight.value / timeInterval);
  const timelineHeight = useDerivedValue(
    () => totalSlots * timeIntervalHeight.value + 1 + extraHeight
  );

  const timeZone = useMemo(() => {
    const parsedTimeZone = parseDateTime(undefined, { zone: inputTimeZone });
    if (!parsedTimeZone.isValid) {
      console.warn('TimeZone is invalid, using local timeZone');
      return 'local';
    }
    return inputTimeZone || 'local';
  }, [inputTimeZone]);

  const calendarData = useMemo(
    () =>
      prepareCalendarRange({
        minDate,
        maxDate,
        firstDay,
        hideWeekDays,
        timeZone,
      }),
    [minDate, maxDate, firstDay, hideWeekDays, timeZone]
  );

  const dateList = useMemo(() => {
    if (isSingleDay) {
      return calendarData.availableDates;
    }

    return calendarData.bufferBefore
      .concat(calendarData.availableDates)
      .concat(calendarData.bufferAfter);
  }, [calendarData, isSingleDay]);

  const visibleDateUnix = useLazyRef(() => {
    const zonedInitialDate = toISODate(initialDate, { zone: timeZone });
    const dateUnix = parseDateTime(zonedInitialDate).toMillis();
    return getFirstVisibleDate(dateList, dateUnix, numberOfDays, scrollByDay);
  });

  const calendarContextValue = useMemo<CalendarContextType>(
    () => ({
      gridListRef,
      verticalListRef,
      headerListRef,
      calendarWidth,
      listWidth,
      listHeight: maxTimelineHeight,
      hourWidth,
      numberOfDays,
      totalSlots,
      minTimeIntervalHeight,
      maxTimeIntervalHeight,
      timeIntervalHeight,
      scrollByDay,
      minuteHeight,
      timelineHeight,
      calendarData,
      visibleDateUnix,
      dateList,
      slots,
      columnWidth,
    }),
    [
      gridListRef,
      verticalListRef,
      headerListRef,
      calendarWidth,
      listWidth,
      maxTimelineHeight,
      hourWidth,
      numberOfDays,
      totalSlots,
      minTimeIntervalHeight,
      maxTimeIntervalHeight,
      timeIntervalHeight,
      scrollByDay,
      minuteHeight,
      timelineHeight,
      calendarData,
      visibleDateUnix,
      dateList,
      slots,
      columnWidth,
    ]
  );
  return (
    <CalendarContext.Provider value={calendarContextValue}>{children}</CalendarContext.Provider>
  );
};

export default CalendarProvider;

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
