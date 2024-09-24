import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useLoading } from '../../context/LoadingContext';
import { useTheme } from '../../context/ThemeProvider';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DURATION = 2000;
const BAR_HEIGHT = 3;
interface ProgressBarProps {}

const ProgressBarInner = ({}: ProgressBarProps) => {
  const barColor = useTheme((state) => state.colors.primary);
  const sv = useSharedValue(0);

  useEffect(() => {
    sv.value = withRepeat(withTiming(1, { duration: DURATION }), -1);
  }, [sv]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      sv.value,
      [0, 1],
      [-DEVICE_WIDTH, DEVICE_WIDTH]
    );
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.progressBar, { height: BAR_HEIGHT }]}>
      <View
        style={[
          styles.bgLoading,
          { backgroundColor: barColor, height: BAR_HEIGHT },
        ]}
      />
      <Animated.View style={animatedStyle}>
        <View
          style={[
            styles.loadingBar,
            { backgroundColor: barColor, height: BAR_HEIGHT },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const ProgressBar = (props: ProgressBarProps) => {
  const isLoading = useLoading();
  if (!isLoading) {
    return null;
  }

  return <ProgressBarInner {...props} />;
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
