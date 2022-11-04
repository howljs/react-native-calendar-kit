import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useTimelineCalendarContext } from '../../context/TimelineProvider';

interface DragCreateItemProps {
  offsetX: SharedValue<number>;
  offsetY: SharedValue<number>;
  currentHour: SharedValue<number>;
}

const DragCreateItem = ({
  offsetX,
  offsetY,
  currentHour,
}: DragCreateItemProps) => {
  const {
    columnWidth,
    hourWidth,
    timeIntervalHeight,
    dragCreateInterval,
    theme,
  } = useTimelineCalendarContext();

  const animatedStyles = useAnimatedStyle(() => {
    return {
      height: (dragCreateInterval / 60) * timeIntervalHeight.value,
      transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          styles.defaultStyle,
          {
            left: hourWidth,
            backgroundColor: theme.dragCreateItemBackgroundColor,
            width: columnWidth,
          },
          animatedStyles,
        ]}
      />
      <AnimatedHour
        currentHour={currentHour}
        offsetY={offsetY}
        hourWidth={hourWidth}
        color={theme.dragHourColor}
        backgroundColor={theme.dragHourBackgroundColor}
        borderColor={theme.dragHourBorderColor}
      />
    </View>
  );
};

export default DragCreateItem;

interface AnimatedHourProps {
  currentHour: Animated.SharedValue<number>;
  offsetY: Animated.SharedValue<number>;
  hourWidth: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
}

const AnimatedHour = ({
  currentHour,
  offsetY,
  hourWidth,
  color,
  backgroundColor,
  borderColor,
}: AnimatedHourProps) => {
  const [time, setTime] = useState('');

  useAnimatedReaction(
    () => currentHour.value,
    (hour) => {
      let extra = 0;
      if (hour < 0) {
        extra = 24;
      } else if (hour >= 24) {
        extra = -24;
      }
      const convertedTime = hour + extra;
      const rHours = Math.floor(convertedTime);
      const minutes = (convertedTime - rHours) * 60;
      const rMinutes = Math.round(minutes);
      const offset = rHours < 0 ? 24 : 0;
      const hourStr = rHours + offset < 10 ? '0' + rHours : rHours + offset;
      const minutesStr = rMinutes < 10 ? '0' + rMinutes : rMinutes;
      runOnJS(setTime)(`${hourStr}:${minutesStr}`);
    }
  );

  const animatedTextStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: offsetY.value }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.hourContainer,
        { width: hourWidth - 8, backgroundColor, borderColor },
        animatedTextStyles,
      ]}
    >
      <Text style={[styles.hourText, { color }]}>{time}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    position: 'absolute',
    borderRadius: 4,
    opacity: 0.1,
    top: 0,
    left: 0,
  },
  hourContainer: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 4,
    top: -6,
    alignItems: 'center',
    left: 4,
  },
  hourText: {
    fontSize: 10,
  },
});
