import type { FC } from 'react';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { useBody } from '../context/BodyContext';
import { useNowIndicator } from '../context/NowIndicatorProvider';
import { useTheme } from '../context/ThemeProvider';

interface NowIndicatorProps {
  dayIndex: number;
  currentTime: SharedValue<number>;
}

const NowIndicatorInner = ({ dayIndex, currentTime }: NowIndicatorProps) => {
  const {
    minuteHeight,
    start,
    end,
    startOffset,
    columnWidthAnim,
    NowIndicatorComponent,
  } = useBody();
  const nowIndicatorColor = useTheme(
    useCallback((state) => state.nowIndicatorColor || state.colors.primary, [])
  );

  const left = useDerivedValue(() => {
    return dayIndex * columnWidthAnim.value;
  }, [dayIndex]);

  const opacity = useDerivedValue(() => {
    return currentTime.value >= start && currentTime.value <= end ? 1 : 0;
  }, [start, end]);

  const animView = useAnimatedStyle(() => {
    return {
      width: columnWidthAnim.value,
      left: left.value,
      top: currentTime.value * minuteHeight.value - startOffset.value,
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.container, animView]}>
      {NowIndicatorComponent || (
        <View style={styles.lineContainer}>
          <View style={[styles.line, { backgroundColor: nowIndicatorColor }]} />
          <View style={[styles.dot, { backgroundColor: nowIndicatorColor }]} />
        </View>
      )}
    </Animated.View>
  );
};

const NowIndicator: FC<{
  startUnix: number;
  visibleDates: Record<string, { diffDays: number; unix: number }>;
}> = ({ visibleDates }) => {
  const { showNowIndicator } = useBody();
  const { currentDateUnix, currentTime } = useNowIndicator();

  const visibleDate = visibleDates[currentDateUnix];
  const isShowNowIndicator = showNowIndicator && visibleDate;

  if (!isShowNowIndicator) {
    return null;
  }

  return (
    <NowIndicatorInner
      currentTime={currentTime}
      dayIndex={visibleDate.diffDays - 1}
    />
  );
};

export default React.memo(NowIndicator);

const styles = StyleSheet.create({
  container: { position: 'absolute' },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#007aff',
    width: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007aff',
    position: 'absolute',
    left: -4,
  },
  lineContainer: {
    justifyContent: 'center',
  },
});
