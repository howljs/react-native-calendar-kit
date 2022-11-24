import dayjs from 'dayjs';
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
  tzOffset: number;
}

const UPDATE_TIME = 60000;

const getCurrentMinutes = (tzOffset: number) => {
  const now = dayjs().add(tzOffset, 'm');
  return now.hour() * 60 + now.minute();
};

const NowIndicator = ({
  width,
  dayIndex,
  timeIntervalHeight,
  nowIndicatorColor,
  tzOffset,
}: NowIndicatorProps) => {
  const initialMinutes = useRef(getCurrentMinutes(tzOffset));
  const translateY = useSharedValue(0);
  const intervalCallbackId = useRef<any>(null);

  const updateLinePosition = useCallback(() => {
    const newMinutes = getCurrentMinutes(tzOffset);
    const subtractInitialMinutes = newMinutes - initialMinutes.current;
    const newY = (subtractInitialMinutes / 60) * timeIntervalHeight.value;
    translateY.value = withTiming(newY, {
      duration: 500,
    });
  }, [timeIntervalHeight.value, tzOffset, translateY]);

  useEffect(() => {
    updateLinePosition();
  }, [updateLinePosition]);

  useEffect(() => {
    if (intervalCallbackId.current) {
      clearInterval(intervalCallbackId.current);
    }
    intervalCallbackId.current = setInterval(updateLinePosition, UPDATE_TIME);
    return () => {
      if (intervalCallbackId.current) {
        clearInterval(intervalCallbackId.current);
      }
    };
  }, [updateLinePosition]);

  const animStyle = useAnimatedStyle(() => {
    return {
      top: (initialMinutes.current / 60) * timeIntervalHeight.value,

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
