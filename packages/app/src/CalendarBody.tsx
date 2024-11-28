import {
  AnimatedCalendarList,
  dateTimeToISOString,
  forceUpdateZone,
  type ListRenderItemContainerInfo,
  type ListRenderItemInfo,
  LoadingOverlay,
  parseDateTime,
  toHourStr,
  useActions,
  useLayout,
  useLocale,
  useTimezone,
} from '@calendar-kit/core';
import { type FC, memo, type PropsWithChildren, useCallback, useMemo, useRef } from 'react';
import type {
  GestureResponderEvent,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import * as BodyItem from './components/BodyItem';
import * as ItemContainer from './components/BodyItemContainer';
import BodyContent from './components/BodyItemContainer/BodyContent';
import TimeColumn from './components/BodyItemContainer/TimeColumn';
import DraggingEvent from './components/DraggingEvent';
import DraggingHour from './components/DraggingHour';
import { EXTRA_HEIGHT, ScrollType } from './constants';
import type { BodyContextProps } from './context/BodyContext';
import { BodyContext } from './context/BodyContext';
import { useCalendar } from './context/CalendarContext';
import { type DraggingMode, useDragContext } from './context/DragProvider';
import useDragEvent from './hooks/useDragEvent';
import useDragToCreate from './hooks/useDragToCreate';
import usePinchToZoom from './hooks/usePinchToZoom';
import useSyncedList from './hooks/useSyncedList';
import type { CalendarBodyProps, PackedEvent } from './types';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const CalendarBody: FC<PropsWithChildren<CalendarBodyProps>> = ({
  hourFormat = 'HH:mm',
  draggingHourFormat = hourFormat,
  showNowIndicator = true,
  renderEvent,
  renderDraggingEvent,
  NowIndicatorComponent,
  renderHour,
  renderCustomHorizontalLine,
  renderCustomVerticalLine,
  renderDraggingHour,
  isShowHalfHourLine = true,
  renderCustomOutOfRange,
  renderCustomUnavailableHour,
  renderDraggableEvent,
}) => {
  const {
    hourWidth,
    columnWidthAnim,
    numberOfDays,
    offsetY,
    minuteHeight,
    maxTimelineHeight,
    timeIntervalHeight,
    spaceFromTop,
    spaceFromBottom,
    timelineHeight,
    slots,
    totalSlots,
    start,
    end,
    timeInterval,
    columnWidth,
    scrollVisibleHeight,
    verticalListRef,
    visibleDateUnix,
    gridListRef,
    calendarGridWidth,
    snapToOffsets,
    scrollVisibleHeightAnim,
    visibleDateUnixAnim,
    pagesPerSide,
    rightEdgeSpacing,
    overlapEventsSpacing,
    allowDragToCreate,
    dateList,
    allowDragToEdit,
    manualHorizontalScroll,
    reduceBrightnessOfPastEvents,
    bodyContainerRef,
    calendarData,
    scrollByDay,
  } = useCalendar();
  const { timeZone } = useTimezone();
  const locale = useLocale();
  const {
    onRefresh,
    onLoad,
    onPressBackground,
    onLongPressBackground,
    onPressEvent,
    onLongPressEvent,
  } = useActions();
  const calendarWidth = useLayout((state) => state.width);
  const scrollProps = useSyncedList({
    id: ScrollType.calendarGrid,
  });
  const bodyStartX = useRef<number>(0);
  const animContentStyle = useAnimatedStyle(() => ({
    height: timelineHeight.value,
  }));
  const outOfRangeData = useMemo(() => {
    return {
      minUnix: calendarData.originalMinDateUnix,
      maxUnix: calendarData.originalMaxDateUnix,
      diffMin: calendarData.bufferBefore.length,
      diffMax: calendarData.bufferAfter.length,
    };
  }, [
    calendarData.originalMinDateUnix,
    calendarData.originalMaxDateUnix,
    calendarData.bufferBefore.length,
    calendarData.bufferAfter.length,
  ]);

  const { isDragging, draggingId } = useDragContext();
  const { pinchGesture, pinchGestureRef } = usePinchToZoom();
  const { gesture: dragEventGesture, triggerDragEvent, triggerDragSelectedEvent } = useDragEvent();
  const { gesture: dragToCreateGesture, triggerDragCreateEvent } = useDragToCreate();

  const _onLayout = (event: LayoutChangeEvent) => {
    scrollVisibleHeight.current = event.nativeEvent.layout.height;
    scrollVisibleHeightAnim.value = event.nativeEvent.layout.height;
  };

  const _onRefresh = useCallback(() => {
    if (onRefresh) {
      const date = parseDateTime(visibleDateUnix.current);
      onRefresh(dateTimeToISOString(date));
    }
  }, [onRefresh, visibleDateUnix]);

  const _onVerticalScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    offsetY.value = e.nativeEvent.contentOffset.y;
  };

  const hours = useMemo(() => {
    return slots.map((slot) => {
      return {
        slot,
        time: toHourStr(slot, hourFormat, locale.meridiem),
      };
    });
  }, [hourFormat, locale.meridiem, slots]);

  const getEventProps = useCallback(
    (event: GestureResponderEvent) => {
      if (!gridListRef.current) {
        return;
      }
      const posX = event.nativeEvent.pageX - bodyStartX.current;
      const columnIndex = Math.floor(posX / columnWidth);
      const currentIndex = gridListRef.current.getCurrentScrollIndex();
      const dayUnix = gridListRef.current.getItemByIndex(currentIndex + columnIndex);
      if (!dayUnix) {
        return;
      }

      const minutes = event.nativeEvent.locationY / minuteHeight.value + start;
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const dateTimeObj = forceUpdateZone(
        parseDateTime(dayUnix, { zone: 'utc' }).plus({ hours: hour, minutes: minute }),
        timeZone
      );
      const newProps: { dateTime: string } = {
        dateTime: dateTimeObj.toUTC().toISO(),
      };
      return newProps;
    },
    [columnWidth, gridListRef, minuteHeight, start, timeZone]
  );

  const handlePressBackground = useCallback(
    (event: GestureResponderEvent) => {
      const newProps = getEventProps(event);
      if (!newProps) {
        return;
      }
      onPressBackground?.(newProps, event);
    },
    [getEventProps, onPressBackground]
  );
  const handleLongPressBackground = useCallback(
    (event: GestureResponderEvent) => {
      const newProps = getEventProps(event);
      if (!newProps) {
        return;
      }
      onLongPressBackground?.(newProps, event);
      if (allowDragToCreate) {
        const posX = event.nativeEvent.pageX - bodyStartX.current;
        triggerDragCreateEvent(newProps.dateTime, posX);
      }
    },
    [allowDragToCreate, getEventProps, onLongPressBackground, triggerDragCreateEvent]
  );

  const handlePressEvent = useCallback(
    (event: PackedEvent) => {
      onPressEvent?.(event);
    },
    [onPressEvent]
  );

  const handleLongPressEvent = useCallback(
    (event: PackedEvent) => {
      onLongPressEvent?.(event);
      if (allowDragToEdit) {
        triggerDragEvent(event);
      }
    },
    [allowDragToEdit, onLongPressEvent, triggerDragEvent]
  );

  const handlePressDraggableEvent = useCallback(
    (event: { eventIndex: number; type: DraggingMode }) => {
      triggerDragSelectedEvent(event);
    },
    [triggerDragSelectedEvent]
  );

  const value = useMemo<BodyContextProps>(
    () => ({
      scrollByDay,
      minuteHeight,
      maxTimelineHeight,
      timeIntervalHeight,
      spaceFromTop,
      spaceFromBottom,
      timelineHeight,
      hours,
      hourFormat,
      totalSlots,
      columnWidthAnim,
      numberOfDays,
      hourWidth,
      start,
      end,
      timeInterval,
      showNowIndicator,
      columnWidth,
      rightEdgeSpacing,
      overlapEventsSpacing,
      visibleDateUnixAnim,
      verticalListRef,
      gridListRef,
      visibleDateUnix,
      isShowHalfHourLine,
      onPressBackground: handlePressBackground,
      onLongPressBackground: handleLongPressBackground,
      bodyStartX,
      onPressEvent: handlePressEvent,
      onLongPressEvent: handleLongPressEvent,
      onPressDraggableEvent: handlePressDraggableEvent,
      reduceBrightnessOfPastEvents,
      draggingId,
      outOfRangeData,
      //
      renderDraggingEvent,
      renderEvent,
      NowIndicatorComponent,
      renderHour,
      renderCustomHorizontalLine,
      renderCustomOutOfRange,
      renderCustomUnavailableHour,
      renderCustomVerticalLine,
    }),
    [
      minuteHeight,
      maxTimelineHeight,
      timeIntervalHeight,
      spaceFromTop,
      spaceFromBottom,
      timelineHeight,
      hours,
      hourFormat,
      totalSlots,
      columnWidthAnim,
      numberOfDays,
      hourWidth,
      start,
      end,
      timeInterval,
      showNowIndicator,
      columnWidth,
      rightEdgeSpacing,
      overlapEventsSpacing,
      visibleDateUnixAnim,
      verticalListRef,
      gridListRef,
      visibleDateUnix,
      isShowHalfHourLine,
      handlePressBackground,
      handleLongPressBackground,
      handlePressEvent,
      handleLongPressEvent,
      handlePressDraggableEvent,
      reduceBrightnessOfPastEvents,
      draggingId,
      outOfRangeData,
      renderDraggingEvent,
      renderEvent,
      NowIndicatorComponent,
      renderHour,
      renderCustomHorizontalLine,
      renderCustomOutOfRange,
      renderCustomUnavailableHour,
      renderCustomVerticalLine,
      scrollByDay,
    ]
  );

  const _onCalendarLayout = (event: LayoutChangeEvent) => {
    event.currentTarget.measure((_x, _y, _width, _height, pageX) => {
      bodyStartX.current = pageX;
    });
  };

  const composedGesture = Gesture.Race(pinchGesture, dragEventGesture, dragToCreateGesture);

  const leftSize = numberOfDays > 1 ? hourWidth : 0;

  const _renderContainer = useCallback((props: ListRenderItemContainerInfo) => {
    const { children: items, ...rest } = props;

    return (
      <ItemContainer.Container {...rest}>
        <ItemContainer.Board />
        <BodyContent>{items}</BodyContent>
        <LoadingOverlay />
      </ItemContainer.Container>
    );
  }, []);

  const _renderItem = useCallback(({ extraData, ...props }: ListRenderItemInfo) => {
    return (
      <BodyItem.Container {...props}>
        <BodyItem.BodyEvents />
        {extraData.renderDraggableEvent ? (
          extraData.renderDraggableEvent({ renderEvent: extraData.renderEvent })
        ) : (
          <BodyItem.DraggableEvent />
        )}
        <BodyItem.NowIndicator>{extraData.NowIndicatorComponent}</BodyItem.NowIndicator>
      </BodyItem.Container>
    );
  }, []);

  const extraData = useMemo(() => {
    return { renderDraggableEvent, renderEvent };
  }, [renderDraggableEvent, renderEvent]);

  return (
    <BodyContext.Provider value={value}>
      <View style={styles.container} ref={bodyContainerRef}>
        <GestureDetector gesture={composedGesture}>
          <AnimatedScrollView
            ref={verticalListRef}
            scrollEventThrottle={16}
            pinchGestureEnabled={false}
            showsVerticalScrollIndicator={false}
            onLayout={_onLayout}
            onScroll={_onVerticalScroll}
            refreshControl={
              onRefresh ? <RefreshControl refreshing={false} onRefresh={_onRefresh} /> : undefined
            }
            scrollEnabled={!isDragging}
            simultaneousHandlers={pinchGestureRef}>
            {numberOfDays > 1 && <TimeColumn />}
            <Animated.View
              style={[
                {
                  width: calendarWidth,
                  overflow: Platform.select({
                    web: 'hidden',
                    default: 'visible',
                  }),
                },
                animContentStyle,
              ]}>
              <View
                onLayout={_onCalendarLayout}
                style={[
                  styles.absolute,
                  {
                    top: -EXTRA_HEIGHT,
                    left: Math.max(0, leftSize - 1),
                    width: calendarWidth - leftSize,
                  },
                ]}>
                <AnimatedCalendarList
                  ref={gridListRef}
                  data={dateList}
                  scrollEnabled={!isDragging && !manualHorizontalScroll && Platform.OS !== 'web'}
                  layoutSize={{
                    width: calendarGridWidth,
                    height: maxTimelineHeight + EXTRA_HEIGHT * 2,
                  }}
                  extraData={extraData}
                  renderItemContainer={_renderContainer}
                  renderItem={_renderItem}
                  snapToOffsets={snapToOffsets}
                  initialDate={visibleDateUnix.current}
                  numColumns={numberOfDays}
                  renderAheadItem={pagesPerSide}
                  pagingEnabled
                  snapToAlignment={snapToOffsets ? 'start' : undefined}
                  decelerationRate={snapToOffsets ? 'fast' : undefined}
                  onLoad={onLoad}
                  {...scrollProps}
                />
              </View>
            </Animated.View>
            <View
              pointerEvents="box-none"
              style={[styles.absolute, { top: spaceFromTop }, styles.dragContainer]}>
              <DraggingEvent renderEvent={renderDraggingEvent ?? renderEvent} />
              <DraggingHour
                draggingHourFormat={draggingHourFormat}
                renderHour={renderDraggingHour ?? renderHour}
              />
            </View>
          </AnimatedScrollView>
        </GestureDetector>
      </View>
    </BodyContext.Provider>
  );
};

export default memo(CalendarBody);

const styles = StyleSheet.create({
  container: { flex: 1 },
  absolute: { position: 'absolute' },
  dragContainer: { zIndex: 11 },
});
