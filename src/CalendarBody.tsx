import React, { useCallback, useMemo } from 'react';
import {
  RefreshControl,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import BodyItem from './components/BodyItem';
import CalendarListView from './components/CalendarListView';
import TimeColumn from './components/TimeColumn';
import { EXTRA_HEIGHT, MILLISECONDS_IN_DAY, ScrollType } from './constants';
import { useActions } from './context/ActionsProvider';
import { BodyContext, type BodyContextProps } from './context/BodyContext';
import { useCalendar } from './context/CalendarProvider';
import usePinchToZoom from './hooks/usePinchToZoom';
import useSyncedList from './hooks/useSyncedList';
import type { CalendarBodyProps } from './types';
import { dateTimeToISOString, parseDateTime } from './utils/dateUtils';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const CalendarBody: React.FC<CalendarBodyProps> = ({
  hourFormat = 'HH:mm',
  renderHour,
  showNowIndicator = true,
  renderCustomOutOfRange,
  renderCustomUnavailableHour,
  renderEvent,
  rightEdgeSpacing = 1,
  overlapEventsSpacing = 1,
}) => {
  const {
    calendarLayout,
    hourWidth,
    viewMode,
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
    hours,
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
    initialOffset,
    isRTL,
    columns,
    snapToInterval,
    calendarListRef,
    startOffset,
  } = useCalendar();

  const { onRefresh } = useActions();

  const { onScroll, onVisibleColumnChanged } = useSyncedList({
    id: ScrollType.calendarGrid,
  });

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
      viewMode,
      hourWidth,
      start,
      end,
      timeInterval,
      showNowIndicator,
      columnWidth,
      calendarLayout,
      isRTL,
      columns,
      calendarData,
      renderCustomOutOfRange,
      renderCustomUnavailableHour,
      renderEvent,
      startOffset,
      rightEdgeSpacing,
      overlapEventsSpacing,
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
      viewMode,
      hourWidth,
      start,
      end,
      timeInterval,
      showNowIndicator,
      columnWidth,
      calendarLayout,
      isRTL,
      columns,
      calendarData,
      renderCustomOutOfRange,
      renderCustomUnavailableHour,
      renderEvent,
      startOffset,
      rightEdgeSpacing,
      overlapEventsSpacing,
    ]
  );

  const animContentStyle = useAnimatedStyle(() => ({
    height: timelineHeight.value,
  }));

  const { pinchGesture, pinchGestureRef } = usePinchToZoom();

  const _onLayout = (event: LayoutChangeEvent) => {
    scrollVisibleHeight.current = event.nativeEvent.layout.height;
  };

  const _onRefresh = useCallback(() => {
    if (onRefresh) {
      const date = parseDateTime(visibleDateUnix.current);
      onRefresh(dateTimeToISOString(date));
    }
  }, [onRefresh, visibleDateUnix]);

  const extraWidth = numberOfDays > 1 ? hourWidth : 0;

  const extraData = useMemo(() => {
    return {
      minDate: calendarData.minDateUnix,
      isRTL,
      numberOfDays,
    };
  }, [calendarData.minDateUnix, isRTL, numberOfDays]);

  const _renderTimeSlots = useCallback(
    (index: number, extra: typeof extraData) => {
      let totalColumns = extra.numberOfDays === 1 ? 1 : 7;
      const dateUnixByIndex =
        extra.minDate + index * totalColumns * MILLISECONDS_IN_DAY;

      return <BodyItem startUnix={dateUnixByIndex} />;
    },
    []
  );

  const _onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    offsetY.value = e.nativeEvent.contentOffset.y;
  };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pinchGesture}>
        <AnimatedScrollView
          ref={verticalListRef}
          scrollEventThrottle={16}
          pinchGestureEnabled={false}
          showsVerticalScrollIndicator={false}
          onLayout={_onLayout}
          onScroll={_onScroll}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={false} onRefresh={_onRefresh} />
            ) : undefined
          }
          simultaneousHandlers={pinchGestureRef}
        >
          <BodyContext.Provider value={value}>
            <Animated.View
              style={[{ width: calendarLayout.width }, animContentStyle]}
            >
              <View
                style={[
                  styles.absolute,
                  { top: -EXTRA_HEIGHT, width: calendarLayout.width },
                ]}
              >
                {numberOfDays > 1 && <TimeColumn />}
                <View
                  style={[
                    styles.absolute,
                    {
                      left: extraWidth - 1,
                      width: calendarLayout.width - extraWidth,
                    },
                  ]}
                >
                  <CalendarListView
                    ref={calendarListRef}
                    key={numberOfDays === 1 ? 'single' : 'multi'}
                    animatedRef={gridListRef}
                    count={calendarData.count}
                    width={calendarGridWidth}
                    height={maxTimelineHeight + EXTRA_HEIGHT * 2}
                    renderItem={_renderTimeSlots}
                    extraData={extraData}
                    inverted={isRTL}
                    snapToInterval={snapToInterval}
                    initialOffset={initialOffset}
                    onScroll={onScroll}
                    columnWidth={columnWidth}
                    onVisibleColumnChanged={onVisibleColumnChanged}
                  />
                </View>
              </View>
            </Animated.View>
          </BodyContext.Provider>
        </AnimatedScrollView>
      </GestureDetector>
    </View>
  );
};

export default React.memo(CalendarBody);

const styles = StyleSheet.create({
  container: { flex: 1 },
  absolute: { position: 'absolute' },
});
