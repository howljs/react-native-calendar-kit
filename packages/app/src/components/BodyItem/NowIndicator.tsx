import { useNowIndicator, useTheme } from '@calendar-kit/core';
import { type FC, memo, type PropsWithChildren, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

import { useBody, useBodyItem } from '../../context/BodyContext';

interface NowIndicatorProps {
  currentTime: SharedValue<number>;
}

const NowIndicatorInner: FC<PropsWithChildren<NowIndicatorProps>> = ({ currentTime, children }) => {
  const { minuteHeight, start, end, columnWidthAnim } = useBody();
  const nowIndicatorColor = useTheme(
    useCallback((state) => state.nowIndicatorColor || state.colors.primary, [])
  );

  const opacity = useDerivedValue(() => {
    return currentTime.value >= start && currentTime.value <= end ? 1 : 0;
  }, [currentTime, start, end]);

  const top = useDerivedValue(() => {
    return (currentTime.value - start) * minuteHeight.value;
  }, [currentTime, start, minuteHeight]);

  const animView = useAnimatedStyle(() => {
    return {
      width: columnWidthAnim.value,
      top: top.value,
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View pointerEvents="box-none" style={[styles.container, animView]}>
      {children || (
        <View style={styles.lineContainer}>
          <View style={[styles.line, { backgroundColor: nowIndicatorColor }]} />
          <View style={[styles.dot, { backgroundColor: nowIndicatorColor }]} />
        </View>
      )}
    </Animated.View>
  );
};

const NowIndicator: FC<PropsWithChildren> = ({ children }) => {
  const { item } = useBodyItem();
  const { showNowIndicator } = useBody();
  const { currentDateUnix, currentTime } = useNowIndicator();

  const isShowNowIndicator = showNowIndicator && item === currentDateUnix;
  if (!isShowNowIndicator) {
    return null;
  }

  return <NowIndicatorInner currentTime={currentTime}>{children}</NowIndicatorInner>;
};

export default memo(NowIndicator);

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
