import {
  AnimatedCalendarList,
  dateTimeToISOString,
  type DraggingMode,
  type ListRenderItemContainerInfo,
  type ListRenderItemInfo,
  parseDateTime,
  toHourStr,
  useActions,
  useCalendar,
  useDragContext,
  useLayout,
  useLocale,
  usePinchToZoom,
  useResources,
} from '@calendar-kit/core';
import { type FC, memo, useCallback, useMemo, useRef } from 'react';
import type {
  GestureResponderEvent,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import BodyBoard from './components/BodyItem/BodyBoard';
import BodyColumn from './components/BodyItem/BodyColumn';
import BodyContainer from './components/BodyItem/BodyContainer';
import BodyContent from './components/BodyItem/BodyContent';
import BodyEvents from './components/BodyItem/BodyEvents';
import DraggableEvent from './components/BodyItem/DraggableEvent';
import NowIndicator from './components/BodyItem/NowIndicator';
import TimeColumn from './components/BodyItem/TimeColumn';
import DraggingEvent from './components/DraggingEvent';
import DraggingHour from './components/DraggingHour';
import LoadingOverlay from './components/Loading/Overlay';
import { EXTRA_HEIGHT, ScrollType } from './constants';
import type { BodyContextProps } from './context/BodyContext';
import { BodyContext } from './context/BodyContext';
import useDragEventGesture from './hooks/useDragEventGesture';
import useDragToCreate from './hooks/useDragToCreate';
import useSyncedList from './hooks/useSyncedList';
import type { CalendarBodyProps, PackedEvent } from './types';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const CalendarBody: FC<CalendarBodyProps> = ({
  hourFormat = 'HH:mm',
  draggingHourFormat = hourFormat,
  renderHour,
  showNowIndicator = true,
  renderCustomOutOfRange,
  renderCustomUnavailableHour,
  renderEvent,
  renderDraggingHour,
  NowIndicatorComponent,
  renderCustomHorizontalLine,
}) => {
  const {
    hourWidth,
    columnWidthAnim,
    numberOfDays,
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
    columnWidth,
    scrollVisibleHeight,
    verticalListRef,
    visibleDateUnix,
    gridListRef,
    calendarData,
    calendarGridWidth,
    columns,
    snapToOffsets,
    startOffset,
    scrollVisibleHeightAnim,
    visibleDateUnixAnim,
    pagesPerSide,
    rightEdgeSpacing,
    overlapEventsSpacing,
    allowDragToCreate,
    firstDay,
    dateList,
    allowDragToEdit,
    manualHorizontalScroll,
    reduceBrightnessOfPastEvents,
    bodyContainerRef,
  } = useCalendar();
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
  const resources = useResources();
  const scrollProps = useSyncedList({
    id: ScrollType.calendarGrid,
  });
  const bodyStartX = useRef<number>(0);
  const animContentStyle = useAnimatedStyle(() => ({
    height: timelineHeight.value,
  }));

  const { isDragging, draggingId } = useDragContext();
  const { pinchGesture, pinchGestureRef } = usePinchToZoom();
  const {
    gesture: dragEventGesture,
    triggerDragEvent,
    triggerDragSelectedEvent,
  } = useDragEventGesture();
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

  const extraData = useMemo(() => {
    return {
      firstDay,
      minDate: calendarData.minDateUnix,
      columns,
      visibleDatesArray: dateList,
      resources,
    };
  }, [calendarData.minDateUnix, dateList, columns, firstDay, resources]);

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

  const handlePressBackground = useCallback(
    (newProps: { dateTime: string }, event: GestureResponderEvent) => {
      onPressBackground?.(newProps, event);
    },
    [onPressBackground]
  );
  const handleLongPressBackground = useCallback(
    (newProps: { dateTime: string }, event: GestureResponderEvent) => {
      onLongPressBackground?.(newProps, event);
      if (allowDragToCreate) {
        const posX = event.nativeEvent.pageX - bodyStartX.current;
        triggerDragCreateEvent(newProps.dateTime, posX);
      }
    },
    [allowDragToCreate, onLongPressBackground, triggerDragCreateEvent]
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
      triggerDragSelectedEvent?.(event);
    },
    [triggerDragSelectedEvent]
  );

  const value = useMemo<BodyContextProps>(
    () => ({
      renderHour,
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
      columns,
      calendarData,
      renderCustomOutOfRange,
      renderCustomUnavailableHour,
      renderEvent,
      startOffset,
      rightEdgeSpacing,
      overlapEventsSpacing,
      visibleDateUnixAnim,
      NowIndicatorComponent,
      renderCustomHorizontalLine,
      verticalListRef,
      gridListRef,
      visibleDateUnix,
      onPressBackground: handlePressBackground,
      onLongPressBackground: handleLongPressBackground,
      bodyStartX,
      onPressEvent: handlePressEvent,
      onLongPressEvent: handleLongPressEvent,
      onPressDraggableEvent: handlePressDraggableEvent,
      reduceBrightnessOfPastEvents,
      draggingId,
    }),
    [
      renderHour,
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
      columns,
      calendarData,
      renderCustomOutOfRange,
      renderCustomUnavailableHour,
      renderEvent,
      startOffset,
      rightEdgeSpacing,
      overlapEventsSpacing,
      visibleDateUnixAnim,
      NowIndicatorComponent,
      renderCustomHorizontalLine,
      verticalListRef,
      gridListRef,
      visibleDateUnix,
      handlePressBackground,
      handleLongPressBackground,
      bodyStartX,
      handlePressEvent,
      handleLongPressEvent,
      handlePressDraggableEvent,
      reduceBrightnessOfPastEvents,
      draggingId,
    ]
  );

  const composedGesture = Gesture.Race(pinchGesture, dragEventGesture, dragToCreateGesture);

  const leftSize = numberOfDays > 1 || !!resources ? hourWidth : 0;

  const _renderContainer = useCallback(({ item, index, children }: ListRenderItemContainerInfo) => {
    return (
      <BodyContainer item={item} index={index}>
        <BodyBoard />
        <BodyContent>{children}</BodyContent>
        <LoadingOverlay />
      </BodyContainer>
    );
  }, []);

  const _renderItem = useCallback(({ item, index }: ListRenderItemInfo) => {
    return (
      <BodyColumn item={item} index={index}>
        <BodyEvents />
        <DraggableEvent />
        <NowIndicator />
      </BodyColumn>
    );
  }, []);

  const _onCalendarLayout = (event: LayoutChangeEvent) => {
    event.currentTarget.measure((_x, _y, _width, _height, pageX) => {
      bodyStartX.current = pageX;
    });
  };

  return (
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
          <BodyContext.Provider value={value}>
            {(numberOfDays > 1 || !!resources) && <TimeColumn />}
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
                  renderItemContainer={_renderContainer}
                  renderItem={_renderItem}
                  extraData={extraData}
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
              <DraggingEvent />
              <DraggingHour
                renderHour={renderDraggingHour}
                draggingHourFormat={draggingHourFormat}
              />
            </View>
          </BodyContext.Provider>
        </AnimatedScrollView>
      </GestureDetector>
    </View>
  );
};

export default memo(CalendarBody);

const styles = StyleSheet.create({
  container: { flex: 1 },
  absolute: { position: 'absolute' },
  dragContainer: { zIndex: 11 },
});
