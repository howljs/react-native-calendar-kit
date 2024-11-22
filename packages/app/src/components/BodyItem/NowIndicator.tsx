import { useNowIndicator, useTheme } from '@calendar-kit/core';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

import { useBody } from '../../context/BodyContext';
import { useBodyColumn } from './BodyItemContext';

interface NowIndicatorProps {
  currentTime: SharedValue<number>;
}

const NowIndicatorInner = ({ currentTime }: NowIndicatorProps) => {
  const { minuteHeight, start, end, startOffset, columnWidthAnim, NowIndicatorComponent } =
    useBody();
  const nowIndicatorColor = useTheme(
    useCallback((state) => state.nowIndicatorColor || state.colors.primary, [])
  );

  const opacity = useDerivedValue(() => {
    return currentTime.value >= start && currentTime.value <= end ? 1 : 0;
  }, [currentTime, start, end]);

  const animView = useAnimatedStyle(() => {
    return {
      width: columnWidthAnim.value,
      top: currentTime.value * minuteHeight.value - startOffset.value,
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View pointerEvents="box-none" style={[styles.container, animView]}>
      {NowIndicatorComponent || (
        <View style={styles.lineContainer}>
          <View style={[styles.line, { backgroundColor: nowIndicatorColor }]} />
          <View style={[styles.dot, { backgroundColor: nowIndicatorColor }]} />
        </View>
      )}
    </Animated.View>
  );
};

const NowIndicator = () => {
  const { item } = useBodyColumn();
  const { showNowIndicator } = useBody();
  const { currentDateUnix, currentTime } = useNowIndicator();

  const isShowNowIndicator = showNowIndicator && item === currentDateUnix;
  if (!isShowNowIndicator) {
    return null;
  }

  return <NowIndicatorInner currentTime={currentTime} />;
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
