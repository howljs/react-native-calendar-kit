import React, { memo } from 'react';
import { StyleSheet, TextStyle, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { EXTRA_HEIGHT, HOUR_SHORT_LINE_WIDTH } from '../constants';
import { useBody } from '../context/BodyContext';
import { useLocale } from '../context/LocaleProvider';
import { useTheme } from '../context/ThemeProvider';
import { ThemeConfigs } from '../types';
import { toHourStr } from '../utils/dateUtils';
import Text from './Text';

const selectTimeColumnTheme = (state: ThemeConfigs) => ({
  cellBorderColor: state.colors.border,
  hourTextColor: state.colors.onBackground,
  hourTextStyle: state.hourTextStyle,
  hourBackgroundColor: state.hourBackgroundColor || state.colors.background,
});

const TimeColumn = () => {
  const {
    hours,
    hourFormat,
    maxTimelineHeight,
    spaceFromTop,
    spaceFromBottom,
    timelineHeight,
    renderHour,
    hourWidth,
    minuteHeight,
  } = useBody();
  const locale = useLocale();
  const { cellBorderColor, hourTextColor, hourTextStyle, hourBackgroundColor } =
    useTheme(selectTimeColumnTheme);

  const fontSize = hourTextStyle?.fontSize ?? 10;
  const style = StyleSheet.flatten([
    styles.hourText,
    { color: hourTextColor },
    hourTextStyle,
  ]);

  const _renderHour = (minutes: number, customStyle?: TextStyle) => {
    const hourStr = toHourStr(minutes, hourFormat, locale.meridiem);
    let children: React.ReactNode;
    if (renderHour) {
      children = renderHour({ hour: hourStr, minutes, style });
    } else {
      children = <Text style={[style, customStyle]}>{hourStr}</Text>;
    }

    return (
      <View
        style={[
          styles.absolute,
          styles.hour,
          { right: HOUR_SHORT_LINE_WIDTH + 8, top: -fontSize / 2 },
        ]}
      >
        {children}
      </View>
    );
  };

  const _renderHourWrapper = (minutes: number, index: number) => {
    return (
      <HourWrapper
        key={index !== undefined ? minutes : undefined}
        minutes={minutes}
        height={minuteHeight}
        cellBorderColor={cellBorderColor}
        renderHour={_renderHour}
      />
    );
  };

  const animView = useAnimatedStyle(() => ({
    height: timelineHeight.value - spaceFromTop - spaceFromBottom,
  }));

  return (
    <View
      style={[
        styles.container,
        styles.absolute,
        {
          height: maxTimelineHeight + EXTRA_HEIGHT * 2,
          width: hourWidth,
          backgroundColor: hourBackgroundColor,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.absolute,
          {
            width: hourWidth,
            top: EXTRA_HEIGHT + spaceFromTop,
          },
          animView,
        ]}
      >
        {hours.map(_renderHourWrapper)}
      </Animated.View>
      <View style={[styles.rightLine, { backgroundColor: cellBorderColor }]} />
    </View>
  );
};

export default memo(TimeColumn);

interface HourWrapperProps {
  height: SharedValue<number>;
  minutes: number;
  cellBorderColor: string;
  renderHour: (minutes: number) => React.ReactNode;
}

const HourWrapper: React.FC<HourWrapperProps> = ({
  height,
  minutes,
  cellBorderColor,
  renderHour,
}) => {
  const animStyle = useAnimatedStyle(() => ({
    top: minutes * height.value,
    width: '100%',
  }));

  return (
    <Animated.View style={[styles.absolute, animStyle]}>
      {renderHour(minutes)}
      <View
        style={[
          styles.absolute,
          styles.shortLine,
          {
            backgroundColor: cellBorderColor,
            width: HOUR_SHORT_LINE_WIDTH,
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { zIndex: 998 },
  absolute: { position: 'absolute' },
  rightLine: {
    position: 'absolute',
    width: 1,
    right: 0,
    height: '100%',
  },
  hour: { left: 0 },
  shortLine: { height: 1, right: 0 },
  hourText: { fontSize: 10, textAlign: 'right' },
});
