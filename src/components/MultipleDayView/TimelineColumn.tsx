import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useCalendarKit } from '../../context/CalendarKitProvider';
import { useMultipleDayView } from '../../context/MultipleDayViewProvider';
import { EventItem, PackedEvent } from '../../types';
import EventBlock from '../Common/EventBlock';

interface TimelineColumnProps {
  dayIndex: number;
  events: PackedEvent[];
  onPressEvent?: (event: EventItem) => void;
  onLongPressEvent?: (event: EventItem) => void;
  selectedId?: string;
}

const TimelineColumn = ({
  dayIndex,
  events,
  onPressEvent,
  onLongPressEvent,
}: TimelineColumnProps) => {
  const {
    minuteHeight,
    start,
    end,
    rightEdgeSpacing,
    overlapEventsSpacing,
    isRTL,
  } = useCalendarKit();
  const { columnWidth } = useMultipleDayView();

  const animView = useAnimatedStyle(() => ({
    width: columnWidth.value,
    left: columnWidth.value * dayIndex,
  }));

  const _renderEvent = (event: PackedEvent) => {
    return (
      <EventBlock
        key={event.event.id}
        packedEvent={event}
        minuteHeight={minuteHeight}
        columnWidth={columnWidth}
        start={start}
        end={end}
        onPressEvent={onPressEvent}
        rightEdgeSpacing={rightEdgeSpacing}
        overlapEventsSpacing={overlapEventsSpacing}
        isRTL={isRTL}
        onLongPressEvent={onLongPressEvent}
      />
    );
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.container, animView]}
    >
      {events.map(_renderEvent)}
    </Animated.View>
  );
};

export default TimelineColumn;
const styles = StyleSheet.create({
  container: { position: 'absolute', height: '100%' },
});
