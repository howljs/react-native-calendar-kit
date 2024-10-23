import { useTheme } from '@calendar-kit/core';
import isEqual from 'lodash.isequal';
import type { FC } from 'react';
import React, { useCallback, useMemo } from 'react';
import {
  type GestureResponderEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { MILLISECONDS_IN_DAY } from '../constants';
import { useBody } from '../context/BodyContext';
import type { OnEventResponse, PackedEvent, SizeAnimation } from '../types';
import { parseDateTime } from '../utils/dateUtils';
import Text from './Text';

interface EventItemProps {
  event: PackedEvent;
  startUnix: number;
  renderEvent?: (event: PackedEvent, size: SizeAnimation) => React.ReactNode;
  onPressEvent?: (event: OnEventResponse) => void;
  onLongPressEvent?: (
    event: PackedEvent,
    resEvent: GestureResponderEvent
  ) => void;
  isDragging?: boolean;
  visibleDates: Record<string, { diffDays: number; unix: number }>;
  totalResources?: number;
}

const EventItem: FC<EventItemProps> = ({
  event: eventInput,
  startUnix,
  renderEvent,
  onPressEvent,
  onLongPressEvent,
  isDragging,
  visibleDates,
  totalResources,
}) => {
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
  } = useBody();
  const { _internal, ...event } = eventInput;
  const {
    duration,
    startMinutes = 0,
    total,
    index,
    columnSpan,
    startUnix: eventStartUnix,
    widthPercentage,
    xOffsetPercentage,
    resourceIndex,
  } = _internal;

  const data = useMemo(() => {
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

    if (eventStartUnix < startUnix) {
      for (
        let dayUnix = eventStartUnix;
        dayUnix < startUnix;
        dayUnix = parseDateTime(dayUnix).plus({ days: 1 }).toMillis()
      ) {
        const dayStartUnix = parseDateTime(dayUnix).startOf('day').toMillis();
        if (!visibleDates[dayStartUnix]) {
          diffDays++;
        }
      }
    } else {
      for (
        let dayUnix = startUnix;
        dayUnix < eventStartUnix;
        dayUnix = parseDateTime(dayUnix).plus({ days: 1 }).toMillis()
      ) {
        const dayStartUnix = parseDateTime(dayUnix).startOf('day').toMillis();
        if (!visibleDates[dayStartUnix]) {
          diffDays--;
        }
      }
    }

    return {
      totalDuration,
      startMinutes: newStart,
      diffDays,
    };
  }, [
    duration,
    end,
    eventStartUnix,
    start,
    startMinutes,
    startUnix,
    visibleDates,
  ]);

  const childColumns =
    totalResources && totalResources > 0 ? totalResources : 1;

  const eventHeight = useDerivedValue(
    () => data.totalDuration * minuteHeight.value - 1,
    [data.totalDuration]
  );

  const widthPercent = useDerivedValue(() => {
    if (total && columnSpan) {
      const availableWidth = columnWidth / childColumns - rightEdgeSpacing;
      const totalColumns = total - columnSpan;
      const overlapSpacing = (totalColumns * overlapEventsSpacing) / total;
      const eventWidth = (availableWidth / total) * columnSpan - overlapSpacing;
      const percent = eventWidth / availableWidth;
      return withTiming(percent, { duration: 150 });
    }

    const basePercent = widthPercentage ? widthPercentage / 100 : 1;
    return withTiming(basePercent, { duration: 150 });
  }, [
    widthPercentage,
    columnSpan,
    rightEdgeSpacing,
    overlapEventsSpacing,
    total,
    columnWidth,
    childColumns,
  ]);

  const eventWidth = useDerivedValue(() => {
    const availableWidth =
      columnWidthAnim.value / childColumns - rightEdgeSpacing;
    return widthPercent.value * availableWidth;
  }, [
    childColumns,
    columnSpan,
    rightEdgeSpacing,
    overlapEventsSpacing,
    total,
    widthPercentage,
  ]);

  const eventPosX = useDerivedValue(() => {
    const colWidth = columnWidthAnim.value / childColumns;
    const startOffset = resourceIndex ? resourceIndex * colWidth : 0;
    let left = data.diffDays * colWidth + startOffset;
    if (xOffsetPercentage) {
      const availableWidth =
        columnWidthAnim.value / childColumns - rightEdgeSpacing;
      left += availableWidth * (xOffsetPercentage / 100);
    } else if (columnSpan && index) {
      left += (eventWidth.value + overlapEventsSpacing) * (index / columnSpan);
    }
    return left;
  }, [
    childColumns,
    data.diffDays,
    overlapEventsSpacing,
    rightEdgeSpacing,
    index,
    total,
    xOffsetPercentage,
    resourceIndex,
  ]);

  const top = useDerivedValue(() => {
    return data.startMinutes * minuteHeight.value;
  }, [data.startMinutes]);

  const animView = useAnimatedStyle(() => {
    return {
      height: eventHeight.value,
      width: eventWidth.value,
      left: eventPosX.value + 1,
      top: top.value + 1,
    };
  });

  const _onPressEvent = () => {
    if (onPressEvent) {
      onPressEvent(eventInput);
    }
  };

  const _onLongPressEvent = (resEvent: GestureResponderEvent) => {
    onLongPressEvent!(eventInput, resEvent);
  };

  const opacity = isDragging ? 0.5 : 1;

  return (
    <Animated.View style={[styles.container, animView]}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={0.6}
        disabled={!onPressEvent && !onLongPressEvent}
        onPress={onPressEvent ? _onPressEvent : undefined}
        onLongPress={onLongPressEvent ? _onLongPressEvent : undefined}>
        <View
          style={[
            styles.contentContainer,
            !!xOffsetPercentage && styles.overlapEvent,
            { backgroundColor: event.color },
            theme.eventContainerStyle,
            { opacity },
          ]}>
          {renderEvent ? (
            renderEvent(eventInput, {
              width: eventWidth,
              height: eventHeight,
            })
          ) : (
            <Text style={[styles.title, theme.eventTitleStyle]}>
              {event.title}
            </Text>
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
  title: { fontSize: 12, paddingHorizontal: 2 },
  contentContainer: {
    borderRadius: 2,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  overlapEvent: { borderWidth: 1, borderColor: '#FFF' },
});
