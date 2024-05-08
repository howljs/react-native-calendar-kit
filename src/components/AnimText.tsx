import React, { FC, useState } from 'react';
import { StyleSheet, TextProps } from 'react-native';
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeProvider';

interface AnimTextProps extends Omit<TextProps, 'children'> {
  text: SharedValue<string | number>;
}

const AnimText: FC<AnimTextProps> = ({
  text,
  style,
  allowFontScaling = false,
  ...props
}) => {
  const textColor = useTheme((state) => state.colors.text);
  const defaultTextStyle = useTheme((state) => state.textStyle);
  const [value, setValue] = useState<string | number>('');

  useAnimatedReaction(
    () => text.value,
    (newValue, prevValue) => {
      if (newValue !== prevValue) {
        runOnJS(setValue)(newValue);
      }
    }
  );

  return (
    <Animated.Text
      {...props}
      allowFontScaling={allowFontScaling}
      style={StyleSheet.flatten([
        { color: textColor },
        defaultTextStyle,
        style,
      ])}
    >
      {value}
    </Animated.Text>
  );
};

export default AnimText;
