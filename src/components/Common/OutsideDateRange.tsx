import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface OutsideDateRangeProps {
  diffDays: number;
  left?: number;
  right?: number;
  OutsideDateRangeComponent?: React.ReactElement;
  backgroundColor: string;
  columnWidth: SharedValue<number>;
  isRTL?: boolean;
}

const OutsideDateRange = ({
  diffDays,
  left,
  right,
  OutsideDateRangeComponent,
  columnWidth,
  backgroundColor,
  isRTL,
}: OutsideDateRangeProps) => {
  const animView = useAnimatedStyle(() => ({
    width: diffDays * columnWidth.value,
  }));

  return (
    <Animated.View
      pointerEvents="box-only"
      style={[
        styles.unavailableDay,
        {
          left,
          right,
          backgroundColor: backgroundColor,
        },
        animView,
        isRTL && styles.rtl,
      ]}
    >
      {OutsideDateRangeComponent && OutsideDateRangeComponent}
    </Animated.View>
  );
};

export default React.memo(OutsideDateRange);

const styles = StyleSheet.create({
  unavailableDay: {
    height: '100%',
    position: 'absolute',
    overflow: 'hidden',
  },
  rtl: { alignItems: 'flex-end', transform: [{ scaleX: -1 }] },
});
