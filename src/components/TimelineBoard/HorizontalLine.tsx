import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface HorizontalLineProps {
  borderColor: string;
  index: number;
  height: SharedValue<number>;
}

const HorizontalLine = ({
  index,
  borderColor,
  height,
}: HorizontalLineProps) => {
  const animStyle = useAnimatedStyle(() => ({
    top: index * height.value,
  }));

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.horizontalLine,
        { backgroundColor: borderColor },
        animStyle,
      ]}
    />
  );
};
export default HorizontalLine;

const styles = StyleSheet.create({
  horizontalLine: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'grey',
    height: 1,
  },
});
