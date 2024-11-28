import { useTheme } from '@calendar-kit/core';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

import { useBody, useBodyItem } from '../../context/BodyContext';
import { useDragContext } from '../../context/DragProvider';
import type { SelectedEventType } from '../../types';
import DragDot from '../DragDot';

export interface DraggableEventInnerProps {
  startUnix: number;
  index: number;
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
}

export const DraggableEvent: FC<DraggableEventInnerProps> = ({
  index,
  renderEvent,
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
  const {
    minuteHeight,
    columnWidthAnim,
    start,
    numberOfDays,
    verticalListRef,
    gridListRef,
    onPressDraggableEvent,
  } = useBody();
  const { draggableData, selectedEvent, isDraggingAnim, isShowDraggableEvent } = useDragContext();

  const top = useDerivedValue(() => {
    if (!draggableData.value) {
      return 0;
    }

    const startMinutes = draggableData.value.startMinutes - start;
    if (index > 0) {
      const endMinutes = 24 * 60;
      return (start - (endMinutes - startMinutes)) * minuteHeight.value;
    }
    return startMinutes * minuteHeight.value;
  }, [draggableData, start, index, minuteHeight]);

  const eventHeight = useDerivedValue(() => {
    if (!draggableData.value) {
      return 0;
    }
    return draggableData.value.duration * minuteHeight.value;
  }, [draggableData, minuteHeight]);

  const animView = useAnimatedStyle(() => {
    return {
      top: top.value,
      height: eventHeight.value,
      width: columnWidthAnim.value,
      opacity: isShowDraggableEvent.value && eventHeight.value > 0 ? 1 : 0,
    };
  }, [columnWidthAnim, eventHeight, isShowDraggableEvent, top]);

  const gesture = Gesture.Tap()
    .blocksExternalGesture(verticalListRef, gridListRef as any)
    .runOnJS(true)
    .onTouchesDown(() => {
      onPressDraggableEvent({
        eventIndex: index,
        type: 'middle',
      });
    })
    .onTouchesUp(() => {
      isDraggingAnim.value = false;
    });

  const topEdgeGesture = Gesture.Tap()
    .blocksExternalGesture(verticalListRef, gridListRef as any)
    .runOnJS(true)
    .onTouchesDown(() => {
      onPressDraggableEvent({
        eventIndex: index,
        type: 'top',
      });
    })
    .onTouchesUp(() => {
      isDraggingAnim.value = false;
    });

  const bottomEdgeGesture = Gesture.Tap()
    .blocksExternalGesture(verticalListRef, gridListRef as any)
    .runOnJS(true)
    .onTouchesDown(() => {
      onPressDraggableEvent({
        eventIndex: index,
        type: 'bottom',
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
                (Platform.OS === 'android' ? theme.primaryColor : 'transparent'),
              borderColor: theme.primaryColor,
            },
            containerStyle,
          ]}>
          {renderEvent ? (
            renderEvent(selectedEvent, {
              width: columnWidthAnim,
              height: eventHeight,
            })
          ) : (
            <Text style={[styles.eventTitle, theme.eventTitleStyle]}>{selectedEvent.title}</Text>
          )}
        </View>
      )}
      <GestureDetector gesture={gesture}>
        <View style={[StyleSheet.absoluteFill, { cursor: 'pointer' }]} />
      </GestureDetector>
      <GestureDetector gesture={topEdgeGesture}>
        {TopEdgeComponent || (
          <View style={[styles.dot, styles.dotLeft, numberOfDays === 1 && styles.dotLeftSingle]}>
            <DragDot />
          </View>
        )}
      </GestureDetector>
      <GestureDetector gesture={bottomEdgeGesture}>
        {BottomEdgeComponent || (
          <View style={[styles.dot, styles.dotRight, numberOfDays === 1 && styles.dotRightSingle]}>
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
    zIndex: 99,
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

export interface DraggableEventProps {
  renderEvent?: (
    event: SelectedEventType,
    options: {
      width: SharedValue<number>;
      height: SharedValue<number>;
    }
  ) => React.ReactElement | null;
}

const DraggableEventWrapper: FC<DraggableEventProps> = ({ renderEvent }) => {
  const { item } = useBodyItem();
  const { draggableDates } = useDragContext();

  const index = draggableDates.findIndex((date) => date === item);
  if (index === -1) {
    return null;
  }

  const date = draggableDates[index];
  return (
    <DraggableEvent
      key={`${date}-${index}`}
      startUnix={date}
      index={index}
      renderEvent={renderEvent}
    />
  );
};

export default DraggableEventWrapper;
