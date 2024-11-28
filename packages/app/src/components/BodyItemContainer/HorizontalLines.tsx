import { useTheme } from '@calendar-kit/core';
import { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { useBody } from '../../context/BodyContext';

interface HorizontalLinesProps {
  renderCustomHorizontalLine?: (props: {
    index: number;
    borderColor: string;
    isHalf: boolean;
  }) => React.ReactElement | null;
}

const HorizontalLines = ({ renderCustomHorizontalLine }: HorizontalLinesProps) => {
  const { totalSlots, timeIntervalHeight, isShowHalfHourLine } = useBody();
  const borderColor = useTheme(useCallback((state) => state.colors.border, []));

  const horizontalLines = useMemo(() => {
    const lines: { index: number; isHalf: boolean }[] = [];
    for (let i = 0; i < totalSlots; i++) {
      lines.push({ index: i, isHalf: false });
      if (isShowHalfHourLine) {
        lines.push({ index: i + 0.5, isHalf: true });
      }
    }
    return lines;
  }, [totalSlots, isShowHalfHourLine]);

  const _renderHorizontalLine = (line: { index: number; isHalf: boolean }) => {
    return (
      <HorizontalLine
        key={line.index}
        borderColor={borderColor}
        index={line.index}
        isHalf={line.isHalf}
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
  isHalf: boolean;
  renderCustomHorizontalLine?: (props: {
    index: number;
    borderColor: string;
    isHalf: boolean;
  }) => React.ReactElement | null;
}

const HorizontalLine = ({
  index,
  borderColor,
  height,
  renderCustomHorizontalLine,
  isHalf,
}: HorizontalLineProps) => {
  const animStyle = useAnimatedStyle(() => ({
    top: index * height.value,
  }));

  return (
    <Animated.View pointerEvents="box-none" style={[styles.horizontalLine, animStyle]}>
      {renderCustomHorizontalLine?.({ index, borderColor, isHalf }) ?? (
        <View style={[styles.line, { backgroundColor: borderColor }]} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  horizontalLine: {
    position: 'absolute',
    width: '100%',
    zIndex: 20,
  },
  line: { height: 1 },
});
