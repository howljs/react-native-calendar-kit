import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PixelRatio, StyleSheet, type LayoutChangeEvent } from 'react-native';
import {
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedRef,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import {
  DEFAULT_LOCALES,
  DEFAULT_THEME,
  FIRST_DAY_NUMBER,
  LONG_PRESS_DELAY,
} from '../constants';
import useDebounce from '../hooks/useDebounce';
import useLazyRef from '../hooks/useLazyRef';
import useMergeDeep from '../hooks/useMergeDeep';
import type {
  CalendarKitTheme,
  CalendarProviderProps,
  CalendarViewMode,
  HourItemType,
  LocaleConfigs,
  PagesType,
} from '../types';
import {
  calculateDates,
  calculateHours,
  unixTimeWithZone,
} from '../utils/dateUtils';
import { mergeDeep } from '../utils/utils';

type CalendarSize = { width: number; height: number };

export interface CalendarKitContextValue {
  viewMode: CalendarViewMode;
  numberOfColumns: number;
  theme: CalendarKitTheme;
  calendarSize: CalendarSize;
  isRTL: boolean;
  hourWidth: number;
  dayBarHeight: number;
  start: number;
  end: number;
  timeInterval: number;
  totalHours: number;
  hours: HourItemType[];
  maxTimelineHeight: number;
  timeIntervalHeight: SharedValue<number>;
  timelineHeight: Readonly<SharedValue<number>>;
  timelineWidth: number;
  minuteHeight: Readonly<Animated.SharedValue<number>>;
  scrollVisibleHeight: SharedValue<number>;
  pages: PagesType;
  minDate: string;
  maxDate: string;
  firstDayOfWeek: number;
  delayLongPressToCreate: number;
  timeZone?: string;
  renderAheadItem: number;
  locales: React.MutableRefObject<Record<string, LocaleConfigs>>;
  initialTimeIntervalHeight: number;
  timelineIndex: SharedValue<number>;
  offsetY: SharedValue<number>;
  verticalListRef: React.RefObject<ScrollView>;
  rightEdgeSpacing: number;
  overlapEventsSpacing: number;
  useAllDayFilter: boolean;
  allDayEventHeight: number;
  maxAllDayHeight: number;
  isTriggerMomentum: SharedValue<boolean>;
  visibleStartUnix: SharedValue<number>;
  onChangeUnix: SharedValue<number>;
}

const CalendarKitContext = createContext<CalendarKitContextValue | undefined>(
  undefined
);

const NUMBER_OF_COLUMNS: Record<CalendarViewMode, number> = {
  day: 1,
  threeDays: 3,
  week: 7,
  workWeek: 5,
  month: 7,
};

const getDefaultDate = (diffYear?: number) => {
  const currentDate = new Date();
  if (diffYear) {
    currentDate.setFullYear(currentDate.getFullYear() + diffYear);
  }
  return currentDate.toISOString().slice(0, 10);
};

const defaultMinDate = getDefaultDate(-2);
const defaultMaxDate = getDefaultDate(2);

const CalendarKitProvider: React.FC<CalendarProviderProps> = ({
  children,
  viewMode = 'week',
  theme: initialTheme,
  containerStyle,
  isRTL = false,
  start = 0,
  end = 24,
  timeInterval = 60,
  hourFormat,
  initialTimeIntervalHeight = 60,
  hourWidth = 53,
  dayBarHeight = 53,
  firstDay = 'monday',
  minDate = defaultMinDate,
  maxDate = defaultMaxDate,
  initialDate,
  delayLongPressToCreate = LONG_PRESS_DELAY,
  timeZone,
  renderAheadItem = 2,
  initialLocales,
  rightEdgeSpacing = 1,
  overlapEventsSpacing = 1,
  useAllDayFilter = false,
  allDayEventHeight = 16,
}) => {
  const numberOfColumns = NUMBER_OF_COLUMNS[viewMode];
  const [calendarSize, setCalendarSize] = useState<CalendarSize>({
    width: 0,
    height: 0,
  });
  const debounceSize = useDebounce<CalendarSize>(calendarSize, 100);
  const timelineWidth = debounceSize.width - hourWidth;

  const locales = useRef(mergeDeep(DEFAULT_LOCALES, initialLocales));
  const theme = useMergeDeep(DEFAULT_THEME, initialTheme);

  const initialDateRef = useLazyRef(() => {
    if (initialDate) {
      const initDate = new Date(initialDate);
      initDate.setHours(0, 0, 0, 0);
      return initDate.getTime() / 1000;
    }
    return unixTimeWithZone(timeZone);
  });

  const firstDayOfWeek = FIRST_DAY_NUMBER[firstDay];
  const pages = useMemo(
    () =>
      calculateDates(minDate, maxDate, initialDateRef.current, firstDayOfWeek),
    [initialDateRef, firstDayOfWeek, maxDate, minDate]
  );

  const hours = useMemo(
    () => calculateHours(start, end, timeInterval, hourFormat),
    [end, start, timeInterval, hourFormat]
  );
  const totalHours = hours.length;

  const maxTimelineHeight = totalHours * initialTimeIntervalHeight;
  const timeIntervalHeight = useSharedValue(initialTimeIntervalHeight);
  const minuteHeight = useDerivedValue(
    () => timeIntervalHeight.value / timeInterval
  );

  const timelineHeight = useDerivedValue(
    () => totalHours * timeIntervalHeight.value + 1,
    [totalHours]
  );

  const scrollVisibleHeight = useSharedValue(0);

  const offsetY = useSharedValue(0);
  const verticalListRef = useAnimatedRef<ScrollView>();

  const timelineIndex = useSharedValue(pages[viewMode].index);
  const maxAllDayHeight = (allDayEventHeight + overlapEventsSpacing) * 3 + 8;
  const isTriggerMomentum = useSharedValue(false);
  const visibleStartUnix = useSharedValue(
    pages[viewMode].data[pages[viewMode].index] || initialDateRef.current
  );
  const onChangeUnix = useSharedValue(0);

  const value = useMemo(
    () => ({
      viewMode,
      theme,
      calendarSize: debounceSize,
      isRTL,
      start,
      end,
      timeInterval,
      totalHours,
      hours,
      numberOfColumns,
      maxTimelineHeight,
      timeIntervalHeight,
      timelineHeight,
      timelineWidth,
      hourWidth,
      dayBarHeight,
      minuteHeight,
      scrollVisibleHeight,
      minDate,
      maxDate,
      firstDayOfWeek,
      pages,
      delayLongPressToCreate,
      timeZone,
      renderAheadItem,
      locales,
      initialTimeIntervalHeight,
      timelineIndex,
      offsetY,
      verticalListRef,
      rightEdgeSpacing,
      overlapEventsSpacing,
      useAllDayFilter,
      allDayEventHeight,
      maxAllDayHeight,
      isTriggerMomentum,
      visibleStartUnix,
      onChangeUnix,
    }),
    [
      viewMode,
      theme,
      debounceSize,
      isRTL,
      start,
      end,
      timeInterval,
      totalHours,
      hours,
      numberOfColumns,
      maxTimelineHeight,
      timeIntervalHeight,
      timelineHeight,
      timelineWidth,
      hourWidth,
      dayBarHeight,
      minuteHeight,
      scrollVisibleHeight,
      minDate,
      maxDate,
      firstDayOfWeek,
      pages,
      delayLongPressToCreate,
      timeZone,
      renderAheadItem,
      initialTimeIntervalHeight,
      timelineIndex,
      offsetY,
      verticalListRef,
      rightEdgeSpacing,
      overlapEventsSpacing,
      useAllDayFilter,
      allDayEventHeight,
      maxAllDayHeight,
      isTriggerMomentum,
      visibleStartUnix,
      onChangeUnix,
    ]
  );

  const _onLayout = (e: LayoutChangeEvent) => {
    const layout = e.nativeEvent.layout;
    setCalendarSize({
      width: PixelRatio.roundToNearestPixel(layout.width),
      height: layout.height,
    });
  };

  return (
    <CalendarKitContext.Provider value={value}>
      <GestureHandlerRootView
        onLayout={_onLayout}
        style={[
          styles.container,
          { backgroundColor: theme.backgroundColor },
          containerStyle,
        ]}
      >
        {children}
      </GestureHandlerRootView>
    </CalendarKitContext.Provider>
  );
};

export default CalendarKitProvider;

const styles = StyleSheet.create({
  container: { height: '100%', width: '100%' },
});

export const useCalendarKit = () => {
  const value = useContext(CalendarKitContext);
  if (!value) {
    throw new Error(
      'useCalendarKit must be called from within CalendarKitProvider!'
    );
  }
  return value;
};
