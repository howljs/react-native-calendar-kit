import React, { FC, useCallback, useEffect, useRef } from 'react';
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
import { isEqual } from 'lodash';

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
  const { minuteHeight, columnWidthAnim, start, end } = useBody();
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

    const diffDays =
      Math.floor((eventStartUnix - startUnix) / MILLISECONDS_IN_DAY) +
      index / total;

    return { totalDuration, startMinutes: newStart, diffDays };
  }, [
    end,
    start,
    startMinutes,
    duration,
    eventStartUnix,
    startUnix,
    index,
    total,
  ]);

  const initialStartDuration = useRef(getInitialData());
  const durationAnim = useSharedValue(
    initialStartDuration.current.totalDuration
  );
  const startMinutesAnim = useSharedValue(
    initialStartDuration.current.startMinutes
  );

  const diffDaysAnim = useSharedValue(initialStartDuration.current.diffDays);

  useEffect(() => {
    const data = getInitialData();
    durationAnim.value = withTiming(data.totalDuration);
    startMinutesAnim.value = withTiming(data.startMinutes);
    diffDaysAnim.value = withTiming(data.diffDays);
  }, [diffDaysAnim, durationAnim, getInitialData, startMinutesAnim]);

  const eventHeight = useDerivedValue(
    () => durationAnim.value * minuteHeight.value
  );
  const eventWidth = useDerivedValue(() => {
    return columnWidthAnim.value * (columnSpan / total) - 2;
  });

  const animView = useAnimatedStyle(() => {
    return {
      height: eventHeight.value,
      width: eventWidth.value,
      left: diffDaysAnim.value * columnWidthAnim.value + 1,
      top: startMinutesAnim.value * minuteHeight.value,
    };
  });

  const animTitle = useAnimatedStyle(() => {
    return {
      fontSize: eventHeight.value > 40 ? 12 : 10,
      margin: 2,
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
              style={[
                styles.title,
                textStyle,
                { color: event.titleColor },
                animTitle,
              ]}
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
  title: { fontSize: 12 },
  contentContainer: { borderRadius: 2, width: '100%', height: '100%' },
});
