import moment from 'moment-timezone';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface NowIndicatorProps {
  dayIndex: number;
  width: number;
  timeIntervalHeight: SharedValue<number>;
  nowIndicatorColor?: string;
  tzOffset: string;
  start: number;
  updateCurrentDate: () => void;
  nowIndicatorInterval: number;
}

const getCurrentMinutes = (tzOffset: string) => {
  const now = moment.tz(tzOffset);
  const date = now.format('YYYY-MM-DD');
  const minutes = now.hour() * 60 + now.minute();
  return { date, minutes };
};

const NowIndicator = ({
  width,
  dayIndex,
  timeIntervalHeight,
  nowIndicatorColor,
  tzOffset,
  start,
  updateCurrentDate,
  nowIndicatorInterval,
}: NowIndicatorProps) => {
  const initial = useRef(getCurrentMinutes(tzOffset));
  const translateY = useSharedValue(0);
  const intervalCallbackId = useRef<any>(null);

  const prevMinutes = useRef(initial.current.minutes);
  const updateLinePosition = useCallback(() => {
    const { date, minutes } = getCurrentMinutes(tzOffset);
    if (prevMinutes.current === minutes) {
      return;
    }
    if (initial.current.date !== date) {
      updateCurrentDate();
      return;
    }
    prevMinutes.current = minutes;
    const subtractInitialMinutes = minutes - initial.current.minutes;
    const newY = (subtractInitialMinutes / 60) * timeIntervalHeight.value;
    translateY.value = withTiming(newY, {
      duration: 500,
    });
  }, [tzOffset, timeIntervalHeight.value, translateY, updateCurrentDate]);

  useEffect(() => {
    updateLinePosition();
    if (intervalCallbackId.current) {
      clearInterval(intervalCallbackId.current);
    }
    intervalCallbackId.current = setInterval(
      updateLinePosition,
      nowIndicatorInterval
    );
    return () => {
      if (intervalCallbackId.current) {
        clearInterval(intervalCallbackId.current);
      }
    };
  }, [nowIndicatorInterval, updateLinePosition]);

  const animStyle = useAnimatedStyle(() => {
    return {
      top: (initial.current.minutes / 60 - start) * timeIntervalHeight.value,
      transform: [{ translateY: translateY.value }],
    };
  }, []);

  return (
    <Animated.View
      style={[styles.container, { left: dayIndex * width }, animStyle]}
    >
      <View
        style={[styles.line, { width, backgroundColor: nowIndicatorColor }]}
      />
      <View style={[styles.dot, { backgroundColor: nowIndicatorColor }]} />
    </Animated.View>
  );
};

export default memo(NowIndicator);

const styles = StyleSheet.create({
  container: { position: 'absolute', justifyContent: 'center' },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#007aff',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007aff',
    position: 'absolute',
    left: -4,
  },
});
