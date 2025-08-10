import type { FC } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import type { ViewStyle } from 'react-native';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { MILLISECONDS_IN_MINUTE } from '../constants';
import { useBody } from '../context/BodyContext';
import {
  useDragEvent,
  useDragEventActions,
} from '../context/DragEventProvider';
import { useTheme } from '../context/ThemeProvider';
import type { ResourceItem, SelectedEventType } from '../types';
import { parseDateTime } from '../utils/dateUtils';
import DragDot from './DragDot';

export interface DraggableEventProps {
  index: number;
  startUnix: number;
  visibleDates: Record<string, { diffDays: number; unix: number }>;
  renderEvent?: (
    event: SelectedEventType,
    options: {
      width: SharedValue<number>;
      height: SharedValue<number>;
    }
  ) => React.ReactElement | null;
  TopEdgeComponent?: React.ReactElement | null;
  BottomEdgeComponent?: React.ReactElement | null;
  containerStyle?: ViewStyle;
  resources?: ResourceItem[];
}

export const DraggableEvent: FC<DraggableEventProps> = ({
  startUnix,
  visibleDates,
  index,
  renderEvent,
  resources,
  TopEdgeComponent,
  BottomEdgeComponent,
  containerStyle,
}) => {
  const theme = useTheme(
    useCallback((state) => {
      return {
        primaryColor: state.colors.primary,
        eventContainerStyle: state.eventContainerStyle,
        eventTitleStyle: state.eventTitleStyle,
      };
    }, [])
  );
  const { minuteHeight, columnWidthAnim, start, numberOfDays } = useBody();
  const {
    dragStartUnix,
    dragSelectedStartUnix,
    dragSelectedDuration,
    dragSelectedStartMinutes,
    selectedEvent,
    isDraggingAnim,
  } = useDragEvent();
  const { triggerDragSelectedEvent } = useDragEventActions();
  const totalResources =
    resources && resources.length > 1 ? resources.length : 1;

  const eventWidth = useDerivedValue(
    () => columnWidthAnim.value / totalResources,
    [totalResources]
  );

  const resourceIndex = useMemo(() => {
    if (!resources) {
      return -1;
    }

    return resources.findIndex(
      (resource) => resource.id === selectedEvent?.resourceId
    );
  }, [resources, selectedEvent?.resourceId]);
  const left = useDerivedValue(() => {
    const diffDays = visibleDates[startUnix]?.diffDays ?? 1;
    return (diffDays - 1) * columnWidthAnim.value;
  }, [visibleDates, startUnix]);

  const top = useDerivedValue(() => {
    if (index > 0) {
      const dragSelectedStart =
        dragSelectedStartUnix.value +
        dragSelectedStartMinutes.value * MILLISECONDS_IN_MINUTE;
      const diffMinutes =
        (startUnix - dragSelectedStart) / MILLISECONDS_IN_MINUTE;
      return (0 - diffMinutes - start) * minuteHeight.value;
    }
    return (dragSelectedStartMinutes.value - start) * minuteHeight.value;
  }, [startUnix, start, index]);

  const eventHeight = useDerivedValue(
    () => dragSelectedDuration.value * minuteHeight.value
  );

  const isDragging = useDerivedValue(() => dragStartUnix.value !== -1);

  const animView = useAnimatedStyle(() => {
    const startX = resourceIndex !== -1 ? resourceIndex * eventWidth.value : 0;
    return {
      top: top.value,
      height: eventHeight.value,
      width: eventWidth.value,
      left: startX + left.value,
      opacity: isDragging.value ? 0 : 1,
    };
  }, [resourceIndex]);

  const gesture = Gesture.Tap()
    .runOnJS(true)
    .onTouchesDown(() => {
      triggerDragSelectedEvent({
        startIndex: index,
        type: 'center',
        resourceIndex,
      });
    })
    .onTouchesUp(() => {
      isDraggingAnim.value = false;
    });

  const topEdgeGesture = Gesture.Tap()
    .runOnJS(true)
    .onTouchesDown(() => {
      triggerDragSelectedEvent({
        startIndex: index,
        type: 'top',
        resourceIndex,
      });
    })
    .onTouchesUp(() => {
      isDraggingAnim.value = false;
    });

  const bottomEdgeGesture = Gesture.Tap()
    .runOnJS(true)
    .onTouchesDown(() => {
      triggerDragSelectedEvent({
        startIndex: index,
        type: 'bottom',
        resourceIndex,
      });
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
            theme.eventContainerStyle,
            styles.event,
            {
              backgroundColor:
                selectedEvent?.color ??
                (Platform.OS === 'android'
                  ? theme.primaryColor
                  : 'transparent'),
              borderColor: theme.primaryColor,
            },
            containerStyle,
          ]}>
          {renderEvent ? (
            renderEvent(selectedEvent, {
              width: eventWidth,
              height: eventHeight,
            })
          ) : (
            <Text style={[styles.eventTitle, theme.eventTitleStyle]}>
              {selectedEvent.title}
            </Text>
          )}
        </View>
      )}
      <GestureDetector gesture={gesture}>
        <View style={[StyleSheet.absoluteFill, { cursor: 'pointer' }]} />
      </GestureDetector>
      <GestureDetector gesture={topEdgeGesture}>
        {TopEdgeComponent || (
          <View
            style={[
              styles.dot,
              styles.dotLeft,
              numberOfDays === 1 && styles.dotLeftSingle,
            ]}>
            <DragDot />
          </View>
        )}
      </GestureDetector>
      <GestureDetector gesture={bottomEdgeGesture}>
        {BottomEdgeComponent || (
          <View
            style={[
              styles.dot,
              styles.dotRight,
              numberOfDays === 1 && styles.dotRightSingle,
            ]}>
            <DragDot />
          </View>
        )}
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
    cursor: 'pointer',
  },
  event: {
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 3,
  },
  dotLeft: { top: -12, left: -12 },
  dotRight: { bottom: -12, right: -12 },
  eventTitle: { fontSize: 12, paddingHorizontal: 2 },
  dotLeftSingle: { left: 0 },
  dotRightSingle: { right: 0 },
});

interface DraggableEventWrapperProps {
  startUnix: number;
  visibleDates: Record<string, { diffDays: number; unix: number }>;
  renderEvent?: (
    event: SelectedEventType,
    options: {
      width: SharedValue<number>;
      height: SharedValue<number>;
    }
  ) => React.ReactElement | null;
  renderDraggableEvent?: (
    event: DraggableEventProps
  ) => React.ReactElement | null;
  resources?: ResourceItem[];
}

const DraggableEventWrapper: FC<DraggableEventWrapperProps> = ({
  startUnix,
  visibleDates,
  renderEvent,
  renderDraggableEvent,
  resources,
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
    return parseDateTime(lastDate.unix).plus({ days: 1 }).toMillis();
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
      dates.push(parseDateTime(unix).plus({ days: i }).toMillis());
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
        result.dragSelectedStartUnix >= 0 &&
        result.dragSelectedStartMinutes >= 0 &&
        result.dragSelectedDuration >= 0
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

    if (renderDraggableEvent) {
      return (
        <React.Fragment key={`${date}-${index}`}>
          {renderDraggableEvent({
            startUnix: date,
            visibleDates,
            index,
            renderEvent,
          })}
        </React.Fragment>
      );
    }

    return (
      <DraggableEvent
        key={`${date}-${index}`}
        startUnix={date}
        visibleDates={visibleDates}
        index={index}
        renderEvent={renderEvent}
        resources={resources}
      />
    );
  });
};

export default DraggableEventWrapper;
