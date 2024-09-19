import React, { FC, useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { MILLISECONDS_IN_DAY, MILLISECONDS_IN_MINUTE } from '../constants';
import { useBody } from '../context/BodyContext';
import {
  useDragEvent,
  useDragEventActions,
} from '../context/DragEventProvider';
import { useTheme } from '../context/ThemeProvider';
import { parseDateTime } from '../utils/dateUtils';
import DragDot from './DragDot';

interface DraggableInnerEventProps {
  index: number;
  startUnix: number;
  visibleDates: Record<string, { diffDays: number; unix: number }>;
}

const DraggableEventInner = ({
  startUnix,
  visibleDates,
  index,
}: DraggableInnerEventProps) => {
  const { primaryColor } = useTheme(
    useCallback((state) => {
      return { primaryColor: state.colors.primary };
    }, [])
  );
  const { minuteHeight, columnWidthAnim, start } = useBody();
  const {
    dragSelectedStartUnix,
    dragSelectedDuration,
    dragSelectedStartMinutes,
    isDraggingSelectedEvent,
    selectedEvent,
    isDraggingAnim,
  } = useDragEvent();
  const { triggerDragSelectedEvent } = useDragEventActions();

  const animView = useAnimatedStyle(() => {
    const diffDays = visibleDates[startUnix]?.diffDays ?? 1;
    let top = (dragSelectedStartMinutes.value - start) * minuteHeight.value;
    if (index > 0) {
      const dragStartUnix =
        dragSelectedStartUnix.value +
        dragSelectedStartMinutes.value * MILLISECONDS_IN_MINUTE;
      const diffMinutes = (startUnix - dragStartUnix) / MILLISECONDS_IN_MINUTE;
      top = (0 - diffMinutes - start) * minuteHeight.value;
    }
    return {
      top,
      height: dragSelectedDuration.value * minuteHeight.value,
      width: columnWidthAnim.value,
      left: (diffDays - 1) * columnWidthAnim.value,
      opacity: isDraggingSelectedEvent.value ? 0 : 1,
    };
  });

  const gesture = Gesture.Tap()
    .runOnJS(true)
    .onTouchesDown(() => {
      triggerDragSelectedEvent({ startIndex: index, type: 'center' });
    })
    .onTouchesUp(() => {
      isDraggingAnim.value = false;
    });

  const topEdgeGesture = Gesture.Tap()
    .runOnJS(true)
    .onTouchesDown(() => {
      console.log('ss');

      triggerDragSelectedEvent({ startIndex: index, type: 'top' });
    })
    .onTouchesUp(() => {
      isDraggingAnim.value = false;
    });

  const bottomEdgeGesture = Gesture.Tap()
    .runOnJS(true)
    .onTouchesDown(() => {
      triggerDragSelectedEvent({ startIndex: index, type: 'bottom' });
    })
    .onTouchesUp(() => {
      isDraggingAnim.value = false;
    });

  return (
    <Animated.View style={[styles.container, animView]}>
      {selectedEvent && (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.event,
            {
              backgroundColor: selectedEvent?.color ?? 'transparent',
              borderColor: primaryColor,
            },
          ]}
        >
          <Text>{selectedEvent.title}</Text>
        </View>
      )}
      <GestureDetector gesture={gesture}>
        <View style={StyleSheet.absoluteFill} />
      </GestureDetector>
      <GestureDetector gesture={topEdgeGesture}>
        <View style={[styles.dot, styles.dotLeft]}>
          <DragDot />
        </View>
      </GestureDetector>
      <GestureDetector gesture={bottomEdgeGesture}>
        <View style={[styles.dot, styles.dotRight]}>
          <DragDot />
        </View>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  dot: {
    position: 'absolute',
    borderRadius: 12,
    width: 24,
    height: 24,
  },
  event: {
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 3,
  },
  dotLeft: { top: -12, left: -12 },
  dotRight: { bottom: -12, right: -12 },
});

interface DraggableEventProps {
  startUnix: number;
  visibleDates: Record<string, { diffDays: number; unix: number }>;
}

const DraggableEvent: FC<DraggableEventProps> = ({
  startUnix,
  visibleDates,
}) => {
  const [draggableDates, setDraggableDates] = useState<number[]>([]);
  const {
    dragSelectedStartUnix,
    dragSelectedDuration,
    dragSelectedStartMinutes,
  } = useDragEvent();

  const endUnix = useMemo(() => {
    const lastDate = Object.values(visibleDates).pop();
    if (!lastDate) {
      return 0;
    }
    return lastDate.unix + MILLISECONDS_IN_DAY;
  }, [visibleDates]);

  const _handleDragSelectedEvent = (
    unix: number,
    minutes: number,
    duration: number
  ) => {
    const dragStartUnix = unix + minutes * MILLISECONDS_IN_MINUTE;
    const dragEndUnix = dragStartUnix + duration * MILLISECONDS_IN_MINUTE;
    const isValidStart = dragStartUnix >= startUnix && dragStartUnix < endUnix;
    const isValidEnd = dragEndUnix > startUnix && dragEndUnix < endUnix;
    if (!isValidStart && !isValidEnd) {
      setDraggableDates([]);
      return;
    }

    const startDate = parseDateTime(dragStartUnix).startOf('day');
    const endDate = parseDateTime(dragEndUnix).startOf('day');
    const diffDays = endDate.diff(startDate, 'day').days;
    if (diffDays === 0) {
      setDraggableDates([unix]);
      return;
    }

    const dates = [];
    for (let i = 0; i <= diffDays; i++) {
      dates.push(unix + i * MILLISECONDS_IN_DAY);
    }
    setDraggableDates(dates);
  };

  useAnimatedReaction(
    () => {
      return {
        dragSelectedStartUnix: dragSelectedStartUnix.value,
        dragSelectedStartMinutes: dragSelectedStartMinutes.value,
        dragSelectedDuration: dragSelectedDuration.value,
      };
    },
    (result) => {
      if (
        result.dragSelectedStartUnix > 0 &&
        result.dragSelectedStartMinutes > 0 &&
        result.dragSelectedDuration > 0
      ) {
        runOnJS(_handleDragSelectedEvent)(
          result.dragSelectedStartUnix,
          result.dragSelectedStartMinutes,
          result.dragSelectedDuration
        );
      } else {
        runOnJS(setDraggableDates)([]);
      }
    },
    [startUnix, endUnix]
  );

  return draggableDates.map((date, index) => {
    if (!visibleDates[date]) {
      return null;
    }

    return (
      <DraggableEventInner
        key={`${date}-${index}`}
        startUnix={date}
        visibleDates={visibleDates}
        index={index}
      />
    );
  });
};

export default DraggableEvent;
