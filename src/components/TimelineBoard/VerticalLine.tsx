import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface VerticalLineProps {
  borderColor: string;
  index: number;
  columnWidth: SharedValue<number>;
}

const VerticalLine = ({
  index,
  borderColor,
  columnWidth,
}: VerticalLineProps) => {
  const animStyle = useAnimatedStyle(() => ({
    left: index * columnWidth.value,
  }));

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
