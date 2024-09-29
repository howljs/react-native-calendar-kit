import type { FC } from 'react';
import React, { useMemo, useState } from 'react';
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
import type { RenderHourProps, ThemeConfigs } from '../types';
import { toHourStr } from '../utils/dateUtils';
import Text from './Text';

const selectTheme = (state: ThemeConfigs) => ({
  hourTextColor: state.colors.onBackground,
  hourTextStyle: state.hourTextStyle,
  draggingTextColor: state.colors.primary,
});

interface DraggingHourProps {
  renderHour?: (props: RenderHourProps) => React.ReactNode;
}

const DraggingHourInner: FC<DraggingHourProps> = ({ renderHour }) => {
  const { hourTextColor, hourTextStyle, draggingTextColor } =
    useTheme(selectTheme);
  const fontSize = hourTextStyle?.fontSize ?? 10;
  const style = StyleSheet.flatten([
    styles.hourText,
    { color: hourTextColor, top: -fontSize / 2 },
    hourTextStyle,
  ]);
  const { minuteHeight, hourFormat, start, hourWidth, numberOfDays } =
    useBody();
  const locale = useLocale();
  const { roundedDragStartMinutes, roundedDragDuration } = useDragEvent();

  const [startMinutes, setStartMinutes] = useState(-1);
  const [endMinutes, setEndMinutes] = useState(-1);

  useAnimatedReaction(
    () => roundedDragStartMinutes.value,
    (value, prev) => {
      if (prev !== value) {
        runOnJS(setStartMinutes)(value);
      }
    }
  );

  useAnimatedReaction(
    () => roundedDragStartMinutes.value + roundedDragDuration.value,
    (value, prev) => {
      if (prev !== value) {
        runOnJS(setEndMinutes)(value);
      }
    }
  );

  const startAnimStyle = useAnimatedStyle(() => ({
    top: (roundedDragStartMinutes.value - start) * minuteHeight.value,
  }));

  const endAnimStyle = useAnimatedStyle(() => ({
    top:
      (roundedDragStartMinutes.value + roundedDragDuration.value - start) *
      minuteHeight.value,
  }));

  const lineWidth = numberOfDays > 1 ? 0 : 1;

  const startHourStr = useMemo(() => {
    return startMinutes !== -1
      ? toHourStr(startMinutes, hourFormat, locale.meridiem)
      : '';
  }, [startMinutes, hourFormat, locale.meridiem]);

  const endHourStr = useMemo(() => {
    return endMinutes !== -1
      ? toHourStr(endMinutes, hourFormat, locale.meridiem)
      : '';
  }, [endMinutes, hourFormat, locale.meridiem]);

  return (
    <>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.absolute,
          { width: hourWidth - HOUR_SHORT_LINE_WIDTH - 8 - lineWidth },
          startAnimStyle,
        ]}>
        {renderHour ? (
          renderHour({
            hourStr: startHourStr,
            minutes: startMinutes,
            style,
          })
        ) : (
          <Text style={[style, { color: draggingTextColor }]}>
            {startHourStr}
          </Text>
        )}
      </Animated.View>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.absolute,
          { width: hourWidth - HOUR_SHORT_LINE_WIDTH - 8 - lineWidth },
          endAnimStyle,
        ]}>
        {renderHour ? (
          renderHour({
            hourStr: endHourStr,
            minutes: endMinutes,
            style,
          })
        ) : (
          <Text style={[style, { color: draggingTextColor }]}>
            {endHourStr}
          </Text>
        )}
      </Animated.View>
    </>
  );
};

const DraggingHour: FC<DraggingHourProps> = ({ renderHour }) => {
  const { isDragging } = useDragEvent();
  if (!isDragging) {
    return null;
  }

  return <DraggingHourInner renderHour={renderHour} />;
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
