import { toHourStr, useDragContext, useLocale, useTheme } from '@calendar-kit/core';
import type { FC } from 'react';
import React, { memo, useMemo, useState } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import { HOUR_SHORT_LINE_WIDTH } from '../constants';
import { useBody } from '../context/BodyContext';
import type { RenderHourProps, ThemeConfigs } from '../types';
import Text from './Text';

const selectTheme = (state: ThemeConfigs) => ({
  hourTextColor: state.colors.onBackground,
  hourTextStyle: state.hourTextStyle,
  draggingTextColor: state.colors.primary,
  draggingHourTextStyle: state.draggingHourTextStyle,
  draggingHourContainerStyle: state.draggingHourContainerStyle,
});

interface DraggingHourProps {
  renderHour?: (props: RenderHourProps) => React.ReactNode;
  draggingHourFormat: string;
  hideWholeHour?: boolean;
  containerStyle?: ViewStyle;
}

const DraggingHourInner: FC<DraggingHourProps> = ({
  renderHour,
  draggingHourFormat,
  hideWholeHour,
  containerStyle,
}) => {
  const { draggingHourContainerStyle } = useTheme(selectTheme);
  const { minuteHeight, start, hourWidth, numberOfDays } = useBody();
  const { roundedDragDuration, roundedDragStartMinutes } = useDragContext();

  const top = useDerivedValue(() => {
    return roundedDragStartMinutes.value >= 0
      ? (roundedDragStartMinutes.value - start) * minuteHeight.value
      : -1;
  }, [minuteHeight, roundedDragStartMinutes, start]);

  const startAnimStyle = useAnimatedStyle(() => ({
    top: top.value,
    opacity: top.value >= 0 ? 1 : 0,
  }));

  const endTop = useDerivedValue(() => {
    const endTime = roundedDragStartMinutes.value + roundedDragDuration.value;
    return endTime >= 0 ? (endTime - start) * minuteHeight.value : -1;
  }, [minuteHeight, roundedDragDuration, roundedDragStartMinutes, start]);

  const endAnimStyle = useAnimatedStyle(() => ({
    top: endTop.value,
    opacity: endTop.value >= 0 ? 1 : 0,
  }));

  const lineWidth = numberOfDays > 1 ? 0 : 1;

  return (
    <>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.absolute,
          { width: hourWidth - HOUR_SHORT_LINE_WIDTH - 8 - lineWidth },
          draggingHourContainerStyle as any,
          containerStyle as any,
          startAnimStyle,
        ]}>
        <HourText
          start={roundedDragStartMinutes}
          hideWholeHour={hideWholeHour}
          draggingHourFormat={draggingHourFormat}
          renderHour={renderHour}
        />
      </Animated.View>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.absolute,
          { width: hourWidth - HOUR_SHORT_LINE_WIDTH - 8 - lineWidth },
          draggingHourContainerStyle as any,
          containerStyle as any,
          endAnimStyle,
        ]}>
        <HourText
          start={roundedDragStartMinutes}
          duration={roundedDragDuration}
          hideWholeHour={hideWholeHour}
          draggingHourFormat={draggingHourFormat}
          renderHour={renderHour}
        />
      </Animated.View>
    </>
  );
};

const HourText: FC<{
  start: SharedValue<number>;
  duration?: SharedValue<number>;
  hideWholeHour?: boolean;
  draggingHourFormat: string;
  renderHour?: (props: RenderHourProps) => React.ReactNode;
}> = memo(({ start, duration, hideWholeHour, draggingHourFormat, renderHour }) => {
  const { hourTextColor, hourTextStyle, draggingTextColor, draggingHourTextStyle } =
    useTheme(selectTheme);

  const fontSize = draggingHourTextStyle?.fontSize ?? hourTextStyle?.fontSize ?? 10;
  const style = StyleSheet.flatten([
    styles.hourText,
    { color: hourTextColor, top: -fontSize / 2 },
    hourTextStyle,
    draggingHourTextStyle,
  ]);

  const locale = useLocale();
  const [minutes, setMinutes] = useState(-1);

  const hourStr = useMemo(() => {
    const isWholeHour = hideWholeHour ? minutes % 60 === 0 : false;
    return minutes !== -1 && !isWholeHour
      ? toHourStr(minutes, draggingHourFormat, locale.meridiem)
      : '';
  }, [minutes, hideWholeHour, draggingHourFormat, locale.meridiem]);

  useAnimatedReaction(
    () => (duration ? start.value + duration.value : start.value),
    (value, prev) => {
      if (value >= 0 && prev !== value) {
        runOnJS(setMinutes)(value);
      }
    }
  );
  if (renderHour) {
    return renderHour({
      hourStr,
      minutes,
      style,
    });
  }

  return <Text style={[style, { color: draggingTextColor }]}>{hourStr}</Text>;
});

HourText.displayName = 'HourText';

const DraggingHour: FC<DraggingHourProps> = (props) => {
  const { isDragging } = useDragContext();
  if (!isDragging) {
    return null;
  }

  return <DraggingHourInner {...props} />;
};

export default DraggingHour;

const styles = StyleSheet.create({
  absolute: { position: 'absolute' },
  hourText: {
    fontSize: 10,
    textAlign: 'right',
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
