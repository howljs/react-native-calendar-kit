import { clampValues, useDragContext, useResources, useTheme } from '@calendar-kit/core';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

import { useBody } from '../context/BodyContext';
import type { SelectedEventType } from '../types';
import DragDot from './DragDot';

export interface DraggingEventInnerProps {
  renderEvent?: (
    event: SelectedEventType | undefined,
    options: {
      width: SharedValue<number>;
      height: SharedValue<number>;
    }
  ) => React.ReactElement | null;
  TopEdgeComponent?: React.ReactElement | null;
  BottomEdgeComponent?: React.ReactElement | null;
  containerStyle?: ViewStyle;
}

const DraggingEventInner: FC<DraggingEventInnerProps> = ({
  renderEvent,
  TopEdgeComponent,
  BottomEdgeComponent,
  containerStyle,
}) => {
  const resources = useResources();
  const theme = useTheme(
    useCallback((state) => {
      return {
        primaryColor: state.colors.primary,
        eventContainerStyle: state.eventContainerStyle,
        eventTitleStyle: state.eventTitleStyle,
      };
    }, [])
  );

  const { minuteHeight, columnWidthAnim, start, hourWidth, numberOfDays } = useBody();
  const {
    dragToCreateMode,
    selectedEvent,
    draggingEvent,
    draggingColumnIndex,
    draggingStartMinutes,
    draggingDuration,
    dragPosition,
  } = useDragContext();
  const isCreate = !selectedEvent;
  const isShowDot = (dragToCreateMode !== 'date-time' && isCreate) || !isCreate;

  const totalResources = resources && resources.length > 1 ? resources.length : 1;

  const eventWidth = useDerivedValue(
    () => columnWidthAnim.value / totalResources,
    [columnWidthAnim, totalResources]
  );

  const resourceIndex = useDerivedValue(() => {
    const posX = dragPosition.value?.x;
    if (totalResources === 1 || !posX) {
      return 0;
    }

    const columnIndex = Math.floor((posX - hourWidth) / eventWidth.value);
    return clampValues(columnIndex, 0, totalResources - 1);
  }, [dragPosition, totalResources, hourWidth, eventWidth]);

  const eventHeight = useDerivedValue(() => {
    const duration = draggingDuration.value;
    if (duration < 0) {
      return 0;
    }
    return duration * minuteHeight.value;
  });

  const top = useDerivedValue(() => {
    const minutes = draggingStartMinutes.value;
    return (minutes - start) * minuteHeight.value;
  }, [draggingStartMinutes, minuteHeight, start]);

  const left = useDerivedValue(() => {
    if (draggingColumnIndex.value < 0) {
      return -1;
    }
    const startX = resourceIndex.value * eventWidth.value;
    return startX + hourWidth + eventWidth.value * draggingColumnIndex.value - 1;
  }, [eventWidth, hourWidth, draggingColumnIndex, resourceIndex]);

  const animView = useAnimatedStyle(() => {
    return {
      top: top.value,
      height: eventHeight.value,
      width: eventWidth.value,
      left: left.value,
      opacity: eventHeight.value > 0 ? 1 : 0,
    };
  }, [top, eventHeight, eventWidth, left]);

  const renderTopEdgeComponent = () => {
    if (!isShowDot) {
      return null;
    }

    if (TopEdgeComponent) {
      return TopEdgeComponent;
    }

    return (
      <View style={[styles.dot, styles.dotLeft, numberOfDays === 1 && styles.dotLeftSingle]}>
        <DragDot />
      </View>
    );
  };

  const renderBottomEdgeComponent = () => {
    if (!isShowDot) {
      return null;
    }

    if (BottomEdgeComponent) {
      return BottomEdgeComponent;
    }

    return (
      <View style={[styles.dot, styles.dotRight, numberOfDays === 1 && styles.dotRightSingle]}>
        <DragDot />
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, animView]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          theme.eventContainerStyle,
          styles.event,
          {
            backgroundColor: draggingEvent?.color ?? selectedEvent?.color ?? 'transparent',
            borderColor: theme.primaryColor,
          },
          containerStyle,
        ]}>
        {renderEvent
          ? renderEvent(draggingEvent ?? selectedEvent, {
              width: eventWidth,
              height: eventHeight,
            })
          : !!(draggingEvent?.title ?? selectedEvent?.title) && (
              <Text style={[styles.eventTitle, theme.eventTitleStyle]}>
                {draggingEvent?.title ?? selectedEvent?.title}
              </Text>
            )}
      </View>
      {isShowDot && renderTopEdgeComponent()}
      {isShowDot && renderBottomEdgeComponent()}
    </Animated.View>
  );
};

export interface DraggingEventProps {
  renderEvent?: (
    event: SelectedEventType | undefined,
    options: {
      width: SharedValue<number>;
      height: SharedValue<number>;
    }
  ) => React.ReactElement | null;
}

const DraggingEvent = ({ renderEvent }: DraggingEventProps) => {
  const { isDragging, selectedEvent } = useDragContext();
  if (!isDragging && !selectedEvent) {
    return null;
  }

  return <DraggingEventInner renderEvent={renderEvent} />;
};

export default DraggingEvent;

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
    borderWidth: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dotLeft: { top: -12, left: -12 },
  dotRight: { bottom: -12, right: -12 },
  eventTitle: { fontSize: 12, paddingHorizontal: 2 },
  dotLeftSingle: { left: 0 },
  dotRightSingle: { right: 0 },
});
