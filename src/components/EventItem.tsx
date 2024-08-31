import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MILLISECONDS_IN_DAY } from '../constants';
import { useActions } from '../context/ActionsProvider';
import { useBody } from '../context/BodyContext';
import { useTheme } from '../context/ThemeProvider';
import { PackedEvent, SizeAnimation } from '../types';
import isEqual from 'lodash/isEqual';

interface EventItemProps {
  event: PackedEvent;
  startUnix: number;
  renderEvent?: (event: PackedEvent, size: SizeAnimation) => React.ReactNode;
}

const EventItem: FC<EventItemProps> = ({
  event: eventInput,
  startUnix,
  renderEvent,
}) => {
  const { onPressEvent } = useActions();
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

    const diffDays = Math.floor(
      (eventStartUnix - startUnix) / MILLISECONDS_IN_DAY
    );

    return { totalDuration, startMinutes: newStart, diffDays };
  }, [end, start, startMinutes, duration, eventStartUnix, startUnix]);

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
    durationAnim.value = withTiming(data.totalDuration);
    startMinutesAnim.value = withTiming(data.startMinutes);
    diffDaysAnim.value = withTiming(data.diffDays);
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
    onPressEvent!(eventInput);
  };

  return (
    <Animated.View style={[styles.container, animView]}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={0.6}
        disabled={!onPressEvent}
        onPress={onPressEvent ? _onPressEvent : undefined}
      >
        <View
          style={[
            styles.contentContainer,
            { backgroundColor: event.color },
            event.containerStyle,
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
    prev.startUnix === next.startUnix &&
    prev.renderEvent === next.renderEvent
  );
});

const styles = StyleSheet.create({
  container: { position: 'absolute', overflow: 'hidden' },
  title: { fontSize: 10 },
  contentContainer: { borderRadius: 2, width: '100%', height: '100%' },
});
