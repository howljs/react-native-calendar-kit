import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, {
  runOnUI,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { COUNT_CONTAINER_HEIGHT } from '../constants';
import { useDayBar } from '../context/DayBarContext';
import { useTheme } from '../context/ThemeProvider';

interface ExpandButtonProps {
  containerStyle?: ViewStyle;
}

const ExpandButton = ({ containerStyle }: ExpandButtonProps) => {
  const borderColor = useTheme(useCallback(({ colors }) => colors.border, []));
  const { isExpanded, isShowExpandButton } = useDayBar();

  const _toggleExpand = () => {
    runOnUI(() => {
      isExpanded.value = !isExpanded.value;
    })();
  };

  const animStyle = useAnimatedStyle(() => {
    return {
      height: isShowExpandButton.value ? COUNT_CONTAINER_HEIGHT : 0,
      opacity: isShowExpandButton.value ? 1 : 0,
    };
  });

  const iconRotate = useDerivedValue(() => {
    return withTiming(isExpanded.value ? 180 : 0, { duration: 350 });
  });

  const expandIcon = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${iconRotate.value}deg` }],
    };
  });

  return (
    <Animated.View style={[styles.btnContainer, containerStyle, animStyle]}>
      <TouchableOpacity hitSlop={8} onPress={_toggleExpand} activeOpacity={0.6}>
        <Animated.View style={[styles.expandIcon, expandIcon]}>
          <View
            style={[
              styles.chevron,
              styles.chevronLeft,
              { backgroundColor: borderColor },
            ]}
          />
          <View
            style={[
              styles.chevron,
              styles.chevronRight,
              { backgroundColor: borderColor },
            ]}
          />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ExpandButton;

const styles = StyleSheet.create({
  btnContainer: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  expandIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    position: 'absolute',
    width: 11,
    height: 2,
    borderRadius: 3,
  },
  chevronLeft: {
    left: 1,
    transform: [{ rotate: '40deg' }],
  },
  chevronRight: {
    right: 1,
    transform: [{ rotate: '-40deg' }],
  },
});
