import { memo, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import { useBody } from '../../context/BodyContext';
import { useTheme } from '../../context/ThemeProvider';

const VerticalLines = ({ totalResource, columns }: { totalResource: number; columns: number }) => {
  const { columnWidthAnim } = useBody();
  const borderColor = useTheme(useCallback((state) => state.colors.border, []));

  const verticalLines = useMemo(() => {
    const lines = [];
    const cols = totalResource > 1 ? totalResource : columns;
    for (let i = 0; i < cols; i++) {
      lines.push(i);
    }
    return lines;
  }, [totalResource, columns]);

  const _renderVerticalLine = (index: number) => {
    return (
      <VerticalLine
        key={index}
        borderColor={borderColor}
        index={index}
        columnWidth={columnWidthAnim}
        childColumns={totalResource}
      />
    );
  };

  return verticalLines.map(_renderVerticalLine);
};

interface VerticalLineProps {
  borderColor: string;
  index: number;
  columnWidth: SharedValue<number>;
  childColumns: number;
}

const VerticalLine = ({ index, borderColor, columnWidth, childColumns }: VerticalLineProps) => {
  const eventWidth = useDerivedValue(
    () => (childColumns > 1 ? columnWidth.value / childColumns : columnWidth.value),
    [childColumns]
  );
  const animStyle = useAnimatedStyle(
    () => ({
      left: index * eventWidth.value,
    }),
    [index]
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
