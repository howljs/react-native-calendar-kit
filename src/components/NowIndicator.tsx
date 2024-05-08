import React, { FC, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { MILLISECONDS_IN_DAY } from '../constants';
import { useBody } from '../context/BodyContext';
import { useNowIndicator } from '../context/NowIndicatorProvider';
import { useTheme } from '../context/ThemeProvider';

interface NowIndicatorProps {
  dayIndex: number;
  width: SharedValue<number>;
  currentTime: SharedValue<number>;
}

const NowIndicatorInner = ({
  width,
  dayIndex,
  currentTime,
}: NowIndicatorProps) => {
  const { minuteHeight, start, end, startOffset } = useBody();
  const nowIndicatorColor = useTheme(
    (state) => state.nowIndicatorColor || state.colors.primary
  );
  const animView = useAnimatedStyle(() => {
    const top = currentTime.value * minuteHeight.value - startOffset.value;
    const hour = currentTime.value / 60;
    const opacity = hour >= start && hour <= end ? 1 : 0;

    return {
      width: width.value,
      left: dayIndex * width.value,
      top,
      opacity,
    };
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.container, animView]}
    >
      <View style={[styles.line, { backgroundColor: nowIndicatorColor }]} />
      <View style={[styles.dot, { backgroundColor: nowIndicatorColor }]} />
    </Animated.View>
  );
};

const NowIndicator: FC<{ startUnix: number }> = ({ startUnix }) => {
  const { columns, showNowIndicator, columnWidthAnim } = useBody();
  const { currentDateUnix, currentTime } = useNowIndicator();

  const diffDays = useMemo(
    () => Math.floor((currentDateUnix - startUnix) / MILLISECONDS_IN_DAY),
    [currentDateUnix, startUnix]
  );

  const isShowNowIndicator =
    showNowIndicator && diffDays >= 0 && diffDays < columns;

  if (!isShowNowIndicator) {
    return null;
  }

  return (
    <NowIndicatorInner
      currentTime={currentTime}
      width={columnWidthAnim}
      dayIndex={diffDays}
    />
  );
};

export default React.memo(NowIndicator);

const styles = StyleSheet.create({
  container: { position: 'absolute', justifyContent: 'center' },
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
});
