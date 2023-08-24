import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { HOUR_LINE_WIDTH } from '../../../constants';
import { useCalendarKit } from '../../../context/CalendarKitProvider';
import { HourItemType } from '../../../types';

interface HourItemProps {
  hour: HourItemType;
  index: number;
}

const HourItem = ({ hour, index }: HourItemProps) => {
  const { theme, isRTL, timeIntervalHeight } = useCalendarKit();
  const animView = useAnimatedStyle(() => ({
    top: timeIntervalHeight.value * index,
  }));

  const hourTextStyles = {
    right: isRTL ? 0 : HOUR_LINE_WIDTH,
    left: isRTL ? HOUR_LINE_WIDTH : 0,
  };

  return (
    <Animated.View style={[styles.hourContainer, animView]}>
      {index !== 0 && (
        <Text style={[styles.hourText, hourTextStyles]}>{hour.text}</Text>
      )}
      <View
        style={[
          styles.hourLine,
          {
            backgroundColor: theme.cellBorderColor,
            width: HOUR_LINE_WIDTH,
          },
          isRTL ? styles.left : styles.right,
        ]}
      />
    </Animated.View>
  );
};

export default HourItem;

const styles = StyleSheet.create({
  hourContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  hourText: {
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    top: -6,
    fontSize: 10,
  },
  hourLine: {
    height: 1,
    position: 'absolute',
  },
  left: { left: 0 },
  right: { right: 0 },
});
