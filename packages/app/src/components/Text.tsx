import { useTheme } from '@calendar-kit/core';
import { useCallback } from 'react';
import type { TextProps } from 'react-native';
import { StyleSheet, Text as DefaultText } from 'react-native';

const Text = ({ style, allowFontScaling = false, ...props }: TextProps) => {
  const textColor = useTheme(useCallback((state) => state.colors.text, []));
  const defaultTextStyle = useTheme(useCallback((state) => state.textStyle, []));

  return (
    <DefaultText
      {...props}
      allowFontScaling={allowFontScaling}
      style={StyleSheet.flatten([{ color: textColor }, defaultTextStyle, style])}
    />
  );
};

export default Text;
