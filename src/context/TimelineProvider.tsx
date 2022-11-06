import type { FlashList } from '@shopify/flash-list';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { PixelRatio, ScrollView, useWindowDimensions } from 'react-native';
import type { GestureType } from 'react-native-gesture-handler';
import { SharedValue, useSharedValue } from 'react-native-reanimated';
import { COLUMNS, DEFAULT_PROPS } from '../constants';
import type {
  CalendarViewMode,
  TimelineProviderProps,
  UnavailableHour,
} from '../types';
import { calculateDates, calculateHours } from '../utils';

type CustomTimelineProviderProps = Required<
  Omit<
    TimelineProviderProps,
    | 'initialDate'
    | 'minTimeIntervalHeight'
    | 'maxTimeIntervalHeight'
    | 'initialTimeIntervalHeight'
    | 'unavailableHours'
  >
>;

interface TimelineCalendarContextValue extends CustomTimelineProviderProps {
  pages: { [key in CalendarViewMode]: { data: string[]; index: number } };
  hours: { text: string; hourNumber: number }[];
  initialDate: React.MutableRefObject<string>;
  dayBarListRef: React.RefObject<FlashList<string>>;
  timelineHorizontalListRef: React.RefObject<FlashList<string>>;
  timelineVerticalListRef: React.RefObject<ScrollView>;
  timelineLayoutRef: React.MutableRefObject<{
    width: number;
    height: number;
  }>;

  timeIntervalHeight: SharedValue<number>;
  minTimeIntervalHeight: SharedValue<number>;
  maxTimeIntervalHeight: number;
  timelineWidth: number;
  rightSideWidth: number;
  currentIndex: SharedValue<number>;
  columnWidth: number;
  totalHours: number;
  totalPages: { [key in CalendarViewMode]: number };
  isScrolling: React.MutableRefObject<boolean>;
  offsetY: SharedValue<number>;
  unavailableHours?:
    | UnavailableHour[]
    | { [weekDay: string]: UnavailableHour[] };
  firstDate: { [key in CalendarViewMode]?: string };
  isDragCreateActive: SharedValue<boolean>;
  pinchRef: React.MutableRefObject<GestureType | undefined>;
}

const TimelineCalendarContext = React.createContext<
  TimelineCalendarContextValue | undefined
>(undefined);

const TimelineProvider: React.FC<TimelineProviderProps> = (props) => {
  const {
    children,
    minDate = DEFAULT_PROPS.MIN_DATE,
    maxDate = DEFAULT_PROPS.MAX_DATE,
    viewMode = DEFAULT_PROPS.VIEW_MODE,
    firstDay = DEFAULT_PROPS.FIRST_DAY,
    initialDate: initDate = DEFAULT_PROPS.INITIAL_DATE,
    start = DEFAULT_PROPS.START,
    end = DEFAULT_PROPS.END,
    hourWidth = DEFAULT_PROPS.HOUR_WIDTH,
    timeInterval = DEFAULT_PROPS.TIME_INTERVAL,
    initialTimeIntervalHeight = DEFAULT_PROPS.INIT_TIME_INTERVAL_HEIGHT,
    minTimeIntervalHeight: initialMinTimeIntervalHeight,
    maxTimeIntervalHeight = DEFAULT_PROPS.MAX_TIME_INTERVAL_HEIGHT,
    syncedLists = true,
    theme: initTheme,
    spaceFromTop = DEFAULT_PROPS.SPACE_CONTENT,
    spaceFromBottom = DEFAULT_PROPS.SPACE_CONTENT,
    isShowHalfLine = true,
    allowPinchToZoom = false,
    allowDragToCreate = false,
    dragCreateInterval = DEFAULT_PROPS.DRAG_CREATE_INTERVAL,
    dragStep = DEFAULT_PROPS.DRAG_STEP,
    showNowIndicator = true,
    unavailableHours,
    overlapEventsSpacing = DEFAULT_PROPS.OVERLAP_EVENTS_SPACING,
    rightEdgeSpacing = DEFAULT_PROPS.RIGHT_EDGE_SPACING,
    scrollToNow = true,
  } = props;

  const { width: timelineWidth } = useWindowDimensions();

  /** Refs */
  const dayBarListRef = useRef<FlashList<string>>(null);
  const timelineHorizontalListRef = useRef<FlashList<string>>(null);
  const timelineVerticalListRef = useRef<ScrollView>(null);
  const initialDate = useRef(initDate);
  const timelineLayoutRef = useRef({ width: 0, height: 0 });
  const isScrolling = useRef(false);
  const pinchRef = useRef();

  /** Prepare data*/
  const pages = useMemo(
    () => calculateDates(firstDay, minDate, maxDate, initialDate.current),
    [firstDay, minDate, maxDate]
  );

  const hours = useMemo(
    () => calculateHours(start, end, timeInterval),
    [end, start, timeInterval]
  );

  /** Animated value */
  const currentIndex = useSharedValue(pages[viewMode].index);
  const timeIntervalHeight = useSharedValue(initialTimeIntervalHeight);
  const minTimeIntervalHeight = useSharedValue(
    initialMinTimeIntervalHeight || 0
  );
  const isDragCreateActive = useSharedValue(false);

  const offsetY = useSharedValue(0);

  const rHourWidth = useMemo(
    () => PixelRatio.roundToNearestPixel(hourWidth),
    [hourWidth]
  );

  const theme = useMemo(() => {
    return {
      cellBorderColor:
        initTheme?.cellBorderColor ?? DEFAULT_PROPS.CELL_BORDER_COLOR,
      dayTextColor: initTheme?.dayTextColor ?? DEFAULT_PROPS.SECONDARY_COLOR,
      todayTextColor: initTheme?.todayTextColor ?? DEFAULT_PROPS.WHITE_COLOR,
      todayBackgroundColor:
        initTheme?.todayBackgroundColor ?? DEFAULT_PROPS.PRIMARY_COLOR,
      backgroundColor: initTheme?.backgroundColor ?? DEFAULT_PROPS.WHITE_COLOR,
      dragCreateItemBackgroundColor:
        initTheme?.dragCreateItemBackgroundColor ??
        DEFAULT_PROPS.CREATE_ITEM_BACKGROUND_COLOR,
      dragHourBackgroundColor:
        initTheme?.dragHourBackgroundColor ?? DEFAULT_PROPS.WHITE_COLOR,
      dragHourBorderColor:
        initTheme?.dragHourBorderColor ?? DEFAULT_PROPS.PRIMARY_COLOR,
      dragHourColor: initTheme?.dragHourColor ?? DEFAULT_PROPS.PRIMARY_COLOR,
      loadingBarColor:
        initTheme?.loadingBarColor ?? DEFAULT_PROPS.PRIMARY_COLOR,
      unavailableBackgroundColor:
        initTheme?.unavailableBackgroundColor ??
        DEFAULT_PROPS.UNAVAILABLE_BACKGROUND_COLOR,
      editIndicatorColor:
        initTheme?.editIndicatorColor ?? DEFAULT_PROPS.BLACK_COLOR,
      nowIndicatorColor:
        initTheme?.nowIndicatorColor ?? DEFAULT_PROPS.PRIMARY_COLOR,
    };
  }, [
    initTheme?.backgroundColor,
    initTheme?.cellBorderColor,
    initTheme?.dayTextColor,
    initTheme?.dragCreateItemBackgroundColor,
    initTheme?.dragHourBackgroundColor,
    initTheme?.dragHourBorderColor,
    initTheme?.dragHourColor,
    initTheme?.editIndicatorColor,
    initTheme?.loadingBarColor,
    initTheme?.nowIndicatorColor,
    initTheme?.todayBackgroundColor,
    initTheme?.todayTextColor,
    initTheme?.unavailableBackgroundColor,
  ]);

  useEffect(() => {
    currentIndex.value = pages[viewMode].index;
    setTimeout(() => {
      timelineHorizontalListRef.current?.scrollToIndex({
        index: pages[viewMode].index,
        animated: false,
      });
    }, 300);
  }, [currentIndex, pages, viewMode]);

  useEffect(() => {
    if (initialMinTimeIntervalHeight) {
      minTimeIntervalHeight.value = initialMinTimeIntervalHeight;
    }
  }, [initialMinTimeIntervalHeight, minTimeIntervalHeight]);

  const value = useMemo(() => {
    const totalPages = {
      week: pages.week.data.length,
      workWeek: pages.workWeek.data.length,
      day: pages.day.data.length,
      threeDays: pages.threeDays.data.length,
    };
    const totalHours = hours.length;
    const firstDate = {
      week: pages.week.data[0],
      workWeek: pages.workWeek.data[0],
      day: pages.day.data[0],
      threeDays: pages.threeDays.data[0],
    };
    const rightSideWidth = timelineWidth - rHourWidth;
    const columnWidth = rightSideWidth / COLUMNS[viewMode];

    return {
      pages,
      hours,
      minDate,
      maxDate,
      initialDate,
      start,
      end,
      firstDay,
      viewMode,
      dayBarListRef,
      timelineHorizontalListRef,
      timelineVerticalListRef,
      timelineLayoutRef,
      timeIntervalHeight,
      minTimeIntervalHeight,
      maxTimeIntervalHeight,
      timeInterval,
      syncedLists,
      hourWidth: rHourWidth,
      rightSideWidth,
      timelineWidth,
      currentIndex,
      columnWidth,
      theme,
      spaceFromTop,
      spaceFromBottom,
      isShowHalfLine,
      totalPages,
      totalHours,
      isScrolling,
      offsetY,
      allowPinchToZoom,
      allowDragToCreate,
      dragCreateInterval,
      dragStep,
      unavailableHours,
      showNowIndicator,
      firstDate,
      overlapEventsSpacing,
      rightEdgeSpacing,
      isDragCreateActive,
      pinchRef,
      scrollToNow,
    };
  }, [
    pages,
    hours,
    timelineWidth,
    rHourWidth,
    viewMode,
    minDate,
    maxDate,
    start,
    end,
    firstDay,
    timeIntervalHeight,
    minTimeIntervalHeight,
    maxTimeIntervalHeight,
    timeInterval,
    syncedLists,
    currentIndex,
    theme,
    spaceFromTop,
    spaceFromBottom,
    isShowHalfLine,
    offsetY,
    allowPinchToZoom,
    allowDragToCreate,
    dragCreateInterval,
    dragStep,
    unavailableHours,
    showNowIndicator,
    overlapEventsSpacing,
    rightEdgeSpacing,
    isDragCreateActive,
    scrollToNow,
  ]);

  return (
    <TimelineCalendarContext.Provider value={value}>
      {children}
    </TimelineCalendarContext.Provider>
  );
};

export default TimelineProvider;

export const useTimelineCalendarContext = () => {
  const value = useContext(TimelineCalendarContext);
  if (!value) {
    throw new Error(
      'useTimelineCalendarContext must be called from within TimelineCalendarProvider!'
    );
  }
  return value;
};
