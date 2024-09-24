import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { useBody } from '../../context/BodyContext';
import { useTheme } from '../../context/ThemeProvider';

const OutOfRangeView = ({
  position,
  diffDays,
}: {
  diffDays: number;
  position: 'left' | 'right';
}) => {
  const {
    columnWidthAnim,
    renderCustomOutOfRange,
    timeIntervalHeight,
    totalSlots,
  } = useBody();
  const disableBackgroundColor = useTheme(
    (state) => state.outOfRangeBackgroundColor || state.colors.surface
  );
  const disableHeight = useDerivedValue(
    () => timeIntervalHeight.value * totalSlots
  );
  const disableWidth = useDerivedValue(() => diffDays * columnWidthAnim.value);

  const disableAnim = useAnimatedStyle(() => {
    return {
      width: disableWidth.value,
      height: disableHeight.value,
    };
  });

  const positionStyle = position === 'left' ? { left: 0 } : { right: 0 };

  return (
    <Animated.View
      style={[
        styles.outOfRange,
        positionStyle,
        { backgroundColor: disableBackgroundColor },
        disableAnim,
      ]}
    >
      {renderCustomOutOfRange &&
        renderCustomOutOfRange({
          width: disableWidth,
          height: disableHeight,
        })}
    </Animated.View>
  );
};

export default OutOfRangeView;

const styles = StyleSheet.create({
  outOfRange: {
    position: 'absolute',
    height: '100%',
  },
});
