import type { FC } from 'react';
import React, { useCallback, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { useBody } from '../../context/BodyContext';
import {
  useDragEvent,
  useDragEventActions,
} from '../../context/DragEventProvider';
import { useTheme } from '../../context/ThemeProvider';
import { useDateChangedListener } from '../../context/VisibleDateProvider';
import type { ResourceItem, SelectedEventType } from '../../types';
import DragDot from '../DragDot';

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

export const ResourceDraggableEvent: FC<DraggableEventProps> = ({
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
  const { minuteHeight, columnWidth, start, numberOfDays, resourcePerPage } =
    useBody();
  const {
    dragStartUnix,
    dragSelectedDuration,
    dragSelectedStartMinutes,
    selectedEvent,
    isDraggingAnim,
  } = useDragEvent();
  const { triggerDragSelectedEvent } = useDragEventActions();

  const eventWidth = columnWidth / resourcePerPage;
  const eventWidthAnim = useDerivedValue(() => eventWidth, [eventWidth]);

  const resourceIndex = useMemo(() => {
    if (!resources) {
      return -1;
    }

    return resources.findIndex(
      (resource) => resource.id === selectedEvent?.resourceId
    );
  }, [resources, selectedEvent?.resourceId]);

  const top = useDerivedValue(() => {
    return (dragSelectedStartMinutes.value - start) * minuteHeight.value;
  }, [start]);

  const eventHeight = useDerivedValue(
    () => dragSelectedDuration.value * minuteHeight.value
  );

  const isDragging = useDerivedValue(() => dragStartUnix.value !== -1);

  const animView = useAnimatedStyle(() => {
    return {
      top: top.value,
      height: eventHeight.value,
      left: resourceIndex * eventWidth,
      opacity: isDragging.value || top.value === -1 ? 0 : 1,
    };
  });

  const gesture = Gesture.Tap()
    .runOnJS(true)
    .onTouchesDown(() => {
      triggerDragSelectedEvent({
        startIndex: 0,
        type: 'center',
        resourceId: selectedEvent?.resourceId,
      });
    })
    .onTouchesUp(() => {
      isDraggingAnim.value = false;
    });

  const topEdgeGesture = Gesture.Tap()
    .runOnJS(true)
    .onTouchesDown(() => {
      triggerDragSelectedEvent({
        startIndex: 0,
        type: 'top',
        resourceId: selectedEvent?.resourceId,
      });
    })
    .onTouchesUp(() => {
      isDraggingAnim.value = false;
    });

  const bottomEdgeGesture = Gesture.Tap()
    .runOnJS(true)
    .onTouchesDown(() => {
      triggerDragSelectedEvent({
        startIndex: 0,
        type: 'bottom',
        resourceId: selectedEvent?.resourceId,
      });
    })
    .onTouchesUp(() => {
      isDraggingAnim.value = false;
    });

  return (
    <Animated.View style={[styles.container, { width: eventWidth }, animView]}>
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
              width: eventWidthAnim,
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

interface DraggableEventResourceProps {
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
  totalSize: number;
}

export const DraggableEventResource = ({
  renderDraggableEvent,
  resources,
  renderEvent,
}: DraggableEventResourceProps) => {
  const startUnix = useDateChangedListener();
  const { selectedEvent } = useDragEvent();

  if (!selectedEvent) {
    return null;
  }

  if (renderDraggableEvent) {
    return (
      <React.Fragment>
        {renderDraggableEvent({
          startUnix,
          visibleDates: { [startUnix]: { diffDays: 1, unix: startUnix } },
          index: 0,
          renderEvent,
          resources,
        })}
      </React.Fragment>
    );
  }

  return (
    <ResourceDraggableEvent
      startUnix={startUnix}
      visibleDates={{ [startUnix]: { diffDays: 1, unix: startUnix } }}
      index={0}
      renderEvent={renderEvent}
      resources={resources}
    />
  );
};
