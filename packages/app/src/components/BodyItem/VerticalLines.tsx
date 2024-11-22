import { useTheme } from '@calendar-kit/core';
import { memo, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { useBody } from '../../context/BodyContext';

const VerticalLines = ({ columns }: { columns: number }) => {
  const { columnWidthAnim } = useBody();
  const borderColor = useTheme(useCallback((state) => state.colors.border, []));

  const verticalLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < columns; i++) {
      lines.push(i);
    }
    return lines;
  }, [columns]);

  const _renderVerticalLine = (index: number) => {
    return (
      <VerticalLine
        key={index}
        borderColor={borderColor}
        index={index}
        columnWidth={columnWidthAnim}
      />
    );
  };

  return verticalLines.map(_renderVerticalLine);
};

interface VerticalLineProps {
  borderColor: string;
  index: number;
  columnWidth: SharedValue<number>;
}

const VerticalLine = ({ index, borderColor, columnWidth }: VerticalLineProps) => {
  const animStyle = useAnimatedStyle(
    () => ({
      left: index * columnWidth.value,
    }),
    [columnWidth, index]
  );

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.verticalLine, { backgroundColor: borderColor }, animStyle]}
    />
  );
};

export default memo(VerticalLines);

const styles = StyleSheet.create({
  verticalLine: {
    position: 'absolute',
    width: 1,
    backgroundColor: 'grey',
    height: '100%',
  },
});
