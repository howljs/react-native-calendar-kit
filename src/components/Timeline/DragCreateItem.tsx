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
}

const DragCreateItem = ({
  offsetX,
  offsetY,
  currentHour,
}: DragCreateItemProps) => {
  const {
    columnWidth,
    hourWidth,
    heightByTimeInterval,
    dragCreateInterval,
    theme,
    hourFormat,
  } = useTimelineCalendarContext();

  const animatedStyles = useAnimatedStyle(() => {
    return {
      height: (dragCreateInterval / 60) * heightByTimeInterval.value,
      transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
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
  currentHour: Animated.SharedValue<number>;
  offsetY: Animated.SharedValue<number>;
  hourWidth: number;
  theme: ThemeProperties;
  hourFormat?: string;
}

const AnimatedHour = ({
  currentHour,
  offsetY,
  hourWidth,
  theme,
  hourFormat,
}: AnimatedHourProps) => {
  const [time, setTime] = useState('');

  const _onChangedTime = (
    hourStr: string | number,
    minutesStr: string | number
  ) => {
    let newTime = `${hourStr}:${minutesStr}`;
    if (hourFormat) {
      newTime = moment(
        `1970/1/1 ${hourStr}:${minutesStr}`,
        'YYYY/M/D HH:mm'
      ).format(hourFormat);
    }
    setTime(newTime);
  };

  useAnimatedReaction(
    () => currentHour.value,
    (hour) => {
      let extra = 0;
      if (hour < 0) {
        extra = 24;
      } else if (hour >= 24) {
        extra = -24;
      }
      const convertedTime = hour + extra;
      const rHours = Math.floor(convertedTime);
      const minutes = (convertedTime - rHours) * 60;
      const rMinutes = Math.round(minutes);
      const offset = rHours < 0 ? 24 : 0;
      const hourStr = rHours + offset < 10 ? '0' + rHours : rHours + offset;
      const minutesStr = rMinutes < 10 ? '0' + rMinutes : rMinutes;
      runOnJS(_onChangedTime)(hourStr, minutesStr);
    }
  );

  const animatedTextStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: offsetY.value }],
    };
  });

  return (
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
