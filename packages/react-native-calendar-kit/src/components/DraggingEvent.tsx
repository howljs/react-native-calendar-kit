import type { FC } from 'react';
import React, { useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useBody } from '../context/BodyContext';
import { useDragEvent } from '../context/DragEventProvider';
import { useTheme } from '../context/ThemeProvider';
import type { ResourceItem, SelectedEventType } from '../types';
import { clampValues, findNearestNumber } from '../utils/utils';
import DragDot from './DragDot';

export interface DraggingEventProps {
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
  resources?: ResourceItem[];
}

export const DraggingEvent: FC<DraggingEventProps> = ({
  renderEvent,
  TopEdgeComponent,
  BottomEdgeComponent,
  containerStyle,
  resources,
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
    hourWidth,
    visibleDateUnixAnim,
    calendarData,
    columns,
    numberOfDays,
  } = useBody();
  const {
    dragDuration,
    dragStartMinutes,
    dragStartUnix,
    draggingEvent,
    dragX,
  } = useDragEvent();

  const totalResources =
    resources && resources.length > 1 ? resources.length : 1;
  const getDayIndex = (dayUnix: number) => {
    'worklet';
    let currentIndex = calendarData.visibleDatesArray.indexOf(dayUnix);
    if (currentIndex === -1) {
      const nearestVisibleUnix = findNearestNumber(
        calendarData.visibleDatesArray,
        dayUnix
      );
      const nearestVisibleIndex =
        calendarData.visibleDates[nearestVisibleUnix]?.index;
      if (!nearestVisibleIndex) {
        return 0;
      }
      currentIndex = nearestVisibleIndex;
    }
    let startIndex = calendarData.visibleDatesArray.indexOf(
      visibleDateUnixAnim.value
    );
    if (startIndex === -1) {
      const nearestVisibleUnix = findNearestNumber(
        calendarData.visibleDatesArray,
        dayUnix
      );
      const nearestVisibleIndex =
        calendarData.visibleDates[nearestVisibleUnix]?.index;
      if (!nearestVisibleIndex) {
        return 0;
      }
      startIndex = nearestVisibleIndex;
    }
    return clampValues(currentIndex - startIndex, 0, columns - 1);
  };
  const eventWidth = useDerivedValue(
    () => columnWidthAnim.value / totalResources,
    [totalResources]
  );

  const resourceIndex = useDerivedValue(() => {
    if (totalResources === 1) {
      return 0;
    }

    const dragPosition = Math.floor(dragX.value - hourWidth);
    const columnIndex = Math.floor(dragPosition / eventWidth.value);

    return clampValues(columnIndex, 0, totalResources - 1);
  }, [totalResources, hourWidth]);

  const internalDayIndex = useSharedValue(getDayIndex(dragStartUnix.value));

  useAnimatedReaction(
    () => dragStartUnix.value,
    (dayUnix) => {
      if (dayUnix !== -1) {
        const dayIndex = getDayIndex(dayUnix);
        internalDayIndex.value = withTiming(dayIndex, { duration: 100 });
      }
    }
  );

  const eventHeight = useDerivedValue(() => {
    return dragDuration.value * minuteHeight.value;
  });

  const animView = useAnimatedStyle(() => {
    const startX = resourceIndex.value * eventWidth.value;
    return {
      top: (dragStartMinutes.value - start) * minuteHeight.value,
      height: dragDuration.value * minuteHeight.value,
      width: eventWidth.value,
      left: startX + hourWidth + eventWidth.value * internalDayIndex.value - 1,
    };
  }, [totalResources, hourWidth]);

  return (
    <Animated.View style={[styles.container, animView]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          theme.eventContainerStyle,
          styles.event,
          {
            backgroundColor: draggingEvent?.color ?? 'transparent',
            borderColor: theme.primaryColor,
          },
          containerStyle,
        ]}>
        {renderEvent
          ? renderEvent(draggingEvent, {
              width: eventWidth,
              height: eventHeight,
            })
          : !!draggingEvent?.title && (
              <Text style={[styles.eventTitle, theme.eventTitleStyle]}>
                {draggingEvent.title}
              </Text>
            )}
      </View>
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
    </Animated.View>
  );
};

interface DraggingEventWrapperProps {
  renderEvent?: (
    event: SelectedEventType | undefined,
    options: {
      width: SharedValue<number>;
      height: SharedValue<number>;
    }
  ) => React.ReactElement | null;
  renderDraggingEvent?: (props: {
    renderEvent?: (
      event: SelectedEventType | undefined,
      options: {
        width: SharedValue<number>;
        height: SharedValue<number>;
      }
    ) => React.ReactElement | null;
    resources?: ResourceItem[];
  }) => React.ReactElement | null;
  resources?: ResourceItem[];
}

const DraggingEventWrapper = ({
  renderDraggingEvent,
  renderEvent,
  resources,
}: DraggingEventWrapperProps) => {
  const { isDragging } = useDragEvent();
  if (!isDragging) {
    return null;
  }

  if (renderDraggingEvent) {
    return renderDraggingEvent({
      renderEvent,
      resources,
    });
  }

  return <DraggingEvent renderEvent={renderEvent} resources={resources} />;
};

export default DraggingEventWrapper;

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
