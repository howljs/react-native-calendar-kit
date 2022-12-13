import dayjs from 'dayjs';
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
import { Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { timeZoneData } from '../../assets/timeZone';
import { COLUMNS, DEFAULT_PROPS, LOCALES } from '../../constants';
import { useTimelineCalendarContext } from '../../context/TimelineProvider';
import useDragCreateGesture from '../../hooks/useDragCreateGesture';
import useZoomGesture from '../../hooks/usePinchGesture';
import useTimelineScroll from '../../hooks/useTimelineScroll';
import type { TimelineCalendarHandle, TimelineProps } from '../../types';
import { groupEventsByDate } from '../../utils';
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
    locale,
    isShowHeader,
    currentIndex,
    pages,
    tzOffset,
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
        const currentDay = dayjs(props?.date).add(tzOffset, 'm');
        const firstDateMoment = dayjs(firstDate.current[viewMode]);
        const diffDays = currentDay.startOf('D').diff(firstDateMoment, 'd');
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
          const position =
            (minutes * timeIntervalHeight.value) / 60 + spaceFromTop;
          const offset = timeIntervalHeight.value * 5;
          goToOffsetY(Math.max(0, position - offset), props?.animatedHour);
        }
      },
      goToNextPage: goToNextPage,
      goToPrevPage: goToPrevPage,
      getZones: () => Object.values(timeZoneData),
      getZone: (key: keyof typeof timeZoneData) => timeZoneData[key],
      goToHour: (hour: number, animated?: boolean) => {
        const minutes = hour * 60;
        const position =
          (minutes * timeIntervalHeight.value) / 60 + spaceFromTop;
        goToOffsetY(Math.max(0, position - 8), animated);
      },
    }),
    [
      firstDate,
      goToNextPage,
      goToOffsetY,
      goToPrevPage,
      spaceFromTop,
      timeIntervalHeight.value,
      timelineHorizontalListRef,
      totalPages,
      viewMode,
      tzOffset,
    ]
  );

  useEffect(() => {
    const localeFn = LOCALES[locale];
    if (localeFn) {
      localeFn().then(() => dayjs.locale(locale));
    }
  }, [locale]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const current = dayjs().add(tzOffset, 'm');
      const isSameDate = current.format('YYYY-MM-DD') === initialDate.current;
      if (scrollToNow && isSameDate) {
        const minutes = current.hour() * 60 + current.minute();
        const position =
          (minutes * timeIntervalHeight.value) / 60 + spaceFromTop;
        const offset = timeIntervalHeight.value * 5;
        goToOffsetY(Math.max(0, position - offset), true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goToOffsetY, scrollToNow]);

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
      const currentDate = pages[viewMode].data[index];
      if (currentDate) {
        runOnJS(onChange)({
          length: pages[viewMode].data.length,
          index,
          prevIndex,
          date: currentDate,
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
        <TimelineSlots
          {...other}
          events={groupedEvents}
          selectedEvent={selectedEvent}
          isDragging={isDraggingCreate}
          isLoading={isLoading}
          gesture={Gesture.Race(dragCreateGesture, zoomGesture)}
          onLongPressBackground={_onLongPressBackground}
        />
        {isDraggingCreate && (
          <DragCreateItem
            offsetX={dragXPosition}
            offsetY={dragYPosition}
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
