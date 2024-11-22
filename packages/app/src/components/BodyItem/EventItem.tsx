import { useCurrentTimeAnim, useTheme } from '@calendar-kit/core';
import isEqual from 'lodash.isequal';
import type { FC } from 'react';
import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { useBody } from '../../context/BodyContext';
import type { PackedEvent, SizeAnimation } from '../../types';
import Text from '../Text';

interface EventItemProps {
  event: PackedEvent;
  renderEvent?: (event: PackedEvent, size: SizeAnimation) => React.ReactNode;
}

const EventItem: FC<EventItemProps> = ({ event: eventInput, renderEvent }) => {
  const theme = useTheme(
    useCallback((state) => {
      return {
        eventContainerStyle: state.eventContainerStyle,
        eventTitleStyle: state.eventTitleStyle,
      };
    }, [])
  );

  const {
    minuteHeight,
    columnWidthAnim,
    start,
    end,
    rightEdgeSpacing,
    overlapEventsSpacing,
    columnWidth,
    onPressEvent,
    onLongPressEvent,
    reduceBrightnessOfPastEvents,
    draggingId,
  } = useBody();
  const currentTime = useCurrentTimeAnim();
  const { _internal, ...event } = eventInput;
  const {
    duration,
    startMinutes = 0,
    total,
    index,
    columnSpan,
    widthPercentage,
    xOffsetPercentage,
    startUnix,
    endUnix,
  } = _internal;
  const progress = useDerivedValue(() => {
    if (!reduceBrightnessOfPastEvents) {
      return 1;
    }

    return currentTime.value > startUnix && currentTime.value > endUnix ? 0 : 1;
  }, [reduceBrightnessOfPastEvents, currentTime, startUnix, endUnix]);

  const overlayStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']
      ),
    };
  }, [progress]);

  const data = useMemo(() => {
    const maxDuration = end - start;
    let newStart = startMinutes - start;
    let totalDuration = Math.min(duration, maxDuration);
    if (newStart < 0) {
      totalDuration += newStart;
      newStart = 0;
    }
    return { totalDuration, startMinutes: newStart };
  }, [duration, end, start, startMinutes]);

  const eventHeight = useDerivedValue(
    () => data.totalDuration * minuteHeight.value - 1,
    [data.totalDuration, minuteHeight]
  );

  const opacity = useDerivedValue(() => {
    return draggingId.value === eventInput.id ? 0.6 : 1;
  }, [draggingId, eventInput.id]);

  const widthPercent = useDerivedValue(() => {
    if (total && columnSpan) {
      const availableWidth = columnWidth - rightEdgeSpacing;
      const totalColumns = total - columnSpan;
      const overlapSpacing = (totalColumns * overlapEventsSpacing) / total;
      const eventWidth = (availableWidth / total) * columnSpan - overlapSpacing;
      const percent = eventWidth / availableWidth;
      return withTiming(percent, { duration: 150 });
    }

    const basePercent = widthPercentage ? widthPercentage / 100 : 1;
    return withTiming(basePercent, { duration: 150 });
  }, [widthPercentage, columnSpan, rightEdgeSpacing, overlapEventsSpacing, total, columnWidth]);

  const eventWidth = useDerivedValue(() => {
    const availableWidth = columnWidthAnim.value - rightEdgeSpacing;
    return widthPercent.value * availableWidth;
  }, [columnWidthAnim, rightEdgeSpacing, widthPercent]);

  const eventPosX = useDerivedValue(() => {
    let left = 0;
    if (xOffsetPercentage) {
      const availableWidth = columnWidthAnim.value - rightEdgeSpacing;
      left += availableWidth * (xOffsetPercentage / 100);
    } else if (columnSpan && index) {
      left += (eventWidth.value + overlapEventsSpacing) * (index / columnSpan);
    }
    return left;
  }, [
    columnSpan,
    columnWidthAnim,
    eventWidth,
    index,
    overlapEventsSpacing,
    rightEdgeSpacing,
    xOffsetPercentage,
  ]);

  const top = useDerivedValue(() => {
    return data.startMinutes * minuteHeight.value;
  }, [data.startMinutes, minuteHeight]);

  const animView = useAnimatedStyle(() => {
    return {
      height: eventHeight.value,
      width: eventWidth.value,
      left: eventPosX.value + 1,
      top: top.value + 1,
      opacity: opacity.value,
    };
  });

  const _onPressEvent = () => {
    onPressEvent(eventInput);
  };

  const _onLongPressEvent = () => {
    onLongPressEvent(eventInput);
  };

  return (
    <Animated.View style={[styles.container, animView]}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={0.6}
        onPress={_onPressEvent}
        onLongPress={_onLongPressEvent}>
        <View
          style={[
            styles.contentContainer,
            !!xOffsetPercentage && styles.overlapEvent,
            { backgroundColor: event.color },
            theme.eventContainerStyle,
          ]}>
          <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]} />
          {renderEvent ? (
            renderEvent(eventInput, {
              width: eventWidth,
              height: eventHeight,
            })
          ) : (
            <Text style={[styles.title, theme.eventTitleStyle]}>{event.title}</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default memo(EventItem, (prev, next) => {
  return isEqual(prev.event, next.event) && prev.renderEvent === next.renderEvent;
});

const styles = StyleSheet.create({
  container: { position: 'absolute', overflow: 'hidden' },
  title: { fontSize: 12, paddingHorizontal: 2 },
  contentContainer: {
    borderRadius: 2,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  overlapEvent: { borderWidth: 1, borderColor: '#FFF' },
});
