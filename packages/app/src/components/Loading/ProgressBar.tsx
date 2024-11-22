import { useLoading, useTheme } from '@calendar-kit/core';
import { useCallback, useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DURATION = 1000;
const BAR_HEIGHT = 2;

const ProgressBarInner = () => {
  const barStyles = useTheme(
    useCallback(
      (state) => ({
        color: state.progressBarStyle?.color ?? state.colors.primary,
        height: state.progressBarStyle?.height ?? BAR_HEIGHT,
      }),
      []
    )
  );
  const sv = useSharedValue(0);

  useEffect(() => {
    sv.value = withRepeat(withTiming(1, { duration: DURATION }), -1);
  }, [sv]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(sv.value, [0, 1], [-DEVICE_WIDTH, DEVICE_WIDTH]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.progressBar, { height: barStyles.height }]}>
      <View
        style={[styles.bgLoading, { backgroundColor: barStyles.color, height: barStyles.height }]}
      />
      <Animated.View style={animatedStyle}>
        <View
          style={[
            styles.loadingBar,
            { backgroundColor: barStyles.color, height: barStyles.height },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const ProgressBar = () => {
  const isLoading = useLoading();
  if (!isLoading) {
    return null;
  }

  return <ProgressBarInner />;
};

export default ProgressBar;

const styles = StyleSheet.create({
  progressBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  bgLoading: { position: 'absolute', width: '100%', opacity: 0.3 },
  loadingBar: { width: '100%' },
});
