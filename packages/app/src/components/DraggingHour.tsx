import type { FC } from 'react';
import React, { useMemo, useState } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, { runOnJS, useAnimatedReaction, useAnimatedStyle } from 'react-native-reanimated';

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
  const {
    hourTextColor,
    hourTextStyle,
    draggingTextColor,
    draggingHourTextStyle,
    draggingHourContainerStyle,
  } = useTheme(selectTheme);
  const fontSize = draggingHourTextStyle?.fontSize ?? hourTextStyle?.fontSize ?? 10;
  const style = StyleSheet.flatten([
    styles.hourText,
    { color: hourTextColor, top: -fontSize / 2 },
    hourTextStyle,
    draggingHourTextStyle,
  ]);
  const { minuteHeight, start, hourWidth, numberOfDays } = useBody();
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
    opacity: roundedDragStartMinutes.value !== -1 ? 1 : 0,
  }));

  const endAnimStyle = useAnimatedStyle(() => ({
    top: (roundedDragStartMinutes.value + roundedDragDuration.value - start) * minuteHeight.value,
    opacity: roundedDragStartMinutes.value !== -1 ? 1 : 0,
  }));

  const lineWidth = numberOfDays > 1 ? 0 : 1;

  const startHourStr = useMemo(() => {
    const isWholeHour = hideWholeHour ? startMinutes % 60 === 0 : false;
    return startMinutes !== -1 && !isWholeHour
      ? toHourStr(startMinutes, draggingHourFormat, locale.meridiem)
      : '';
  }, [startMinutes, hideWholeHour, draggingHourFormat, locale.meridiem]);

  const endHourStr = useMemo(() => {
    const isWholeHour = hideWholeHour ? endMinutes % 60 === 0 : false;
    return endMinutes !== -1 && !isWholeHour
      ? toHourStr(endMinutes, draggingHourFormat, locale.meridiem)
      : '';
  }, [endMinutes, hideWholeHour, draggingHourFormat, locale.meridiem]);

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
        {renderHour ? (
          renderHour({
            hourStr: startHourStr,
            minutes: startMinutes,
            style,
          })
        ) : (
          <Text style={[style, { color: draggingTextColor }]}>{startHourStr}</Text>
        )}
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
        {renderHour ? (
          renderHour({
            hourStr: endHourStr,
            minutes: endMinutes,
            style,
          })
        ) : (
          <Text style={[style, { color: draggingTextColor }]}>{endHourStr}</Text>
        )}
      </Animated.View>
    </>
  );
};

const DraggingHour: FC<DraggingHourProps> = (props) => {
  const { isDragging } = useDragEvent();
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
