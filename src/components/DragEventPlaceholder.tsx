import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useBody } from '../context/BodyContext';
import { useDragEvent } from '../context/DragEventProvider';
import { useTheme } from '../context/ThemeProvider';
import { clampValues, findNearestNumber } from '../utils/utils';
import DragDot from './DragDot';

const DragEventPlaceholderInner = () => {
  const { primaryColor } = useTheme(
    useCallback((state) => {
      return { primaryColor: state.colors.primary };
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
  } = useBody();
  const { dragDuration, dragStartMinutes, draggingEvent, dragStartUnix } =
    useDragEvent();

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

  const internalDayIndex = useSharedValue(getDayIndex(dragStartUnix.value));

  useAnimatedReaction(
    () => dragStartUnix.value,
    (dayUnix) => {
      if (dayUnix !== -1) {
        const dayIndex = getDayIndex(dayUnix);
        internalDayIndex.value = withTiming(dayIndex, { duration: 100 });
      }
    },
    []
  );

  const animView = useAnimatedStyle(() => {
    return {
      top: (dragStartMinutes.value - start) * minuteHeight.value,
      height: dragDuration.value * minuteHeight.value,
      width: columnWidthAnim.value,
      left: hourWidth + columnWidthAnim.value * internalDayIndex.value,
    };
  });

  return (
    <Animated.View style={[styles.container, animView]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.event,
          {
            borderColor: primaryColor,
            backgroundColor: draggingEvent?.color ?? 'transparent',
          },
        ]}
      >
        {!!draggingEvent?.title && <Text>{draggingEvent.title}</Text>}
      </View>
      <DragDot type="top" />
      <DragDot type="bottom" />
    </Animated.View>
  );
};

const DragEventPlaceholder = () => {
  const { isDragging } = useDragEvent();
  if (!isDragging) {
    return null;
  }

  return <DragEventPlaceholderInner />;
};

export default DragEventPlaceholder;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 4,
  },
  event: {
    borderWidth: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
