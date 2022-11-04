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
}

const UPDATE_TIME = 60000;

const getCurrentMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const NowIndicator = ({
  width,
  dayIndex,
  timeIntervalHeight,
}: NowIndicatorProps) => {
  const initialMinutes = useRef(getCurrentMinutes());
  const translateY = useSharedValue(0);
  const intervalCallbackId = useRef<any>(null);

  const updateLinePosition = useCallback(() => {
    const newMinutes = getCurrentMinutes();
    const subtractInitialMinutes = newMinutes - initialMinutes.current;
    const newY = (subtractInitialMinutes / 60) * timeIntervalHeight.value;
    translateY.value = withTiming(newY, {
      duration: 500,
    });
  }, [timeIntervalHeight.value, translateY]);

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
      <View style={[styles.line, { width }]} />
      <View style={styles.dot} />
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
