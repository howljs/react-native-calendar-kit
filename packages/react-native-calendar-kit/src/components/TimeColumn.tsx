import type { PropsWithChildren } from 'react';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { EXTRA_HEIGHT, HOUR_SHORT_LINE_WIDTH } from '../constants';
import { useBody } from '../context/BodyContext';
import { useTheme } from '../context/ThemeProvider';
import type { ThemeConfigs } from '../types';
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
    maxTimelineHeight,
    spaceFromTop,
    spaceFromBottom,
    timelineHeight,
    renderHour,
    hourWidth,
    minuteHeight,
    start,
  } = useBody();
  const { cellBorderColor, hourTextColor, hourTextStyle, hourBackgroundColor } =
    useTheme(selectTimeColumnTheme);

  const fontSize = hourTextStyle?.fontSize ?? 10;
  const style = StyleSheet.flatten([
    styles.hourText,
    { top: -fontSize / 2, color: hourTextColor },
    hourTextStyle,
  ]);

  const _renderHour = (hour: { slot: number; time: string }, index: number) => {
    let children: React.ReactNode;
    if (renderHour) {
      children = renderHour({ hourStr: hour.time, minutes: hour.slot, style });
    } else {
      children = <Text style={style}>{hour.time}</Text>;
    }

    return (
      <HourWrapper
        key={index !== undefined ? hour.slot : undefined}
        minutes={hour.slot}
        height={minuteHeight}
        cellBorderColor={cellBorderColor}
        start={start}>
        <View
          style={[
            styles.absolute,
            styles.hour,
            { right: HOUR_SHORT_LINE_WIDTH + 8 },
          ]}>
          {children}
        </View>
      </HourWrapper>
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
      ]}>
      <Animated.View
        style={[
          styles.absolute,
          {
            width: hourWidth,
            top: EXTRA_HEIGHT + spaceFromTop,
          },
          animView,
        ]}>
        {hours.map(_renderHour)}
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
  start: number;
}

const HourWrapper: React.FC<PropsWithChildren<HourWrapperProps>> = ({
  height,
  minutes,
  cellBorderColor,
  children,
  start,
}) => {
  const animStyle = useAnimatedStyle(() => ({
    top: (minutes - start) * height.value,
    width: '100%',
  }));

  return (
    <Animated.View style={[styles.absolute, animStyle]}>
      {children}
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
  hourText: {
    fontSize: 10,
    textAlign: 'right',
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
