import times from 'lodash/times';
import moment from 'moment-timezone';
import React, { useMemo } from 'react';
import {
  GestureResponderEvent,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { COLUMNS } from '../../constants';
import { useTimelineCalendarContext } from '../../context/TimelineProvider';
import type { EventItem, PackedEvent, UnavailableItemProps } from '../../types';
import { convertPositionToISOString, divideEventsByColumns } from '../../utils';
import EventBlock from './EventBlock';
import NowIndicator from './NowIndicator';
import TimelineBoard from './TimelineBoard';
import TimelineHours from './TimelineHours';

interface TimelinePageProps {
  startDate: string;
  isLoading?: boolean;
  onPressBackground?: (date: string, event: GestureResponderEvent) => void;
  onLongPressBackground?: (date: string, event: GestureResponderEvent) => void;
  onPressOutBackground?: (date: string, event: GestureResponderEvent) => void;
  holidays?: string[];
  events?: { [date: string]: EventItem[] };
  onPressEvent?: (eventItem: PackedEvent) => void;
  onLongPressEvent?: (eventItem: PackedEvent) => void;
  renderEventContent?: (
    event: PackedEvent,
    timeIntervalHeight: SharedValue<number>
  ) => JSX.Element;
  selectedEventId?: string;
  renderCustomUnavailableItem?: (props: UnavailableItemProps) => JSX.Element;
  renderHalfLineCustom?: (width: number) => JSX.Element;
  halfLineContainerStyle?: ViewStyle;
  currentDate: string;
}

const TimelinePage = ({
  startDate,
  onPressBackground,
  onLongPressBackground,
  onPressOutBackground,
  isLoading,
  holidays,
  events,
  onPressEvent,
  onLongPressEvent,
  renderEventContent,
  selectedEventId,
  renderCustomUnavailableItem,
  renderHalfLineCustom,
  halfLineContainerStyle,
  currentDate,
}: TimelinePageProps) => {
  const {
    rightSideWidth,
    viewMode,
    spaceFromTop,
    timeIntervalHeight,
    totalHours,
    timelineWidth,
    columnWidth,
    showNowIndicator,
    start,
    overlapEventsSpacing,
    rightEdgeSpacing,
    theme,
    eventAnimatedDuration,
    tzOffset,
    updateCurrentDate,
    nowIndicatorInterval,
    isPinchActive,
    heightByTimeInterval,
  } = useTimelineCalendarContext();

  const eventsByColumns = useMemo(
    () =>
      divideEventsByColumns({
        events,
        columns: COLUMNS[viewMode],
        columnWidth,
        startHour: start,
        startDate,
        overlapEventsSpacing,
        rightEdgeSpacing,
        tzOffset,
      }),
    [
      columnWidth,
      events,
      overlapEventsSpacing,
      rightEdgeSpacing,
      start,
      startDate,
      viewMode,
      tzOffset,
    ]
  );

  const boardStyle = useAnimatedStyle(() => {
    return {
      height: totalHours * timeIntervalHeight.value,
    };
  });

  const _onPressBackgroundHandler = (
    type: 'longPress' | 'press' | 'pressOut',
    event: GestureResponderEvent
  ) => {
    if (!event.nativeEvent.locationX || !event.nativeEvent.locationY) {
      return;
    }
    const dateIsoString = convertPositionToISOString(
      event.nativeEvent.locationX,
      event.nativeEvent.locationY,
      startDate,
      heightByTimeInterval.value,
      columnWidth
    );

    switch (type) {
      case 'longPress':
        onLongPressBackground?.(dateIsoString, event);
        break;

      case 'pressOut':
        onPressOutBackground?.(dateIsoString, event);
        break;

      default:
        onPressBackground?.(dateIsoString, event);
        break;
    }
  };

  const _renderEvent = (event: PackedEvent, dayIndex: number) => {
    return (
      <EventBlock
        key={event.id}
        event={event}
        dayIndex={dayIndex}
        columnWidth={columnWidth}
        timeIntervalHeight={timeIntervalHeight}
        onPressEvent={onPressEvent}
        onLongPressEvent={onLongPressEvent}
        renderEventContent={renderEventContent}
        selectedEventId={selectedEventId}
        theme={theme}
        eventAnimatedDuration={eventAnimatedDuration}
        isPinchActive={isPinchActive}
        heightByTimeInterval={heightByTimeInterval}
      />
    );
  };

  const _renderTimelineColumn = (dayIndex: number) => {
    const dateByColumn = moment.tz(startDate, tzOffset).add(dayIndex, 'd');
    const dateStr = dateByColumn.format('YYYY-MM-DD');
    const isToday = dateStr === currentDate;

    return (
      <React.Fragment key={dayIndex}>
        <View pointerEvents="box-none" style={styles.eventsContainer}>
          {eventsByColumns[dayIndex]?.map((event) =>
            _renderEvent(event, dayIndex)
          )}
        </View>
        {showNowIndicator && isToday && (
          <NowIndicator
            timeIntervalHeight={heightByTimeInterval}
            width={columnWidth}
            dayIndex={dayIndex}
            nowIndicatorColor={theme.nowIndicatorColor}
            tzOffset={tzOffset}
            start={start}
            updateCurrentDate={updateCurrentDate}
            nowIndicatorInterval={nowIndicatorInterval}
          />
        )}
      </React.Fragment>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { width: viewMode === 'day' ? timelineWidth : rightSideWidth },
      ]}
    >
      {viewMode === 'day' && <TimelineHours />}
      <Animated.View
        style={[{ width: rightSideWidth, marginTop: spaceFromTop }, boardStyle]}
      >
        <TimelineBoard
          startDate={startDate}
          onPressBackgroundHandler={_onPressBackgroundHandler}
          holidays={holidays}
          renderCustomUnavailableItem={renderCustomUnavailableItem}
          renderHalfLineCustom={renderHalfLineCustom}
          halfLineContainerStyle={halfLineContainerStyle}
        />
        {times(COLUMNS[viewMode], _renderTimelineColumn)}
      </Animated.View>
      {isLoading && <View style={styles.loadingFrame} />}
    </View>
  );
};

export default TimelinePage;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  loadingFrame: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0)',
  },
  eventsContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
});
