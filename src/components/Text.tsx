import React from 'react';
import type { TextProps } from 'react-native';
import { Text as DefaultText, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeProvider';

const Text = ({ style, allowFontScaling = false, ...props }: TextProps) => {
  const textColor = useTheme((state) => state.colors.text);
  const defaultTextStyle = useTheme((state) => state.textStyle);

  return (
    <DefaultText
      {...props}
      allowFontScaling={allowFontScaling}
      style={StyleSheet.flatten([
        { color: textColor },
        defaultTextStyle,
        style,
      ])}
    />
  );
};

export default Text;
