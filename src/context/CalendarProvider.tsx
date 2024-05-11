import { Settings, type WeekdayNumbers } from 'luxon';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type PropsWithChildren,
} from 'react';
import { PixelRatio } from 'react-native';
import Animated, {
  runOnUI,
  useAnimatedRef,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type AnimatedRef,
  type SharedValue,
} from 'react-native-reanimated';
import { CalendarListViewHandle } from '../components/CalendarListView';
import {
  HOUR_WIDTH,
  INITIAL_DATE,
  MAX_DATE,
  MILLISECONDS_IN_DAY,
  MIN_DATE,
  NUMBER_OF_DAYS,
  ScrollType,
} from '../constants';
import useLatestCallback from '../hooks/useLatestCallback';
import useLazyRef from '../hooks/useLazyRef';
import type {
  CalendarKitHandle,
  CalendarProviderProps,
  CalendarViewMode,
  DateType,
  GoToDateOptions,
} from '../types';
import Haptic from '../utils/HapticService';
import { parseDateTime, startOfWeek } from '../utils/dateUtils';
import {
  calculateSlots,
  clampValues,
  prepareCalendarRange,
  type DataByMode,
} from '../utils/utils';
import ActionsProvider from './ActionsProvider';
import EventsProvider from './EventsProvider';
import HighlightDatesProvider from './HighlightDatesProvider';
import { useLayout } from './LayoutProvider';
import { LoadingContext } from './LoadingContext';
import LocaleProvider from './LocaleProvider';
import NowIndicatorProvider from './NowIndicatorProvider';
import ThemeProvider from './ThemeProvider';
import TimeZoneProvider from './TimeZoneProvider';
import UnavailableHoursProvider from './UnavailableHoursProvider';

Settings.throwOnInvalid = true;

export interface CalendarContextProps {
  viewMode: CalendarViewMode;
  calendarData: DataByMode;
  calendarLayout: { width: number; height: number };
  visibleDateUnix: React.MutableRefObject<number>;
  hourWidth: number;
  numberOfDays: number;
  verticalListRef: AnimatedRef<Animated.ScrollView>;
  dayBarListRef: AnimatedRef<Animated.ScrollView>;
  gridListRef: AnimatedRef<Animated.ScrollView>;
  columnWidthAnim: SharedValue<number>;
  firstDay: WeekdayNumbers;
  scrollType: React.MutableRefObject<ScrollType | null>;
  offsetY: SharedValue<number>;
  minuteHeight: Readonly<SharedValue<number>>;
  maxTimelineHeight: number;
  maxTimeIntervalHeight: number;
  minTimeIntervalHeight: number;
  timeIntervalHeight: SharedValue<number>;
  allowPinchToZoom: boolean;
  spaceFromTop: number;
  spaceFromBottom: number;
  hours: number[];
  timelineHeight: Readonly<SharedValue<number>>;
  totalSlots: number;
  start: number;
  end: number;
  timeInterval: number;
  scrollVisibleHeight: React.MutableRefObject<number>;
  offsetX: SharedValue<number>;
  isTriggerMomentum: React.MutableRefObject<boolean>;
  showWeekNumber: boolean;
  calendarGridWidth: number;
  columnWidth: number;
  scrollByDay: boolean;
  initialOffset: number;
  isRTL: boolean;
  snapToInterval?: number;
  columns: number;
  triggerDateChanged: React.MutableRefObject<number | undefined>;
  visibleDateUnixAnim: SharedValue<number>;
  calendarListRef: React.RefObject<CalendarListViewHandle>;
  startOffset: Readonly<SharedValue<number>>;
}

export const CalendarContext = React.createContext<
  CalendarContextProps | undefined
>(undefined);

const CalendarProvider: React.ForwardRefRenderFunction<
  CalendarKitHandle,
  PropsWithChildren<CalendarProviderProps>
> = (
  {
    theme,
    darkTheme,
    children,
    hourWidth: initialHourWidth = HOUR_WIDTH,
    viewMode = 'week',
    firstDay = 1,
    minDate = MIN_DATE,
    maxDate = MAX_DATE,
    initialDate = INITIAL_DATE,
    initialLocales,
    locale,
    isLoading = false,
    spaceFromTop = 16,
    spaceFromBottom = 16,
    start = 0,
    end = 1440,
    timeInterval = 60,
    maxTimeIntervalHeight = 116,
    minTimeIntervalHeight = 60,
    allowPinchToZoom = false,
    initialTimeIntervalHeight = 60,
    timeZone = 'local',
    themeMode = 'light',
    showWeekNumber = false,
    onChange,
    onDateChanged,
    onPressBackground,
    onPressDayNumber,
    onRefresh,
    scrollByDay = false,
    unavailableHours,
    highlightDates,
    events,
    onPressEvent,
    numberOfDays = NUMBER_OF_DAYS[viewMode] || 7,
    scrollToNow = true,
  },
  ref
) => {
  // TODO: Implement haptic feedback
  const useHaptic = false;
  // TODO: Implement all day events
  const useAllDayEvent = false;
  // TODO: Implement RTL
  const isRTL = false;

  if (numberOfDays > 7) {
    throw new Error('The maximum number of days is 7');
  }

  const isSingleDay = numberOfDays === 1;
  // Columns based on the view mode
  const columns = isSingleDay ? 1 : viewMode === 'workWeek' ? 5 : 7;

  const calendarLayout = useLayout();
  const hourWidth = useMemo(
    () => PixelRatio.roundToNearestPixel(initialHourWidth),
    [initialHourWidth]
  );

  const calendarData = useMemo(
    () =>
      prepareCalendarRange({
        minDate,
        maxDate,
        firstDay,
        isSingleDay,
      }),
    [firstDay, maxDate, minDate, isSingleDay]
  );

  const hours = useMemo(
    () => calculateSlots(start, end, timeInterval),
    [start, end, timeInterval]
  );

  const columnWidth = useMemo(() => {
    return (calendarLayout.width - hourWidth) / numberOfDays;
  }, [calendarLayout.width, hourWidth, numberOfDays]);

  const calendarGridWidth = useMemo(() => {
    if (isSingleDay) {
      return calendarLayout.width;
    }

    return columnWidth * columns;
  }, [calendarLayout.width, columnWidth, columns, isSingleDay]);

  const calendarListRef = useRef<CalendarListViewHandle>(null);
  const verticalListRef = useAnimatedRef<Animated.ScrollView>();
  const dayBarListRef = useAnimatedRef<Animated.ScrollView>();
  const gridListRef = useAnimatedRef<Animated.ScrollView>();
  const scrollType = useRef<ScrollType | null>(null);
  const isTriggerMomentum = useRef(false);
  const scrollVisibleHeight = useRef(0);
  const triggerDateChanged = useRef<number>();

  // Current visible date
  const visibleDateUnix = useLazyRef(() => {
    const zonedInitialDate = parseDateTime(initialDate, {
      zone: timeZone,
    }).toISODate();
    let date;
    if (viewMode === 'week') {
      date = startOfWeek(zonedInitialDate, firstDay);
    } else {
      date = parseDateTime(zonedInitialDate);
    }
    return date.toMillis();
  });
  const visibleDateUnixAnim = useSharedValue(visibleDateUnix.current);

  const initialOffset = useMemo(() => {
    const diffInMs = visibleDateUnix.current - calendarData.minDateUnix;
    if (isSingleDay || scrollByDay) {
      const diffDays = Math.floor(diffInMs / MILLISECONDS_IN_DAY);
      const colWidth = isSingleDay ? calendarGridWidth : columnWidth;
      return diffDays * colWidth;
    }

    const pageIndex = Math.floor(diffInMs / (7 * MILLISECONDS_IN_DAY));
    return pageIndex * (columnWidth * columns);
  }, [
    calendarData.minDateUnix,
    calendarGridWidth,
    columnWidth,
    columns,
    isSingleDay,
    scrollByDay,
    visibleDateUnix,
  ]);

  const columnWidthAnim = useSharedValue(columnWidth);
  const offsetY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const timeIntervalHeight = useSharedValue(initialTimeIntervalHeight);

  const totalSlots = hours.length;
  const extraHeight = spaceFromTop + spaceFromBottom;
  const maxTimelineHeight = totalSlots * maxTimeIntervalHeight + extraHeight;

  const minuteHeight = useDerivedValue(
    () => timeIntervalHeight.value / timeInterval
  );
  const timelineHeight = useDerivedValue(
    () => totalSlots * timeIntervalHeight.value + 1 + extraHeight
  );
  const startOffset = useDerivedValue(() => start * minuteHeight.value);

  const goToDate = useLatestCallback((props?: GoToDateOptions) => {
    const date = parseDateTime(props?.date, { zone: timeZone });
    const diffInMs = date.toMillis() - calendarData.minDateUnix;
    let offset = 0;
    if (isSingleDay || scrollByDay) {
      const diffDays = Math.floor(diffInMs / MILLISECONDS_IN_DAY);
      const colWidth = isSingleDay ? calendarGridWidth : columnWidth;
      triggerDateChanged.current =
        calendarData.minDateUnix + diffDays * MILLISECONDS_IN_DAY;
      offset = diffDays * colWidth;
    } else {
      const pageIndex = Math.floor(diffInMs / (7 * MILLISECONDS_IN_DAY));
      offset = pageIndex * (columnWidth * columns);
      const diffDays = pageIndex * 7;
      triggerDateChanged.current =
        calendarData.minDateUnix + diffDays * MILLISECONDS_IN_DAY;
    }

    const maxDays = Math.floor(
      (calendarData.maxDateUnix - calendarData.minDateUnix) /
        MILLISECONDS_IN_DAY
    );
    if (isSingleDay || scrollByDay) {
      let diffDays = Math.floor(diffInMs / MILLISECONDS_IN_DAY);
      if (diffDays > maxDays + numberOfDays) {
        diffDays = maxDays + numberOfDays;
      } else if (diffDays < 0) {
        diffDays = 0;
      }
      const colWidth = isSingleDay ? calendarGridWidth : columnWidth;
      triggerDateChanged.current =
        calendarData.minDateUnix + diffDays * MILLISECONDS_IN_DAY;
      offset = diffDays * colWidth;
    } else {
      const pageIndex = Math.floor(diffInMs / (7 * MILLISECONDS_IN_DAY));
      let diffDays = pageIndex * 7;
      if (diffDays > maxDays) {
        diffDays = maxDays;
      } else if (diffDays < 0) {
        diffDays = 0;
      }
      triggerDateChanged.current =
        calendarData.minDateUnix + diffDays * MILLISECONDS_IN_DAY;
      offset = Math.floor(diffDays / 7) * (columnWidth * columns);
    }

    if (props?.hourScroll) {
      const minutes = date.hour * 60 + date.minute;
      const position = minutes * minuteHeight.value - startOffset.value;
      const scrollOffset = scrollVisibleHeight.current / 2;
      verticalListRef.current?.scrollTo({
        x: 0,
        y: position - scrollOffset,
        animated: props.animatedHour,
      });
    }

    const isScrollable = calendarListRef.current?.isScrollable(
      offset,
      numberOfDays
    );
    if (!isScrollable) {
      triggerDateChanged.current = undefined;
      return;
    }

    scrollType.current = ScrollType.calendarGrid;
    gridListRef.current?.scrollTo({
      x: offset,
      y: 0,
      animated: props?.animatedDate ?? false,
    });
  });

  const goToHour = useLatestCallback((hour: number, animated?: boolean) => {
    const minutes = (hour - start) * 60;
    const position = minutes * minuteHeight.value;
    verticalListRef.current?.scrollTo({
      x: 0,
      y: position,
      animated: animated,
    });
  });

  const goToNextPage = useLatestCallback(
    (animated: boolean = true, forceScrollByDay: boolean = false) => {
      const maxOffset = calendarListRef.current?.getMaxOffset(numberOfDays);
      const currentOffset = calendarListRef.current?.getCurrentScrollOffset();
      if (currentOffset === maxOffset) {
        triggerDateChanged.current = undefined;
        return;
      }

      if (triggerDateChanged.current) {
        return;
      }

      const diffInMs = visibleDateUnix.current - calendarData.minDateUnix;
      let nextOffset = 0;
      const maxDays = Math.floor(
        (calendarData.maxDateUnix - calendarData.minDateUnix) /
          MILLISECONDS_IN_DAY
      );
      if (isSingleDay || forceScrollByDay) {
        let diffDays = Math.floor(diffInMs / MILLISECONDS_IN_DAY) + 1;
        if (diffDays > maxDays + numberOfDays) {
          diffDays = maxDays + numberOfDays;
        }
        const colWidth = isSingleDay ? calendarGridWidth : columnWidth;
        triggerDateChanged.current =
          calendarData.minDateUnix + diffDays * MILLISECONDS_IN_DAY;
        nextOffset = diffDays * colWidth;
      } else {
        const pageIndex = Math.floor(diffInMs / (7 * MILLISECONDS_IN_DAY)) + 1;
        let diffDays = pageIndex * 7;
        if (diffDays > maxDays) {
          diffDays = maxDays;
        }
        triggerDateChanged.current =
          calendarData.minDateUnix + diffDays * MILLISECONDS_IN_DAY;
        nextOffset = Math.floor(diffDays / 7) * (columnWidth * columns);
      }

      scrollType.current = ScrollType.calendarGrid;
      gridListRef.current?.scrollTo({
        x: nextOffset,
        y: 0,
        animated: animated,
      });
    }
  );

  const goToPrevPage = useLatestCallback(
    (animated: boolean = true, forceScrollByDay: boolean = false) => {
      const currentOffset = calendarListRef.current?.getCurrentScrollOffset();
      if (!currentOffset || currentOffset === 0) {
        triggerDateChanged.current = undefined;
        return;
      }

      if (triggerDateChanged.current) {
        return;
      }

      const diffInMs = visibleDateUnix.current - calendarData.minDateUnix;
      let offset = 0;
      if (isSingleDay || forceScrollByDay) {
        const diffDays = Math.floor(diffInMs / MILLISECONDS_IN_DAY) - 1;
        const colWidth = isSingleDay ? calendarGridWidth : columnWidth;
        triggerDateChanged.current =
          calendarData.minDateUnix + diffDays * MILLISECONDS_IN_DAY;
        offset = diffDays * colWidth;
      } else {
        const pageIndex = Math.floor(diffInMs / (7 * MILLISECONDS_IN_DAY)) - 1;
        offset = pageIndex * (columnWidth * columns);
        const diffDays = pageIndex * 7;
        triggerDateChanged.current =
          calendarData.minDateUnix + diffDays * MILLISECONDS_IN_DAY;
      }

      if (offset < 0) {
        offset = 0;
        triggerDateChanged.current = calendarData.minDateUnix;
      }

      scrollType.current = ScrollType.calendarGrid;
      gridListRef.current?.scrollTo({
        x: offset,
        y: 0,
        animated: animated,
      });
    }
  );

  const zoom = useLatestCallback(
    (props?: { scale?: number; height?: number }) => {
      let newHeight = props?.height ?? initialTimeIntervalHeight;
      if (props?.scale) {
        newHeight = timeIntervalHeight.value * props.scale;
      }
      const clampedHeight = clampValues(
        newHeight,
        minTimeIntervalHeight,
        maxTimeIntervalHeight
      );
      const pinchYNormalized = offsetY.value / timeIntervalHeight.value;
      const pinchYScale = clampedHeight * pinchYNormalized;
      const y = pinchYScale;
      verticalListRef.current?.scrollTo({ x: 0, y, animated: true });
      timeIntervalHeight.value = withTiming(clampedHeight);
    }
  );

  const setVisibleDate = useLatestCallback((date: DateType) => {
    visibleDateUnix.current = parseDateTime(date).toMillis();
    visibleDateUnixAnim.value = visibleDateUnix.current;
  });

  useImperativeHandle(
    ref,
    () => ({
      goToDate,
      goToHour,
      goToNextPage,
      goToPrevPage,
      zoom,
      setVisibleDate,
    }),
    [goToDate, goToHour, goToNextPage, goToPrevPage, setVisibleDate, zoom]
  );

  useEffect(() => {
    if (scrollToNow) {
      // Delay to ensure that the layout is ready
      setTimeout(() => {
        goToDate({ hourScroll: true, animatedHour: true });
      }, 100);
    }
  }, [goToDate, scrollToNow]);

  useEffect(() => {
    runOnUI(() => {
      columnWidthAnim.value = withTiming(columnWidth);
    })();
  }, [columnWidthAnim, columnWidth]);

  const snapToInterval =
    numberOfDays > 1 && scrollByDay ? columnWidth : undefined;

  useEffect(() => {
    Haptic.setEnabled(useHaptic);
  }, [useHaptic]);

  const context = useMemo<CalendarContextProps>(
    () => ({
      calendarLayout,
      hourWidth,
      calendarData,
      numberOfDays,
      visibleDateUnix,
      verticalListRef,
      dayBarListRef,
      gridListRef,
      viewMode,
      columnWidthAnim,
      firstDay,
      scrollType,
      offsetY,
      minuteHeight,
      maxTimelineHeight,
      maxTimeIntervalHeight,
      minTimeIntervalHeight,
      timeIntervalHeight,
      allowPinchToZoom,
      spaceFromTop,
      spaceFromBottom,
      timelineHeight,
      hours,
      totalSlots,
      start,
      end,
      timeInterval,
      scrollVisibleHeight,
      offsetX,
      isTriggerMomentum,
      themeMode,
      showWeekNumber,
      calendarGridWidth,
      columnWidth,
      scrollByDay,
      initialOffset,
      isRTL,
      snapToInterval,
      columns,
      triggerDateChanged,
      visibleDateUnixAnim,
      calendarListRef,
      startOffset,
    }),
    [
      calendarLayout,
      hourWidth,
      calendarData,
      numberOfDays,
      visibleDateUnix,
      verticalListRef,
      dayBarListRef,
      gridListRef,
      viewMode,
      columnWidthAnim,
      firstDay,
      offsetY,
      minuteHeight,
      maxTimelineHeight,
      maxTimeIntervalHeight,
      minTimeIntervalHeight,
      timeIntervalHeight,
      allowPinchToZoom,
      spaceFromTop,
      spaceFromBottom,
      timelineHeight,
      hours,
      totalSlots,
      start,
      end,
      timeInterval,
      offsetX,
      themeMode,
      showWeekNumber,
      calendarGridWidth,
      columnWidth,
      scrollByDay,
      initialOffset,
      isRTL,
      snapToInterval,
      columns,
      triggerDateChanged,
      visibleDateUnixAnim,
      startOffset,
    ]
  );

  const actionsProps = {
    onPressBackground,
    onPressDayNumber,
    onRefresh,
    onChange,
    onDateChanged,
    onPressEvent,
  };

  const loadingValue = useMemo(() => ({ isLoading }), [isLoading]);

  return (
    <CalendarContext.Provider value={context}>
      <LocaleProvider initialLocales={initialLocales} locale={locale}>
        <TimeZoneProvider timeZone={timeZone}>
          <NowIndicatorProvider>
            <ThemeProvider
              theme={theme}
              darkTheme={darkTheme}
              themeMode={themeMode}
            >
              <ActionsProvider {...actionsProps}>
                <LoadingContext.Provider value={loadingValue}>
                  <HighlightDatesProvider highlightDates={highlightDates}>
                    <UnavailableHoursProvider
                      unavailableHours={unavailableHours}
                    >
                      <EventsProvider
                        events={events}
                        visibleStart={visibleDateUnix}
                        firstDay={firstDay}
                        timeZone={timeZone}
                        useAllDayEvent={useAllDayEvent}
                      >
                        {children}
                      </EventsProvider>
                    </UnavailableHoursProvider>
                  </HighlightDatesProvider>
                </LoadingContext.Provider>
              </ActionsProvider>
            </ThemeProvider>
          </NowIndicatorProvider>
        </TimeZoneProvider>
      </LocaleProvider>
    </CalendarContext.Provider>
  );
};

export default forwardRef(CalendarProvider);

export const useCalendar = () => {
  const context = React.useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
