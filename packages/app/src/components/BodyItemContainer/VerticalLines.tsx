import { useTheme } from '@calendar-kit/core';
import { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { useBody } from '../../context/BodyContext';

const VerticalLines = ({ columns }: { columns: number }) => {
  const { columnWidthAnim, renderCustomVerticalLine } = useBody();
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
        renderCustomVerticalLine={renderCustomVerticalLine}
      />
    );
  };

  return verticalLines.map(_renderVerticalLine);
};

interface VerticalLineProps {
  borderColor: string;
  index: number;
  columnWidth: SharedValue<number>;
  renderCustomVerticalLine?: (props: {
    index: number;
    borderColor: string;
  }) => React.ReactElement | null;
}

const VerticalLine = ({
  index,
  borderColor,
  columnWidth,
  renderCustomVerticalLine,
}: VerticalLineProps) => {
  const animStyle = useAnimatedStyle(
    () => ({
      left: index * columnWidth.value,
    }),
    [columnWidth, index]
  );

  return (
    <Animated.View pointerEvents="box-none" style={[styles.verticalLine, animStyle]}>
      {renderCustomVerticalLine?.({ index, borderColor }) ?? (
        <View style={[styles.line, { backgroundColor: borderColor }]} />
      )}
    </Animated.View>
  );
};

export default memo(VerticalLines);

const styles = StyleSheet.create({
  verticalLine: {
    position: 'absolute',
    height: '100%',
    zIndex: 10,
  },
  line: {
    width: 1,
    height: '100%',
  },
});
