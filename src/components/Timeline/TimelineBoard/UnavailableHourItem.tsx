import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTimelineCalendarContext } from '../../../context/TimelineProvider';

interface UnavailableHourProps {
  top: number;
  height: number;
}

const UnavailableHourItem = ({ top, height }: UnavailableHourProps) => {
  const { timeIntervalHeight, theme } = useTimelineCalendarContext();
  const unavailableHourStyle = useAnimatedStyle(() => {
    return {
      top: top * timeIntervalHeight.value,
      height: height * timeIntervalHeight.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.unavailableHourItem,
        { backgroundColor: theme.unavailableBackgroundColor },
        unavailableHourStyle,
      ]}
    />
  );
};

export default memo(UnavailableHourItem);

const styles = StyleSheet.create({
  unavailableHourItem: { left: 0, width: '100%', position: 'absolute' },
});
