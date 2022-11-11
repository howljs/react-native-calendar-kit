import dayjs from 'dayjs';
import weekDay from 'dayjs/plugin/weekday';
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

dayjs.extend(weekDay);

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
        const currentDay = dayjs(props?.date);
        const firstDateMoment = dayjs(firstDate[viewMode]);
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
          goToOffsetY(Math.max(0, position - 200), props?.animatedHour);
        }
      },
      goToNextPage: goToNextPage,
      goToPrevPage: goToPrevPage,
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
      const current = dayjs();
      const isSameDate = current.format('YYYY-MM-DD') === initialDate.current;
      if (scrollToNow && isSameDate) {
        const minutes = current.hour() * 60 + current.minute();
        const position =
          (minutes * timeIntervalHeight.value) / 60 + spaceFromTop;
        goToOffsetY(Math.max(0, position - 200), true);
      }
    });
  }, [
    goToOffsetY,
    initialDate,
    scrollToNow,
    spaceFromTop,
    timeIntervalHeight.value,
  ]);

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
    if (allowDragToCreate) {
      onLongPress(event);
    }
    onLongPressBackground?.(date, event);
  };

  const groupedEvents = useMemo(() => groupEventsByDate(events), [events]);

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
