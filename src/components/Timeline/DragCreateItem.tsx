import moment from 'moment-timezone';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { DEFAULT_PROPS } from '../../constants';
import { useTimelineCalendarContext } from '../../context/TimelineProvider';
import type { ThemeProperties } from '../../types';

interface DragCreateItemProps {
  offsetX: SharedValue<number>;
  offsetY: SharedValue<number>;
  currentHour: SharedValue<number>;
  startHour: SharedValue<number>;
  startHourCalculated: SharedValue<number>;
}

const DragCreateItem = ({
  offsetX,
  offsetY,
  currentHour,
  startHour,
  startHourCalculated,
}: DragCreateItemProps) => {
  const {
    columnWidth,
    hourWidth,
    heightByTimeInterval,
    dragCreateInterval,
    dragStep,
    theme,
    hourFormat,
  } = useTimelineCalendarContext();

  const animatedStyles = useAnimatedStyle(() => {
    return {
      height: ( (dragCreateInterval / 60) + (offsetY.value - startHour.value) / 60) * heightByTimeInterval.value,
      transform: [{ translateX: offsetX.value }, { translateY: startHour.value }],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          styles.defaultStyle,
          {
            left: hourWidth,
            backgroundColor: theme.dragCreateItemBackgroundColor,
            width: columnWidth,
          },
          animatedStyles,
        ]}
      />
      <AnimatedHour
        startHour={startHour}
        startHourCalculated={startHourCalculated}
        currentHour={currentHour}
        offsetY={offsetY}
        hourWidth={hourWidth}
        theme={theme}
        hourFormat={hourFormat}
      />
    </View>
  );
};

export default DragCreateItem;

interface AnimatedHourProps {
  startHour: Animated.SharedValue<number>;
  startHourCalculated: SharedValue<number>;
  currentHour: Animated.SharedValue<number>;
  offsetY: Animated.SharedValue<number>;
  hourWidth: number;
  theme: ThemeProperties;
  hourFormat?: string;
}

const AnimatedHour = ({
  startHour,
  startHourCalculated,
  currentHour,
  offsetY,
  hourWidth,
  theme,
  hourFormat,
}: AnimatedHourProps) => {
  const [time, setTime] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const { dragCreateInterval } = useTimelineCalendarContext();

  const _onChangedTime = (
    hourStr: string | number,
    minutesStr: string | number,
    hourStrStart: string | number,
    minutesStrStart: string | number
  ) => {
    let newTime = `${hourStr}:${minutesStr}`;
    if (hourFormat) {
      newTime = moment(
        `1970/1/1 ${hourStr}:${minutesStr}`,
        'YYYY/M/D HH:mm'
      ).format(hourFormat);
    }
    setTime(newTime);

    newTime = `${hourStrStart}:${minutesStrStart}`;
    setTimeStart(newTime);
  };

  useAnimatedReaction(
    () => currentHour.value,
    (hour) => {
      const _displayTime = (convertedTime: number) => {
        const rHours = Math.floor(convertedTime);
        const minutes = (convertedTime - rHours) * 60;
        const rMinutes = Math.round(minutes);
        const offset = rHours < 0 ? 24 : 0;
        const hourStr = rHours + offset < 10 ? '0' + rHours : rHours + offset;
        const minutesStr = rMinutes < 10 ? '0' + rMinutes : rMinutes;
        return { hourStr, minutesStr };
      };

      let extra = 0;
      if (hour < 0) {
        extra = 24;
      } else if (hour >= 24) {
        extra = -24;
      }

      const convertedTime = hour + extra + (dragCreateInterval/60);
      const convertedTimeStart = startHourCalculated.value + extra;
      const { hourStr, minutesStr } = _displayTime(convertedTime);
      const { hourStr: hourStrStart, minutesStr: minutesStrStart } = _displayTime(convertedTimeStart);      
      runOnJS(_onChangedTime)(hourStr, minutesStr, hourStrStart, minutesStrStart);
    }
  );

  const animatedTextStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: offsetY.value + dragCreateInterval}],
    };
  });

  const animatedTextStylesStart = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: startHour.value }],
    };
  });

  return (
    <>
      <Animated.View
        style={[
          styles.hourContainer,
          { width: hourWidth - 8 },
          theme.dragHourContainer,
          animatedTextStylesStart,
        ]}
      >
        <Text
          allowFontScaling={theme.allowFontScaling}
          style={[styles.hourText, theme.dragHourText]}
        >
          {timeStart}
        </Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.hourContainer,
          { width: hourWidth - 8 },
          theme.dragHourContainer,
          animatedTextStyles,
        ]}
      >
        <Text
          allowFontScaling={theme.allowFontScaling}
          style={[styles.hourText, theme.dragHourText]}
        >
          {time}
        </Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    position: 'absolute',
    borderRadius: 4,
    top: 0,
    left: 0,
  },
  hourContainer: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 4,
    top: -6,
    alignItems: 'center',
    left: 4,
    borderColor: DEFAULT_PROPS.PRIMARY_COLOR,
    backgroundColor: DEFAULT_PROPS.WHITE_COLOR,
  },
  hourText: {
    color: DEFAULT_PROPS.PRIMARY_COLOR,
    fontSize: 10,
  },
});
