import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type { EventItem, PackedEvent } from '../../types';

interface EventBlockProps {
  packedEvent: PackedEvent;
  minuteHeight: SharedValue<number>;
  columnWidth: SharedValue<number>;
  start: number;
  end: number;
  onPressEvent?: (event: EventItem) => void;
  rightEdgeSpacing: number;
  overlapEventsSpacing: number;
  isRTL: boolean;
  onLongPressEvent?: (event: EventItem) => void;
}

const EventBlock = ({
  packedEvent,
  minuteHeight,
  columnWidth,
  start,
  end,
  onPressEvent,
  rightEdgeSpacing,
  overlapEventsSpacing,
  isRTL,
  onLongPressEvent,
}: EventBlockProps) => {
  const { startUnix, endUnix, ...event } = packedEvent.event;
  const startDate = new Date(startUnix * 1000);
  const endDate = new Date(endUnix * 1000);

  const startHour = startDate.getHours();
  const startMinutes = startDate.getMinutes();
  const calendarStart = start * 60;
  const maxDuration = (end - start) * 60;
  let totalStartMinutes = Math.max(
    startHour * 60 + startMinutes - calendarStart,
    0
  );
  const endHour = endDate.getHours();
  const endMinutes = endDate.getMinutes();
  const totalEndMinutes = endHour * 60 + endMinutes;
  let diffMinutes = Math.min(
    totalEndMinutes - totalStartMinutes - calendarStart,
    maxDuration - totalStartMinutes
  );

  if (event.totalDays > 1) {
    const isStart = event.dayIndex === 0;
    const isEnd = event.dayIndex === event.totalDays - 1;

    if (!isStart && !isEnd) {
      totalStartMinutes = 0;
      diffMinutes = maxDuration;
    } else if (isEnd) {
      totalStartMinutes = 0;
      diffMinutes = totalEndMinutes - calendarStart;
    } else {
      diffMinutes = maxDuration - totalStartMinutes;
    }
  }

  const startMin = useSharedValue(totalStartMinutes);
  useEffect(() => {
    startMin.value = withTiming(totalStartMinutes);
  }, [startMin, totalStartMinutes]);

  const diffMin = useSharedValue(diffMinutes);
  useEffect(() => {
    diffMin.value = withTiming(diffMinutes);
  }, [diffMin, diffMinutes]);

  const overlapSpacing =
    packedEvent.index + packedEvent.columnSpan <= packedEvent.total - 1
      ? overlapEventsSpacing
      : rightEdgeSpacing;

  const animView = useAnimatedStyle(() => {
    const left = (packedEvent.index / packedEvent.total) * columnWidth.value;
    const width =
      columnWidth.value * (packedEvent.columnSpan / packedEvent.total);

    return {
      top: startMin.value * minuteHeight.value,
      left: left + rightEdgeSpacing,
      width: width - overlapSpacing,
      height: diffMin.value * minuteHeight.value,
    };
  });

  if (diffMinutes <= 0) {
    return <View />;
  }

  const eventProps = {
    ...event,
    originStart: event.start,
    originEnd: event.end,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };

  const _onPressItem = () => {
    onPressEvent?.(eventProps);
  };

  const _onLongPress = () => {
    onLongPressEvent?.(eventProps);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      disabled={!onPressEvent && !onLongPressEvent}
      onPress={_onPressItem}
      onLongPress={onLongPressEvent ? _onLongPress : undefined}
    >
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: event.color },
          animView,
          isRTL ? styles.alignEnd : styles.alignStart,
          isRTL && { transform: [{ scaleX: -1 }] },
        ]}
      >
        <Text style={styles.title}>{event.title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default React.memo(EventBlock);

const styles = StyleSheet.create({
  container: { position: 'absolute', borderRadius: 2, padding: 2 },
  title: { fontSize: 10 },
  alignStart: { alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
});
