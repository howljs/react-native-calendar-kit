import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { HOUR_SHORT_LINE_WIDTH } from '../constants';
import { useBody } from '../context/BodyContext';
import { useDragEvent } from '../context/DragEventProvider';
import { useLocale } from '../context/LocaleProvider';
import { useTheme } from '../context/ThemeProvider';
import { ThemeConfigs } from '../types';
import { toHourStr } from '../utils/dateUtils';
import Text from './Text';

const selectTheme = (state: ThemeConfigs) => ({
  hourTextColor: state.colors.onBackground,
  hourTextStyle: state.hourTextStyle,
  draggingTextColor: state.colors.primary,
});

const DraggingHourInner = () => {
  const { hourTextColor, hourTextStyle, draggingTextColor } =
    useTheme(selectTheme);
  const fontSize = hourTextStyle?.fontSize ?? 10;
  const style = StyleSheet.flatten([
    styles.hourText,
    { color: hourTextColor },
    hourTextStyle,
  ]);
  const { minuteHeight, hourFormat, start, hourWidth, numberOfDays } =
    useBody();
  const locale = useLocale();
  const { roundedDragStartMinutes, roundedDragDuration } = useDragEvent();

  const [hourStr, setHourStr] = useState('');
  const [endHourStr, setEndHourStr] = useState('');

  const _onStartChanged = (value: number) => {
    if (value === -1) {
      setHourStr('');
    } else {
      setHourStr(toHourStr(value, hourFormat, locale.meridiem));
    }
  };

  useAnimatedReaction(
    () => roundedDragStartMinutes.value,
    (value, prev) => {
      if (prev !== value) {
        runOnJS(_onStartChanged)(value);
      }
    }
  );

  const _onEndChanged = (value: number) => {
    if (value === -1) {
      setEndHourStr('');
    } else {
      setEndHourStr(toHourStr(value, hourFormat, locale.meridiem));
    }
  };

  useAnimatedReaction(
    () => roundedDragStartMinutes.value + roundedDragDuration.value,
    (value, prev) => {
      if (prev !== value) {
        runOnJS(_onEndChanged)(value);
      }
    }
  );

  const animStyle = useAnimatedStyle(() => ({
    top:
      (roundedDragStartMinutes.value - start) * minuteHeight.value -
      fontSize / 2,
    height: roundedDragDuration.value * minuteHeight.value + fontSize + 3,
  }));

  const lineWidth = numberOfDays > 1 ? 0 : 1;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.absolute,
        { width: hourWidth - HOUR_SHORT_LINE_WIDTH - 8 - lineWidth },
        animStyle,
      ]}
    >
      <Text style={[style, { color: draggingTextColor }]}>{hourStr}</Text>
      <Text style={[style, styles.hourTextEnd, { color: draggingTextColor }]}>
        {endHourStr}
      </Text>
    </Animated.View>
  );
};

const DraggingHour = () => {
  const { isDragging } = useDragEvent();
  if (!isDragging) {
    return null;
  }

  return <DraggingHourInner />;
};

export default DraggingHour;

const styles = StyleSheet.create({
  absolute: { position: 'absolute' },
  hourText: { fontSize: 10, textAlign: 'right' },
  hourTextEnd: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
