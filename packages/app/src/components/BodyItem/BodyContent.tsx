import { type FC, memo, type PropsWithChildren } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useAnimatedStyle } from 'react-native-reanimated';

import { EXTRA_HEIGHT } from '../../constants';
import { useBody } from '../../context/BodyContext';

const BodyContent: FC<PropsWithChildren> = ({ children }) => {
  const { timeIntervalHeight, totalSlots, spaceFromTop, hourWidth, numberOfDays } = useBody();

  const contentView = useAnimatedStyle(() => ({
    height: timeIntervalHeight.value * totalSlots,
  }));

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.content,
        {
          left: numberOfDays === 1 ? hourWidth : 0,
          top: EXTRA_HEIGHT + spaceFromTop,
        },
        contentView,
      ]}>
      {children}
    </Animated.View>
  );
};

export default memo(BodyContent);

const styles = StyleSheet.create({
  content: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 11,
  },
});
