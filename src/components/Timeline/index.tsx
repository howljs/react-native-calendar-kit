import moment from 'moment-timezone';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedReaction,
  withTiming,
} from 'react-native-reanimated';
import { timeZoneData } from '../../assets/timeZone';
import { COLUMNS, DEFAULT_PROPS } from '../../constants';
import { useTimelineCalendarContext } from '../../context/TimelineProvider';
import useDragCreateGesture from '../../hooks/useDragCreateGesture';
import useZoomGesture from '../../hooks/usePinchGesture';
import useTimelineScroll from '../../hooks/useTimelineScroll';
import type { TimelineCalendarHandle, TimelineProps } from '../../types';
import { clampValues, groupEventsByDate } from '../../utils';
import DragCreateItem from './DragCreateItem';
import TimelineHeader from './TimelineHeader';
import TimelineSlots from './TimelineSlots';

const Timeline: React.ForwardRefRenderFunction<
  TimelineCalendarHandle,
  TimelineProps
> = (
  {
    renderDayBarItem,
    onPressDayNum,
    onDragCreateEnd,
    onLongPressBackground,
    isLoading,
    events,
    selectedEvent,
    highlightDates,
    onChange,
    onTimeIntervalHeightChange,
    ...other
  },
  ref
) => {
  const {
    timelineLayoutRef,
    minTimeIntervalHeight,
    theme,
    totalHours,
    allowDragToCreate,
    firstDate,
    viewMode,
    totalPages,
    timelineHorizontalListRef,
    timeIntervalHeight,
    spaceFromTop,
    allowPinchToZoom,
    scrollToNow,
    initialDate,
    isShowHeader,
    currentIndex,
    pages,
    tzOffset,
    maxTimeIntervalHeight,
    updateCurrentDate,
    offsetY,
    timelineVerticalListRef,
    initialTimeIntervalHeight,
    heightByTimeInterval,
    start,
  } = useTimelineCalendarContext();
  const { goToNextPage, goToPrevPage, goToOffsetY } = useTimelineScroll();

  useImperativeHandle<TimelineCalendarHandle, TimelineCalendarHandle>(
    ref,
    () => ({
      goToDate: (props?: {
        date?: string;
        hourScroll?: boolean;
        animatedDate?: boolean;
        animatedHour?: boolean;
      }) => {
        const numOfDays =
          viewMode === 'workWeek' ? COLUMNS.week : COLUMNS[viewMode];
        const currentDay = moment.tz(props?.date, tzOffset);
        const firstDateMoment = moment.tz(
          firstDate.current[viewMode],
          tzOffset
        );
        const diffDays = currentDay
          .clone()
          .startOf('D')
          .diff(firstDateMoment, 'd');
        const pageIndex = Math.floor(diffDays / numOfDays);
        if (pageIndex < 0 || pageIndex > totalPages[viewMode] - 1) {
          return;
        }

        timelineHorizontalListRef.current?.scrollToIndex({
          index: pageIndex,
          animated: props?.animatedDate,
        });

        if (props?.hourScroll) {
          const minutes = currentDay.hour() * 60 + currentDay.minute();
          const subtractMinutes = minutes - start * 60;
          const position =
            (subtractMinutes * timeIntervalHeight.value) / 60 + spaceFromTop;
          const offset = timelineLayoutRef.current.height / 2;
          goToOffsetY(Math.max(0, position - offset), props?.animatedHour);
        }
      },
      goToNextPage: goToNextPage,
      goToPrevPage: goToPrevPage,
      getZones: () => Object.values(timeZoneData),
      getZone: (key: keyof typeof timeZoneData) => timeZoneData[key],
      getHour: () => {
        const position = Math.max(0, offsetY.value - spaceFromTop + 8);
        const minutes = (position * 60) / heightByTimeInterval.value;
        const hour = minutes / 60 + start;
        return Math.max(0, hour);
      },
      getDate: () => {
        const numOfDays =
          viewMode === 'workWeek' ? COLUMNS.week : COLUMNS[viewMode];
        const firstDateMoment = moment.tz(
          firstDate.current[viewMode],
          tzOffset
        );
        const pageIndex = currentIndex.value;
        const currentDay = firstDateMoment.add(pageIndex * numOfDays, 'd');
        return currentDay.toISOString();
      },
      goToHour: (hour: number, animated?: boolean) => {
        const minutes = (hour - start) * 60;
        const position =
          (minutes * heightByTimeInterval.value) / 60 + spaceFromTop;
        goToOffsetY(Math.max(0, position - 8), animated);
      },
      forceUpdateNowIndicator: updateCurrentDate,
      zoom: (props?: { scale?: number; height?: number }) => {
        let newHeight = props?.height ?? initialTimeIntervalHeight;
        if (props?.scale) {
          newHeight = timeIntervalHeight.value * props.scale;
        }
        const clampedHeight = clampValues(
          newHeight,
          minTimeIntervalHeight.value,
          maxTimeIntervalHeight
        );
        const pinchYNormalized = offsetY.value / timeIntervalHeight.value;
        const pinchYScale = clampedHeight * pinchYNormalized;
        const y = pinchYScale;
        timelineVerticalListRef.current?.scrollTo({ x: 0, y, animated: true });
        timeIntervalHeight.value = withTiming(clampedHeight);
      },
    }),
    [
      goToNextPage,
      goToPrevPage,
      updateCurrentDate,
      viewMode,
      tzOffset,
      firstDate,
      totalPages,
      timelineHorizontalListRef,
      start,
      timeIntervalHeight,
      spaceFromTop,
      timelineLayoutRef,
      goToOffsetY,
      offsetY.value,
      heightByTimeInterval.value,
      currentIndex.value,
      initialTimeIntervalHeight,
      minTimeIntervalHeight.value,
      maxTimeIntervalHeight,
      timelineVerticalListRef,
    ]
  );

  useAnimatedReaction(
    () => timeIntervalHeight.value,
    (next, prev) => {
      if (next === prev || !onTimeIntervalHeightChange) {
        return;
      }
      runOnJS(onTimeIntervalHeightChange)(next);
    },
    [onTimeIntervalHeightChange]
  );

  useEffect(() => {
    if (!timelineLayoutRef.current.height) {
      return;
    }
    requestAnimationFrame(() => {
      const current = moment.tz(tzOffset);
      const isSameDate = current.format('YYYY-MM-DD') === initialDate.current;
      if (scrollToNow && isSameDate) {
        const minutes = current.hour() * 60 + current.minute();
        const subtractMinutes = minutes - start * 60;
        const position =
          (subtractMinutes * heightByTimeInterval.value) / 60 + spaceFromTop;
        const offset = timelineLayoutRef.current.height / 2;
        goToOffsetY(Math.max(0, position - offset), true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goToOffsetY, scrollToNow, timelineLayoutRef.current.height]);

  const _onContentLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    if (!minTimeIntervalHeight.value) {
      const minHeight = Math.max(
        layout.height / (totalHours + 1),
        DEFAULT_PROPS.MIN_TIME_INTERVAL_HEIGHT
      );
      minTimeIntervalHeight.value = minHeight;
    }

    timelineLayoutRef.current = {
      width: layout.width,
      height: layout.height,
    };
  };

  const { zoomGesture } = useZoomGesture({
    enabled: allowPinchToZoom && !selectedEvent?.id,
  });
  const {
    dragCreateGesture,
    isDraggingCreate,
    dragXPosition,
    dragYPosition,
    currentHour,
    startHour,
    startHourCalculated,
    onLongPress,
  } = useDragCreateGesture({
    onDragCreateEnd,
  });

  const _onLongPressBackground = (
    date: string,
    event: GestureResponderEvent
  ) => {
    if (allowDragToCreate && !selectedEvent) {
      onLongPress(event);
    }
    onLongPressBackground?.(date, event);
  };

  const groupedEvents = useMemo(
    () => groupEventsByDate(events, tzOffset),
    [events, tzOffset]
  );

  useAnimatedReaction(
    () => currentIndex.value,
    (index, prevIndex) => {
      if (!onChange) {
        return;
      }
      const startDate = pages[viewMode].data[index];
      if (startDate) {
        runOnJS(onChange)({
          length: pages[viewMode].data.length,
          index,
          prevIndex,
          date: startDate,
        });
      }
    },
    [viewMode]
  );

  return (
    <GestureHandlerRootView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {isShowHeader && (
        <TimelineHeader
          renderDayBarItem={renderDayBarItem}
          onPressDayNum={onPressDayNum}
          isLoading={isLoading}
          highlightDates={highlightDates}
          selectedEventId={selectedEvent?.id}
        />
      )}
      <View style={styles.content} onLayout={_onContentLayout}>
        <GestureDetector gesture={Gesture.Race(dragCreateGesture, zoomGesture)}>
          <TimelineSlots
            {...other}
            events={groupedEvents}
            selectedEvent={selectedEvent}
            isDragging={isDraggingCreate}
            isLoading={isLoading}
            onLongPressBackground={_onLongPressBackground}
          />
        </GestureDetector>
        {isDraggingCreate && (
          <DragCreateItem
            offsetX={dragXPosition}
            offsetY={dragYPosition}
            startHour={startHour}
            startHourCalculated={startHourCalculated}
            currentHour={currentHour}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
};

export default forwardRef(Timeline);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
});
