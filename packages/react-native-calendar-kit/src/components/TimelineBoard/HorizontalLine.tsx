import React from 'react';
import { StyleSheet } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

interface HorizontalLineProps {
  borderColor: string;
  index: number;
  height: SharedValue<number>;
  renderCustomHorizontalLine?: (props: {
    index: number;
    borderColor: string;
  }) => React.ReactNode;
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
export default HorizontalLine;

const styles = StyleSheet.create({
  horizontalLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
  },
});
