import { useTheme } from '@calendar-kit/core';
import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { useBody } from '../../context/BodyContext';

const HorizontalLines = () => {
  const { totalSlots, renderCustomHorizontalLine, timeIntervalHeight } = useBody();
  const borderColor = useTheme(useCallback((state) => state.colors.border, []));

  const horizontalLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < totalSlots; i++) {
      lines.push(i);
      lines.push(i + 0.5);
    }
    return lines;
  }, [totalSlots]);

  const _renderHorizontalLine = (index: number) => {
    return (
      <HorizontalLine
        key={index}
        borderColor={borderColor}
        index={index}
        height={timeIntervalHeight}
        renderCustomHorizontalLine={renderCustomHorizontalLine}
      />
    );
  };
  return horizontalLines.map(_renderHorizontalLine);
};

export default memo(HorizontalLines);

interface HorizontalLineProps {
  borderColor: string;
  index: number;
  height: SharedValue<number>;
  renderCustomHorizontalLine?: (props: { index: number; borderColor: string }) => React.ReactNode;
}

const HorizontalLine = ({
  index,
  borderColor,
  height,
  renderCustomHorizontalLine,
}: HorizontalLineProps) => {
  const animStyle = useAnimatedStyle(() => ({
    top: index * height.value,
  }));

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.horizontalLine,
        !renderCustomHorizontalLine ? { backgroundColor: borderColor } : {},
        animStyle,
      ]}>
      {renderCustomHorizontalLine?.({ index, borderColor })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  horizontalLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
  },
});
