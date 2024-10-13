import React from 'react';
import { StyleSheet } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

interface VerticalLineProps {
  borderColor: string;
  index: number;
  columnWidth: SharedValue<number>;
  childColumns: number;
}

const VerticalLine = ({
  index,
  borderColor,
  columnWidth,
  childColumns,
}: VerticalLineProps) => {
  const eventWidth = useDerivedValue(
    () =>
      childColumns > 1 ? columnWidth.value / childColumns : columnWidth.value,
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

export default VerticalLine;

const styles = StyleSheet.create({
  verticalLine: {
    position: 'absolute',
    width: 1,
    backgroundColor: 'grey',
    height: '100%',
  },
});
