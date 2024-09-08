import isEqual from 'lodash/isEqual';
import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  runOnUI,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MILLISECONDS_IN_DAY } from '../constants';
import { useBody } from '../context/BodyContext';
import { useTheme } from '../context/ThemeProvider';
import {
  EventItem as EventItemType,
  PackedEvent,
  SizeAnimation,
} from '../types';

interface EventItemProps {
  event: PackedEvent;
  startUnix: number;
  renderEvent?: (event: PackedEvent, size: SizeAnimation) => React.ReactNode;
  onPressEvent?: (event: EventItemType) => void;
  onLongPressEvent?: (event: PackedEvent) => void;
  isDragging?: boolean;
  visibleDates: Record<string, { diffDays: number; unix: number }>;
}

const EventItem: FC<EventItemProps> = ({
  event: eventInput,
  startUnix,
  renderEvent,
  onPressEvent,
  onLongPressEvent,
  isDragging,
  visibleDates,
}) => {
  const textStyle = useTheme((state) => state.textStyle);
  const {
    minuteHeight,
    columnWidthAnim,
    start,
    end,
    rightEdgeSpacing,
    overlapEventsSpacing,
  } = useBody();
  const { _internal, ...event } = eventInput;
  const {
    duration,
    startMinutes = 0,
    total,
    index,
    columnSpan,
    startUnix: eventStartUnix,
  } = _internal;

  const getInitialData = useCallback(() => {
    const maxDuration = end - start;
    let newStart = startMinutes - start;
    let totalDuration = Math.min(duration, maxDuration);
    if (newStart < 0) {
      totalDuration += newStart;
      newStart = 0;
    }

    let diffDays = Math.floor(
      (eventStartUnix - startUnix) / MILLISECONDS_IN_DAY
    );

    for (let i = startUnix; i < eventStartUnix; i += MILLISECONDS_IN_DAY) {
      if (!visibleDates[i]) {
        diffDays--;
      }
    }

    return {
      totalDuration,
      startMinutes: newStart,
      diffDays,
    };
  }, [
    end,
    start,
    startMinutes,
    duration,
    eventStartUnix,
    startUnix,
    visibleDates,
  ]);

  const data = useMemo(() => getInitialData(), [getInitialData]);

  const initialStartDuration = useRef(getInitialData());
  const durationAnim = useSharedValue(
    initialStartDuration.current.totalDuration
  );
  const startMinutesAnim = useSharedValue(
    initialStartDuration.current.startMinutes
  );

  const diffDaysAnim = useSharedValue(initialStartDuration.current.diffDays);

  useEffect(() => {
    runOnUI(() => {
      durationAnim.value = withTiming(data.totalDuration, { duration: 150 });
      startMinutesAnim.value = withTiming(data.startMinutes, { duration: 150 });
      diffDaysAnim.value = withTiming(data.diffDays, { duration: 150 });
    })();
  }, [
    data.diffDays,
    data.startMinutes,
    data.totalDuration,
    diffDaysAnim,
    durationAnim,
    startMinutesAnim,
  ]);

  const eventHeight = useDerivedValue(
    () => durationAnim.value * minuteHeight.value
  );

  const eventWidth = useDerivedValue(() => {
    let width = columnWidthAnim.value * (columnSpan / total);
    if (total > 1) {
      width -= (rightEdgeSpacing + 1) / total;
      const isLast = total - columnSpan === index;
      if (isLast) {
        width -= rightEdgeSpacing - 1;
      } else {
        width -= (overlapEventsSpacing * (total - 1)) / total;
      }
    } else {
      width -= rightEdgeSpacing + 1;
    }
    return width;
  });

  const eventPosX = useDerivedValue(() => {
    // TODO: check logic here
    const extraX =
      (columnWidthAnim.value / total - overlapEventsSpacing) * index;
    let left = diffDaysAnim.value * columnWidthAnim.value + extraX;
    if (total > 1 && index > 0 && index < total) {
      left += overlapEventsSpacing * index;
    }
    return left;
  });

  const animView = useAnimatedStyle(() => {
    return {
      height: eventHeight.value,
      width: eventWidth.value,
      left: eventPosX.value + 1,
      top: startMinutesAnim.value * minuteHeight.value,
    };
  });

  const _onPressEvent = () => {
    onPressEvent!(event);
  };

  const _onLongPressEvent = () => {
    onLongPressEvent!(eventInput);
  };

  const opacity = isDragging ? 0.5 : 1;

  return (
    <Animated.View style={[styles.container, animView]}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={0.6}
        disabled={!onPressEvent && !onLongPressEvent}
        onPress={onPressEvent ? _onPressEvent : undefined}
        onLongPress={onLongPressEvent ? _onLongPressEvent : undefined}
      >
        <View
          style={[
            styles.contentContainer,
            { backgroundColor: event.color },
            event.containerStyle,
            { opacity },
          ]}
        >
          {renderEvent ? (
            renderEvent(eventInput, {
              width: eventWidth,
              height: eventHeight,
            })
          ) : (
            <Animated.Text
              style={[textStyle, styles.title, { color: event.titleColor }]}
            >
              {event.title}
            </Animated.Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default React.memo(EventItem, (prev, next) => {
  return (
    isEqual(prev.event, next.event) &&
    isEqual(prev.visibleDates, next.visibleDates) &&
    prev.startUnix === next.startUnix &&
    prev.renderEvent === next.renderEvent &&
    prev.isDragging === next.isDragging &&
    prev.onPressEvent === next.onPressEvent &&
    prev.onLongPressEvent === next.onLongPressEvent
  );
});

const styles = StyleSheet.create({
  container: { position: 'absolute', overflow: 'hidden' },
  title: { fontSize: 10 },
  contentContainer: { borderRadius: 2, width: '100%', height: '100%' },
});
