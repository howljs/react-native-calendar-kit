import type { PropsWithChildren } from 'react';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PixelRatio, Platform } from 'react-native';
import type Animated from 'react-native-reanimated';
import {
  runOnUI,
  scrollTo,
  useAnimatedRef,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { CalendarListViewHandle } from './components/CalendarListView';
import {
  HOUR_WIDTH,
  INITIAL_DATE,
  MAX_DATE,
  MIN_DATE,
  ScrollType,
} from './constants';
import ActionsProvider from './context/ActionsProvider';
import type { CalendarContextProps } from './context/CalendarProvider';
import CalendarProvider from './context/CalendarProvider';
import DragEventProvider from './context/DragEventProvider';
import type { EventsRef } from './context/EventsProvider';
import EventsProvider from './context/EventsProvider';
import HighlightDatesProvider from './context/HighlightDatesProvider';
import LayoutProvider, { useLayout } from './context/LayoutProvider';
import { LoadingContext } from './context/LoadingContext';
import LocaleProvider from './context/LocaleProvider';
import NowIndicatorProvider from './context/NowIndicatorProvider';
import ThemeProvider from './context/ThemeProvider';
import TimezoneProvider from './context/TimeZoneProvider';
import UnavailableHoursProvider from './context/UnavailableHoursProvider';
import VisibleDateProvider from './context/VisibleDateProvider';
import useLatestCallback from './hooks/useLatestCallback';
import useLazyRef from './hooks/useLazyRef';
import HapticService from './service/HapticService';
import type {
  CalendarKitHandle,
  CalendarProviderProps,
  DateType,
  EventItem,
  GoToDateOptions,
} from './types';
import {
  dateTimeToISOString,
  forceUpdateZone,
  parseDateTime,
  startOfWeek,
} from './utils/dateUtils';
import {
  calculateSlots,
  clampValues,
  findNearestNumber,
  prepareCalendarRange,
} from './utils/utils';

const CalendarContainer: React.ForwardRefRenderFunction<
  CalendarKitHandle,
  PropsWithChildren<CalendarProviderProps>
> = (
  {
    calendarWidth,
    theme,
    children,
    hourWidth: initialHourWidth = HOUR_WIDTH,
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
    maxTimeIntervalHeight = 124,
    minTimeIntervalHeight = 60,
    allowPinchToZoom = false,
    initialTimeIntervalHeight = 60,
    timeZone: initialTimeZone,
    showWeekNumber = false,
    onChange,
    onDateChanged,
    onPressBackground,
    onPressDayNumber,
    onRefresh,
    unavailableHours,
    highlightDates,
    events,
    onPressEvent,
    numberOfDays: initialNumberOfDays = 7,
    scrollByDay: initialScrollByDay,
    scrollToNow = true,
    useHaptic = false,
    dragStep = 15,
    allowDragToEdit = false,
    onDragEventStart,
    onDragEventEnd,
    onLongPressEvent,
    selectedEvent,
    pagesPerSide = 2,
    hideWeekDays: initialHideWeekDays,
    onDragSelectedEventStart,
    onDragSelectedEventEnd,
    allowDragToCreate = false,
    defaultDuration = 30,
    onDragCreateEventStart,
    onDragCreateEventEnd,
    useAllDayEvent: initialUseAllDayEvent,
    rightEdgeSpacing = 1,
    overlapEventsSpacing = 1,
    minRegularEventMinutes = 1,
    onLoad,
    overlapType,
    minStartDifference,
    onLongPressBackground,
    resources,
    animateColumnWidth = false,
  },
  ref
) => {
  // TODO: Implement RTL
  const isRTL = false;

  if (initialNumberOfDays > 7) {
    throw new Error('The maximum number of days is 7');
  }

  const isResourceMode = !!resources;
  const scrollByDay =
    isResourceMode ||
    initialNumberOfDays === 1 ||
    (initialScrollByDay ?? initialNumberOfDays < 7);

  const timeZone = useMemo(() => {
    const parsedTimeZone = parseDateTime(undefined, { zone: initialTimeZone });
    if (!parsedTimeZone.isValid) {
      console.warn('TimeZone is invalid, using local timeZone');
      return 'local';
    }
    return initialTimeZone || 'local';
  }, [initialTimeZone]);

  const hapticService = useRef(new HapticService()).current;
  const [hideWeekDays, setHideWeekDays] = useState(initialHideWeekDays ?? []);
  const hideWeekDaysRef = useRef(initialHideWeekDays ?? []);
  useEffect(() => {
    const newHideWeekDays = initialHideWeekDays ?? [];
    if (newHideWeekDays.length === hideWeekDaysRef.current.length) {
      const isSame = newHideWeekDays.every(
        (value, index) => value === hideWeekDaysRef.current[index]
      );
      if (!isSame) {
        hideWeekDaysRef.current = newHideWeekDays;
        setHideWeekDays(newHideWeekDays);
      }
    } else {
      hideWeekDaysRef.current = newHideWeekDays;
      setHideWeekDays(newHideWeekDays);
    }
  }, [initialHideWeekDays]);

  const useAllDayEvent = isResourceMode
    ? false
    : (initialUseAllDayEvent ?? true);
  const hideWeekDaysCount = hideWeekDays.length;
  const daysToShow = 7 - hideWeekDaysCount;
  const numberOfDays = isResourceMode
    ? 1
    : initialNumberOfDays > daysToShow
      ? daysToShow
      : initialNumberOfDays;

  const isSingleDay = numberOfDays === 1;
  const columns = isSingleDay ? 1 : daysToShow;

  const defaultLayout = useLayout();
  const calendarLayout = useMemo(() => {
    return {
      width: calendarWidth ?? defaultLayout.width,
      height: defaultLayout.height,
    };
  }, [calendarWidth, defaultLayout.height, defaultLayout.width]);

  const hourWidth = useMemo(
    () => PixelRatio.roundToNearestPixel(initialHourWidth),
    [initialHourWidth]
  );

  useEffect(() => {
    hapticService.setEnabled(useHaptic);
  }, [hapticService, useHaptic]);

  const calendarData = useMemo(
    () =>
      prepareCalendarRange({
        minDate,
        maxDate,
        firstDay,
        isSingleDay,
        hideWeekDays,
        timeZone,
      }),
    [minDate, maxDate, firstDay, isSingleDay, hideWeekDays, timeZone]
  );

  const slots = useMemo(
    () => calculateSlots(start, end, timeInterval),
    [start, end, timeInterval]
  );
  const totalSlots = slots.length;

  const columnWidth = (calendarLayout.width - hourWidth) / numberOfDays;

  const calendarGridWidth = isSingleDay
    ? isResourceMode
      ? calendarLayout.width - hourWidth
      : calendarLayout.width
    : columnWidth * columns;

  const calendarListRef = useRef<CalendarListViewHandle>(null);
  const verticalListRef = useAnimatedRef<Animated.ScrollView>();
  const dayBarListRef = useAnimatedRef<Animated.ScrollView>();
  const gridListRef = useAnimatedRef<Animated.ScrollView>();
  const scrollType = useRef<ScrollType>(ScrollType.calendarGrid);
  const isTriggerMomentum = useRef(false);
  const scrollVisibleHeight = useRef(0);
  const triggerDateChanged = useRef<number>();

  // Current visible date
  const visibleDateUnix = useLazyRef(() => {
    const zonedInitialDate = parseDateTime(initialDate, {
      zone: timeZone,
    }).toISODate();
    let date;
    if (scrollByDay) {
      date = parseDateTime(zonedInitialDate);
    } else {
      date = startOfWeek(zonedInitialDate, firstDay);
    }
    const dateUnix = date.toMillis();
    return findNearestNumber(calendarData.visibleDatesArray, dateUnix);
  });

  const visibleDateUnixAnim = useSharedValue(visibleDateUnix.current);
  const visibleWeeks = useSharedValue([visibleDateUnix.current]);

  const initialOffset = useMemo(() => {
    const visibleDatesArray = calendarData.visibleDatesArray;
    const visibleDates = calendarData.visibleDates;
    const nearestNumber = findNearestNumber(
      visibleDatesArray,
      visibleDateUnix.current
    );
    const nearestDate = visibleDates[nearestNumber];
    if (!nearestDate) {
      return 0;
    }
    const nearestIndex = nearestDate.index;
    if (isSingleDay || scrollByDay) {
      const colWidth = isSingleDay ? calendarGridWidth : columnWidth;
      return nearestIndex * colWidth;
    }

    const pageIndex = Math.floor(nearestIndex / columns);
    return pageIndex * (columnWidth * columns);
  }, [
    calendarData,
    calendarGridWidth,
    columnWidth,
    columns,
    isSingleDay,
    scrollByDay,
    visibleDateUnix,
  ]);

  const columnWidthAnim = useSharedValue(columnWidth);
  const offsetY = useSharedValue(0);
  const offsetX = useSharedValue(initialOffset);
  const scrollVisibleHeightAnim = useSharedValue(0);
  const timeIntervalHeight = useSharedValue(initialTimeIntervalHeight);
  const eventsRef = useRef<EventsRef>(null);

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
    const isoDate = date.toISODate();
    let targetDateUnix = parseDateTime(isoDate).toMillis();
    if (!scrollByDay) {
      targetDateUnix = startOfWeek(isoDate, firstDay).toMillis();
    }
    const visibleDates = calendarData.visibleDatesArray;
    const nearestUnix = findNearestNumber(visibleDates, targetDateUnix);
    const visibleDayIndex = visibleDates.indexOf(nearestUnix);
    if (visibleDayIndex !== -1) {
      let offset = 0;
      if (isSingleDay || scrollByDay) {
        const colWidth = isSingleDay ? calendarGridWidth : columnWidth;
        offset = visibleDayIndex * colWidth;
      } else {
        const pageIndex = Math.floor(visibleDayIndex / columns);
        offset = pageIndex * (columnWidth * columns);
      }
      const isScrollable = calendarListRef.current?.isScrollable(
        offset,
        numberOfDays
      );
      if (isScrollable) {
        triggerDateChanged.current = nearestUnix;
        scrollType.current = ScrollType.calendarGrid;
        const animatedDate =
          props?.animatedDate !== undefined ? props.animatedDate : true;

        runOnUI(() => {
          if (Platform.OS === 'web') {
            scrollTo(dayBarListRef, offset, 0, true);
          }
          scrollTo(gridListRef, offset, 0, animatedDate);
        })();
      }
    }

    if (props?.hourScroll) {
      const minutes = date.hour * 60 + date.minute;
      const position = minutes * minuteHeight.value - startOffset.value;
      const scrollOffset = scrollVisibleHeight.current / 2;
      const animatedHour =
        props?.animatedHour !== undefined ? props.animatedHour : true;
      runOnUI(() => {
        scrollTo(verticalListRef, 0, position - scrollOffset, animatedHour);
      })();
    }
  });

  const goToHour = useLatestCallback(
    (hour: number, animated: boolean = true) => {
      const timeInMinutes = hour * 60;
      if (timeInMinutes < start || timeInMinutes > end) {
        return;
      }
      const position = (timeInMinutes - start) * minuteHeight.value;
      runOnUI(() => {
        scrollTo(verticalListRef, 0, position, animated);
      })();
    }
  );

  const goToNextPage = useLatestCallback(
    (animated: boolean = true, forceScrollByDay: boolean = false) => {
      if (triggerDateChanged.current) {
        return;
      }
      const visibleDatesArray = calendarData.visibleDatesArray;
      const currentIndex = visibleDatesArray.indexOf(visibleDateUnix.current);
      if (currentIndex === -1) {
        return;
      }

      let nextOffset = 0;
      let nextVisibleDayIndex = 0;
      if (isSingleDay || forceScrollByDay || scrollByDay) {
        nextVisibleDayIndex = currentIndex + 1;
        const colWidth = isSingleDay ? calendarGridWidth : columnWidth;
        nextOffset = nextVisibleDayIndex * colWidth;
      } else {
        nextVisibleDayIndex = currentIndex + columns;
        const pageIndex = Math.floor(nextVisibleDayIndex / columns);
        nextOffset = pageIndex * (columnWidth * columns);
      }

      const isScrollable = calendarListRef.current?.isScrollable(
        nextOffset,
        numberOfDays
      );
      const nextDateUnix = visibleDatesArray[nextVisibleDayIndex];
      if (!nextDateUnix || !isScrollable) {
        triggerDateChanged.current = undefined;
        return;
      }

      triggerDateChanged.current = nextDateUnix;
      scrollType.current = ScrollType.calendarGrid;
      runOnUI(() => {
        if (Platform.OS === 'web') {
          scrollTo(dayBarListRef, nextOffset, 0, animated);
        }
        scrollTo(gridListRef, nextOffset, 0, animated);
      })();
    }
  );

  const goToPrevPage = useLatestCallback(
    (animated: boolean = true, forceScrollByDay: boolean = false) => {
      if (triggerDateChanged.current) {
        return;
      }
      const visibleDatesArray = calendarData.visibleDatesArray;
      const currentIndex = visibleDatesArray.indexOf(visibleDateUnix.current);
      if (currentIndex === -1) {
        return;
      }

      let nextOffset = 0;
      let nextVisibleDayIndex = 0;
      if (isSingleDay || forceScrollByDay || scrollByDay) {
        nextVisibleDayIndex = Math.max(currentIndex - 1, 0);
        const colWidth = isSingleDay ? calendarGridWidth : columnWidth;
        nextOffset = nextVisibleDayIndex * colWidth;
      } else {
        nextVisibleDayIndex = Math.max(currentIndex - columns, 0);
        const pageIndex = Math.floor(nextVisibleDayIndex / columns);
        nextOffset = pageIndex * (columnWidth * columns);
      }
      const isScrollable = calendarListRef.current?.isScrollable(
        nextOffset,
        numberOfDays
      );
      const nextDateUnix = visibleDatesArray[nextVisibleDayIndex];
      if (!nextDateUnix || !isScrollable) {
        triggerDateChanged.current = undefined;
        return;
      }

      triggerDateChanged.current = nextDateUnix;
      scrollType.current = ScrollType.calendarGrid;
      runOnUI(() => {
        if (Platform.OS === 'web') {
          scrollTo(dayBarListRef, nextOffset, 0, animated);
        }
        scrollTo(gridListRef, nextOffset, 0, animated);
      })();
    }
  );

  const zoom = useLatestCallback(
    (props?: { scale?: number; height?: number }) => {
      runOnUI(() => {
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
        timeIntervalHeight.value = withTiming(clampedHeight);
        scrollTo(verticalListRef, 0, y, true);
      })();
    }
  );

  const setVisibleDate = useLatestCallback((initDate: DateType) => {
    const dateObj = parseDateTime(initDate, { zone: timeZone });
    const isoDate = dateObj.toISODate();
    const targetDateUnix = parseDateTime(isoDate).toMillis();
    const visibleDates = calendarData.visibleDatesArray;
    const nearestUnix = findNearestNumber(visibleDates, targetDateUnix);
    visibleDateUnix.current = nearestUnix;
    visibleDateUnixAnim.value = nearestUnix;
  });

  const getDateByOffset = useLatestCallback(
    (position: { x: number; y: number }) => {
      const visibleDatesArray = calendarData.visibleDatesArray;
      const dayIndex = visibleDatesArray.indexOf(visibleDateUnix.current);
      if (dayIndex === -1) {
        return;
      }
      const columnIndex = Math.floor(position.x / columnWidth);
      const dateUnixByIndex =
        calendarData.visibleDatesArray[dayIndex + columnIndex];
      if (!dateUnixByIndex) {
        return;
      }
      const minutes = Math.floor(position.y / minuteHeight.value) + start;
      return parseDateTime(dateUnixByIndex).plus({ minutes });
    }
  );

  const getDateStringByOffset = useLatestCallback(
    (position: { x: number; y: number }) => {
      const date = getDateByOffset(position);
      if (!date) {
        return null;
      }
      const dateObj = forceUpdateZone(date, timeZone);
      return dateTimeToISOString(dateObj);
    }
  );

  const getEventByOffset = useLatestCallback(
    (position: { x: number; y: number }) => {
      const date = getDateByOffset(position);
      if (!date) {
        return null;
      }
      const columnIndex = Math.floor(position.x / columnWidth);
      const dateString = dateTimeToISOString(date);
      const eventsByDate = eventsRef.current?.getEventsByDate(dateString) ?? [];
      for (let i = 0; i < eventsByDate.length; i++) {
        const event = eventsByDate[i];
        let eventX = 0;
        let eventWidth = 0;
        const { total, index, xOffsetPercentage, widthPercentage } =
          event._internal;
        if (xOffsetPercentage && widthPercentage) {
          eventWidth = columnWidth * widthPercentage;
          eventX = columnWidth * xOffsetPercentage;
        } else if (total && index) {
          eventWidth = columnWidth / total;
          eventX = index * eventWidth;
        }

        const targetX = position.x - columnIndex * columnWidth;
        if (targetX >= eventX && targetX <= eventX + eventWidth) {
          const clonedEvent = { ...event } as EventItem;
          delete clonedEvent._internal;
          return clonedEvent;
        }
      }
      return null;
    }
  );

  const getSizeByDuration = useLatestCallback((duration: number) => {
    const height = duration * minuteHeight.value;
    return { width: columnWidth, height };
  });

  const getVisibleStart = useLatestCallback(() => {
    const currentDate = forceUpdateZone(visibleDateUnix.current, timeZone);
    const startMinutes = offsetY.value / minuteHeight.value - start;
    currentDate.plus({ minutes: startMinutes });
    return dateTimeToISOString(currentDate);
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
      getDateByOffset: getDateStringByOffset,
      getEventByOffset,
      getSizeByDuration,
      getVisibleStart,
    }),
    [
      getDateStringByOffset,
      getEventByOffset,
      getSizeByDuration,
      goToDate,
      goToHour,
      goToNextPage,
      goToPrevPage,
      setVisibleDate,
      zoom,
      getVisibleStart,
    ]
  );

  const prevMode = useRef(isSingleDay);
  useEffect(() => {
    if (!animateColumnWidth) {
      columnWidthAnim.value = columnWidth;
      return;
    }

    if (prevMode.current !== isSingleDay) {
      prevMode.current = isSingleDay;
      columnWidthAnim.value = columnWidth;
    } else {
      columnWidthAnim.value = withTiming(columnWidth);
    }
  }, [columnWidthAnim, columnWidth, isSingleDay, animateColumnWidth]);

  const snapToInterval =
    numberOfDays > 1 && scrollByDay && !isResourceMode
      ? columnWidth
      : undefined;

  const value = useMemo<CalendarContextProps>(
    () => ({
      calendarLayout,
      hourWidth,
      calendarData,
      numberOfDays,
      visibleDateUnix,
      verticalListRef,
      dayBarListRef,
      gridListRef,
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
      slots,
      totalSlots,
      start,
      end,
      timeInterval,
      scrollVisibleHeight,
      offsetX,
      isTriggerMomentum,
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
      scrollVisibleHeightAnim,
      pagesPerSide,
      hideWeekDays,
      visibleWeeks,
      useAllDayEvent,
      hapticService,
      rightEdgeSpacing,
      overlapEventsSpacing,
      allowDragToCreate,
      allowDragToEdit,
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
      slots,
      totalSlots,
      start,
      end,
      timeInterval,
      offsetX,
      showWeekNumber,
      calendarGridWidth,
      columnWidth,
      scrollByDay,
      initialOffset,
      isRTL,
      snapToInterval,
      columns,
      visibleDateUnixAnim,
      startOffset,
      scrollVisibleHeightAnim,
      pagesPerSide,
      hideWeekDays,
      visibleWeeks,
      useAllDayEvent,
      hapticService,
      rightEdgeSpacing,
      overlapEventsSpacing,
      allowDragToCreate,
      allowDragToEdit,
    ]
  );

  const _onLoad = useLatestCallback(() => {
    if (scrollToNow) {
      goToDate({ hourScroll: true, animatedHour: true });
    }
    onLoad?.();
  });

  const actionsProps = {
    onPressBackground,
    onPressDayNumber,
    onRefresh,
    onChange,
    onDateChanged,
    onPressEvent,
    onDragEventStart,
    onDragEventEnd,
    onLongPressEvent,
    onDragSelectedEventStart,
    onDragSelectedEventEnd,
    onDragCreateEventStart,
    onDragCreateEventEnd,
    onLoad: _onLoad,
    onLongPressBackground,
  };

  const loadingValue = useMemo(() => ({ isLoading }), [isLoading]);

  return (
    <CalendarProvider value={value}>
      <LocaleProvider initialLocales={initialLocales} locale={locale}>
        <TimezoneProvider timeZone={timeZone}>
          <NowIndicatorProvider>
            <ThemeProvider theme={theme}>
              <ActionsProvider {...actionsProps}>
                <LoadingContext.Provider value={loadingValue}>
                  <VisibleDateProvider initialStart={visibleDateUnix}>
                    <HighlightDatesProvider highlightDates={highlightDates}>
                      <UnavailableHoursProvider
                        unavailableHours={unavailableHours}
                        timeZone={timeZone}
                        pagesPerSide={pagesPerSide}>
                        <EventsProvider
                          ref={eventsRef}
                          events={events}
                          firstDay={firstDay}
                          timeZone={timeZone}
                          useAllDayEvent={useAllDayEvent}
                          pagesPerSide={pagesPerSide}
                          minRegularEventMinutes={minRegularEventMinutes}
                          hideWeekDays={hideWeekDays}
                          overlapType={overlapType}
                          resources={resources}
                          minStartDifference={minStartDifference}>
                          <DragEventProvider
                            dragStep={dragStep}
                            allowDragToEdit={allowDragToEdit}
                            selectedEvent={selectedEvent}
                            allowDragToCreate={allowDragToCreate}
                            defaultDuration={defaultDuration}
                            resources={resources}
                            hapticService={hapticService}>
                            {children}
                          </DragEventProvider>
                        </EventsProvider>
                      </UnavailableHoursProvider>
                    </HighlightDatesProvider>
                  </VisibleDateProvider>
                </LoadingContext.Provider>
              </ActionsProvider>
            </ThemeProvider>
          </NowIndicatorProvider>
        </TimezoneProvider>
      </LocaleProvider>
    </CalendarProvider>
  );
};

const CalendarContainerInner = forwardRef(CalendarContainer);

const CalendarContainerWithLayout: React.ForwardRefRenderFunction<
  CalendarKitHandle,
  PropsWithChildren<CalendarProviderProps>
> = (props, ref) => {
  return (
    <LayoutProvider>
      <CalendarContainerInner {...props} ref={ref} />
    </LayoutProvider>
  );
};

export default forwardRef(CalendarContainerWithLayout);
