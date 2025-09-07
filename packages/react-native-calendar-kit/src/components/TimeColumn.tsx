import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { EXTRA_HEIGHT, HOUR_SHORT_LINE_WIDTH } from '../constants';
import { useBody } from '../context/BodyContext';
import { useTheme } from '../context/ThemeProvider';
import type { ThemeConfigs } from '../types';
import Text from './Text';

const selectTimeColumnTheme = (state: ThemeConfigs) => ({
  cellBorderColor: state.hourBorderColor ?? state.colors.border,
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
    showTimeColumnRightLine,
  } = useBody();
  const { cellBorderColor, hourTextColor, hourTextStyle, hourBackgroundColor } =
    useTheme(selectTimeColumnTheme);

  const fontSize = hourTextStyle?.fontSize ?? 10;
  const style = useMemo(
    () =>
      StyleSheet.flatten([
        styles.hourText,
        { top: -fontSize / 2, color: hourTextColor },
        hourTextStyle,
      ]),
    [fontSize, hourTextColor, hourTextStyle]
  );
  const totalSlots = hours.length;

  const _renderHour = useCallback(
    (hour: { slot: number; time: string }, index: number) => {
      let children: React.ReactNode;
      if (renderHour) {
        children = renderHour({
          hourStr: hour.time,
          minutes: hour.slot,
          style,
        });
      } else {
        children = <Text style={style}>{hour.time}</Text>;
      }

      return (
        <View
          key={hour.slot}
          style={[
            styles.absolute,
            { top: `${(index / totalSlots) * 100}%`, width: '100%' },
          ]}>
          <View
            style={[
              styles.absolute,
              styles.hour,
              { right: HOUR_SHORT_LINE_WIDTH + 8 },
            ]}>
            {children}
          </View>
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
        </View>
      );
    },
    [cellBorderColor, renderHour, style, totalSlots]
  );

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
          { width: hourWidth, top: EXTRA_HEIGHT + spaceFromTop },
          animView,
        ]}>
        {hours.map(_renderHour)}
      </Animated.View>
      {showTimeColumnRightLine && (
        <View
          style={[styles.rightLine, { backgroundColor: cellBorderColor }]}
        />
      )}
    </View>
  );
};

export default memo(TimeColumn);

const styles = StyleSheet.create({
  container: { zIndex: 998, elevation: -1 },
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
