import {
  BaseContainer,
  calculateSlots,
  CalendarList,
  clampValues,
  dateTimeToISOString,
  findNearestDate,
  forceUpdateZone,
  HapticService,
  parseDateTime,
  prepareCalendarRange,
  useLatestCallback,
  useLayout,
  useLazyRef,
} from '@calendar-kit/core';
import type { PropsWithChildren } from 'react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { PixelRatio, type View } from 'react-native';
import type Animated from 'react-native-reanimated';
import {
  runOnUI,
  scrollTo,
  useAnimatedRef,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { HOUR_WIDTH, INITIAL_DATE, MAX_DATE, MIN_DATE, ScrollType } from './constants';
import {
  CalendarActionsContext,
  CalendarContext,
  type CalendarContextProps,
} from './context/CalendarContext';
import DragProvider from './context/DragProvider';
import EventsProvider, { type EventsRef } from './context/EventsProvider';
import UnavailableHoursProvider from './context/UnavailableHoursProvider';
import type {
  CalendarKitHandle,
  CalendarProviderProps,
  DateType,
  EventItem,
  GoToDateOptions,
} from './types';

const CalendarContainer: React.ForwardRefRenderFunction<
  CalendarKitHandle,
  PropsWithChildren<CalendarProviderProps>
> = (
  {
    calendarWidth: initialCalendarWidth,
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
    hideWeekDays,
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
    animateColumnWidth = false,
    dragToCreateMode = 'duration',
    manualHorizontalScroll = false,
    reduceBrightnessOfPastEvents = false,
  },
  ref
) => {
  if (initialNumberOfDays > 7) {
    throw new Error('The maximum number of days is 7');
  }

  const scrollByDay = initialNumberOfDays === 1 || (initialScrollByDay ?? initialNumberOfDays < 7);

  const timeZone = useMemo(() => {
    const parsedTimeZone = parseDateTime(undefined, { zone: initialTimeZone });
    if (!parsedTimeZone.isValid) {
      console.warn('TimeZone is invalid, using local timeZone');
      return 'local';
    }
    return initialTimeZone || 'local';
  }, [initialTimeZone]);

  const hapticService = useRef(new HapticService()).current;

  const useAllDayEvent = initialUseAllDayEvent ?? true;
  const hideWeekDaysCount = hideWeekDays?.length ?? 0;
  const daysToShow = 7 - hideWeekDaysCount;
  const numberOfDays = initialNumberOfDays > daysToShow ? daysToShow : initialNumberOfDays;

  const isSingleDay = numberOfDays === 1;

  const calendarWidth = useLayout(useCallback((state) => state.width, []));

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
        hideWeekDays,
      }),
    [minDate, maxDate, firstDay, hideWeekDays]
  );

  const dateList = useMemo(() => {
    if (isSingleDay || scrollByDay) {
      return calendarData.availableDates;
    }

    return calendarData.bufferBefore
      .concat(calendarData.availableDates)
      .concat(calendarData.bufferAfter);
  }, [calendarData, isSingleDay, scrollByDay]);

  const slots = useMemo(() => calculateSlots(start, end, timeInterval), [start, end, timeInterval]);
  const totalSlots = slots.length;
  const columnWidth = (calendarWidth - hourWidth) / numberOfDays;
  const calendarGridWidth = isSingleDay ? calendarWidth : calendarWidth - hourWidth;

  const verticalListRef = useAnimatedRef<Animated.ScrollView>();
  const headerListRef = useAnimatedRef<CalendarList>();
  const gridListRef = useAnimatedRef<CalendarList>();

  const scrollType = useSharedValue<ScrollType>(ScrollType.calendarGrid);
  const isTriggerMomentum = useRef(false);
  const scrollVisibleHeight = useRef(0);
  const triggerDateChanged = useRef<number>();
  const bodyContainerRef = useRef<View>(null);
  const headerContainerRef = useRef<View>(null);
  // Current visible date
  const visibleDateUnix = useLazyRef(() => {
    const zonedInitialDate = parseDateTime(initialDate, {
      zone: timeZone,
    }).toISODate();
    const dateUnix = parseDateTime(zonedInitialDate).toMillis();
    let dateIndex = findNearestDate(dateList, dateUnix).index;
    if (!scrollByDay) {
      dateIndex = Math.floor(dateIndex / numberOfDays) * numberOfDays;
    }
    return dateList[dateIndex];
  });

  const visibleDateUnixAnim = useSharedValue(visibleDateUnix.current);
  const visibleWeeks = useSharedValue([visibleDateUnix.current]);

  const columnWidthAnim = useSharedValue(columnWidth);
  const offsetY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const scrollVisibleHeightAnim = useSharedValue(0);
  const timeIntervalHeight = useSharedValue(initialTimeIntervalHeight);
  const eventsRef = useRef<EventsRef>(null);

  const extraHeight = spaceFromTop + spaceFromBottom;
  const maxTimelineHeight = totalSlots * maxTimeIntervalHeight + extraHeight;

  const minuteHeight = useDerivedValue(() => timeIntervalHeight.value / timeInterval);
  const timelineHeight = useDerivedValue(
    () => totalSlots * timeIntervalHeight.value + 1 + extraHeight
  );

  const goToDate = useLatestCallback((props?: GoToDateOptions) => {
    const listRef = gridListRef.current;
    if (!listRef) {
      return;
    }

    const date = parseDateTime(props?.date, { zone: timeZone });
    const isoDate = date.toISODate();
    const targetDateUnix = parseDateTime(isoDate).toMillis();
    const nearestDate = listRef.findNearestItem(targetDateUnix);
    let targetIndex = nearestDate.index;
    const isScrollByDay = listRef.isScrollByDay;
    if (!isScrollByDay) {
      targetIndex = listRef.getPageIndex(targetIndex) * listRef.numColumns;
    }
    const isScrollable = listRef.isScrollableByIndex(targetIndex);
    if (!isScrollable) {
      triggerDateChanged.current = undefined;
      return;
    }
    const visibleDateIndex = listRef.findNearestItem(visibleDateUnix.current).index;
    if (visibleDateIndex !== targetIndex) {
      triggerDateChanged.current = listRef.getItemByIndex(targetIndex);
      scrollType.value = ScrollType.calendarGrid;
      const animatedDate = props?.animatedDate !== undefined ? props.animatedDate : true;
      headerListRef.current?.scrollToIndex({
        index: targetIndex,
        animated: animatedDate,
      });
      listRef?.scrollToIndex({ index: targetIndex, animated: animatedDate });
    }

    if (props?.hourScroll) {
      const minutes = date.hour * 60 + date.minute;
      const position = (minutes - start) * minuteHeight.value;
      const scrollOffset = scrollVisibleHeight.current / 2;
      const animatedHour = props?.animatedHour !== undefined ? props.animatedHour : true;
      verticalListRef.current?.scrollTo({
        y: position - scrollOffset,
        animated: animatedHour,
      });
    }
  });

  const goToHour = useLatestCallback((hour: number, animated: boolean = true) => {
    const timeInMinutes = hour * 60;
    if (timeInMinutes < start || timeInMinutes > end) {
      return;
    }
    const position = (timeInMinutes - start) * minuteHeight.value;
    verticalListRef.current?.scrollTo({
      y: position,
      animated,
    });
  });

  const goToNextPage = useLatestCallback(
    (animated: boolean = true, forceScrollByDay: boolean = true) => {
      const listRef = gridListRef.current;
      if (triggerDateChanged.current || !listRef) {
        return;
      }

      const currentIndex = listRef.getCurrentScrollIndex();
      const maxIndex = listRef.maxScrollIndex;
      if (currentIndex === maxIndex) {
        triggerDateChanged.current = undefined;
        return;
      }

      const nextIndex = listRef.getNextScrollIndex(forceScrollByDay);
      const targetDate = listRef.getItemByIndex(nextIndex);
      triggerDateChanged.current = targetDate;
      scrollType.value = ScrollType.calendarGrid;
      headerListRef.current?.scrollToItem({
        item: targetDate,
        animated,
      });
      listRef?.scrollToItem({ item: targetDate, animated });
    }
  );

  const goToPrevPage = useLatestCallback(
    (animated: boolean = true, forceScrollByDay: boolean = true) => {
      const listRef = gridListRef.current;
      if (triggerDateChanged.current || !listRef) {
        return;
      }

      const currentIndex = listRef.getCurrentScrollIndex();
      if (currentIndex === 0) {
        triggerDateChanged.current = undefined;
        return;
      }

      const nextIndex = listRef.getPrevScrollIndex(forceScrollByDay);
      const targetDate = listRef.getItemByIndex(nextIndex);
      triggerDateChanged.current = targetDate;
      scrollType.value = ScrollType.calendarGrid;
      headerListRef?.current?.scrollToItem({
        item: targetDate,
        animated,
      });
      listRef.scrollToItem({
        item: targetDate,
        animated,
      });
    }
  );

  const zoom = useLatestCallback((props?: { scale?: number; height?: number }) => {
    runOnUI(() => {
      let newHeight = props?.height ?? initialTimeIntervalHeight;
      if (props?.scale) {
        newHeight = timeIntervalHeight.value * props.scale;
      }
      const clampedHeight = clampValues(newHeight, minTimeIntervalHeight, maxTimeIntervalHeight);
      const pinchYNormalized = offsetY.value / timeIntervalHeight.value;
      const pinchYScale = clampedHeight * pinchYNormalized;
      const y = pinchYScale;
      timeIntervalHeight.value = withTiming(clampedHeight);
      scrollTo(verticalListRef, 0, y, true);
    })();
  });

  const setVisibleDate = useLatestCallback((initDate: DateType) => {
    const dateObj = parseDateTime(initDate, { zone: timeZone });
    const isoDate = dateObj.toISODate();
    const targetDateUnix = parseDateTime(isoDate).toMillis();
    const nearestDate = gridListRef.current?.findNearestItem(targetDateUnix)?.target;
    if (!nearestDate) {
      return;
    }
    visibleDateUnix.current = nearestDate;
    visibleDateUnixAnim.value = nearestDate;
  });

  const getLayout = useLatestCallback((layoutRef: React.RefObject<View>) => {
    return new Promise<{
      x: number;
      y: number;
      width: number;
      height: number;
      pageX: number;
      pageY: number;
    }>((resolve) => {
      layoutRef.current?.measure((x, y, width, height, pageX, pageY) => {
        resolve({ x, y, width, height, pageX, pageY });
      });
    });
  });

  const getDateByOffset = useLatestCallback((position: { x: number; y: number }) => {
    if (!gridListRef.current || !bodyContainerRef.current) {
      return undefined;
    }
    const currentIndex = gridListRef.current.getCurrentScrollIndex();
    const columnIndex = Math.floor(position.x / columnWidth);
    const dayUnix = gridListRef.current.getItemByIndex(currentIndex + columnIndex);
    if (!dayUnix) {
      return undefined;
    }

    const minutes = Math.floor(position.y / minuteHeight.value) + start;
    const dateTimeObj = forceUpdateZone(
      parseDateTime(dayUnix, { zone: 'utc' }).plus({ minutes }),
      timeZone
    );
    return dateTimeObj;
  });

  const getDateStringByOffset = useLatestCallback(
    async (position: { x: number; y: number }, excludeBodyOffset: boolean = false) => {
      let adjustedY = position.y + offsetY.value - spaceFromTop;
      let adjustedX = position.x;
      if (!excludeBodyOffset) {
        const layout = await getLayout(bodyContainerRef);
        adjustedY -= layout.y;
        adjustedX -= hourWidth;
      }
      const date = getDateByOffset({ x: adjustedX, y: adjustedY });
      if (!date) {
        return null;
      }
      const dateObj = forceUpdateZone(date, timeZone);
      return dateTimeToISOString(dateObj);
    }
  );

  const getEventByOffset = useLatestCallback(
    async (position: { x: number; y: number }, excludeBodyOffset: boolean = false) => {
      let adjustedY = position.y + offsetY.value - spaceFromTop;
      let adjustedX = position.x;
      if (!excludeBodyOffset) {
        const layout = await getLayout(bodyContainerRef);
        adjustedY -= layout.y;
        adjustedX -= hourWidth;
      }
      const date = getDateByOffset({ x: adjustedX, y: adjustedY });
      if (!date) {
        return null;
      }
      const columnIndex = Math.floor(adjustedX / columnWidth);
      const dateString = date.toISO();
      const eventsByDate = eventsRef.current?.getEventsByDate(dateString) ?? [];
      for (const event of eventsByDate) {
        let eventX = 0;
        let eventWidth = 0;

        const { total, index, xOffsetPercentage, widthPercentage } = event._internal;
        if (xOffsetPercentage && widthPercentage) {
          eventWidth = columnWidth * widthPercentage;
          eventX = columnWidth * xOffsetPercentage;
        } else if (total !== undefined && index !== undefined) {
          eventWidth = columnWidth / total;
          eventX = index * eventWidth;
        }

        const targetX = adjustedX - columnIndex * columnWidth;
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
    // Calculate minutes from top of calendar view, accounting for scroll position and initial offset
    const startMinutes = (offsetY.value - spaceFromTop) / minuteHeight.value - start;

    // Clamp minutes to valid 24-hour range (0-1440 minutes)
    const clampedStartMinutes = clampValues(startMinutes, 0, 1440);

    // Get current date in UTC, add clamped minutes, then convert to target timezone
    return parseDateTime(visibleDateUnix.current, { zone: 'utc', setZone: true })
      .plus({ minutes: clampedStartMinutes })
      .setZone(timeZone, { keepLocalTime: true })
      .toUTC()
      .toISO();
  });

  const getCurrentOffsetY = useLatestCallback(() => {
    return offsetY.value;
  });

  const clearCachedEvents = useLatestCallback(() => {
    eventsRef.current?.clearCachedEvents();
  });

  const calendarActions = useMemo(
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
      getCurrentOffsetY,
      clearCachedEvents,
    }),
    [
      goToDate,
      goToHour,
      goToNextPage,
      goToPrevPage,
      zoom,
      setVisibleDate,
      getDateStringByOffset,
      getEventByOffset,
      getSizeByDuration,
      getVisibleStart,
      getCurrentOffsetY,
      clearCachedEvents,
    ]
  );

  useImperativeHandle(ref, () => calendarActions, [calendarActions]);

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

  const snapToOffsets = useMemo(() => {
    if (numberOfDays > 1 && scrollByDay) {
      const offsets = [];
      for (let item = 0; item < dateList.length; item++) {
        offsets.push(item * columnWidth);
      }
      return offsets;
    }
    return undefined;
  }, [columnWidth, dateList.length, numberOfDays, scrollByDay]);

  const value = useMemo<CalendarContextProps>(
    () => ({
      hourWidth,
      calendarData,
      numberOfDays,
      visibleDateUnix,
      verticalListRef,
      headerListRef,
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
      snapToOffsets,
      triggerDateChanged,
      visibleDateUnixAnim,
      scrollVisibleHeightAnim,
      pagesPerSide,
      visibleWeeks,
      useAllDayEvent,
      hapticService,
      rightEdgeSpacing,
      overlapEventsSpacing,
      allowDragToCreate,
      allowDragToEdit,
      dateList,
      timeZone,
      manualHorizontalScroll,
      reduceBrightnessOfPastEvents,
      bodyContainerRef,
      headerContainerRef,
    }),
    [
      hourWidth,
      calendarData,
      numberOfDays,
      visibleDateUnix,
      verticalListRef,
      headerListRef,
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
      scrollType,
      start,
      end,
      timeInterval,
      offsetX,
      showWeekNumber,
      calendarGridWidth,
      columnWidth,
      scrollByDay,
      snapToOffsets,
      visibleDateUnixAnim,
      scrollVisibleHeightAnim,
      pagesPerSide,
      visibleWeeks,
      useAllDayEvent,
      hapticService,
      rightEdgeSpacing,
      overlapEventsSpacing,
      allowDragToCreate,
      allowDragToEdit,
      dateList,
      timeZone,
      manualHorizontalScroll,
      reduceBrightnessOfPastEvents,
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

  return (
    <BaseContainer
      calendarWidth={initialCalendarWidth}
      initialLocales={initialLocales}
      timeZone={timeZone}
      locale={locale}
      isLoading={isLoading}
      initialStart={visibleDateUnix}
      highlightDates={highlightDates}
      theme={theme}
      {...actionsProps}>
      <CalendarContext.Provider value={value}>
        <CalendarActionsContext.Provider value={calendarActions}>
          <UnavailableHoursProvider unavailableHours={unavailableHours}>
            <EventsProvider
              ref={eventsRef}
              events={events}
              minRegularEventMinutes={minRegularEventMinutes}
              overlapType={overlapType}
              minStartDifference={minStartDifference}>
              <DragProvider
                dragStep={dragStep}
                defaultDuration={defaultDuration}
                allowDragToCreate={allowDragToCreate}
                allowDragToEdit={allowDragToEdit}
                dragToCreateMode={dragToCreateMode}
                selectedEvent={selectedEvent}>
                {children}
              </DragProvider>
            </EventsProvider>
          </UnavailableHoursProvider>
        </CalendarActionsContext.Provider>
      </CalendarContext.Provider>
    </BaseContainer>
  );
};

export default forwardRef(CalendarContainer);
