import React, { useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeProvider';

interface ExpandButtonProps {
  isExpanded: SharedValue<boolean>;
  isShowExpandButton: SharedValue<boolean>;
  containerStyle?: ViewStyle;
  renderExpandIcon?: (props: {
    isExpanded: SharedValue<boolean>;
  }) => JSX.Element | null;
}

const ExpandButton = ({
  isExpanded,
  isShowExpandButton,
  containerStyle,
  renderExpandIcon,
}: ExpandButtonProps) => {
  const borderColor = useTheme(useCallback(({ colors }) => colors.border, []));

  const animStyle = useAnimatedStyle(() => {
    return {
      display: isShowExpandButton.value ? 'flex' : 'none',
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

  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
  };

  const _renderExpandIcon = () => {
    if (renderExpandIcon) {
      return renderExpandIcon({ isExpanded });
    }

    return (
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
    );
  };

  return (
    <Animated.View style={[styles.btnContainer, containerStyle, animStyle]}>
      <TouchableOpacity hitSlop={8} onPress={toggleExpand} activeOpacity={0.6}>
        {_renderExpandIcon()}
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
