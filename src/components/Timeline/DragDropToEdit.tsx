import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { DEFAULT_PROPS } from '../../constants';
import { useTimelineCalendarContext } from '../../context/TimelineProvider';
import type { PackedEvent, ThemeProperties } from '../../types';

interface DragDropToEdit {
  eventItem: PackedEvent;
  translationX: SharedValue<number>;
  translationY: SharedValue<number>;
  renderEventContent?: (
    event: PackedEvent,
    timeIntervalHeight: SharedValue<number>
  ) => JSX.Element;
}

const DragDropToEdit = ({
  eventItem,
  translationX,
  translationY,
  renderEventContent,
}: DragDropToEdit) => {
  const {
    hourWidth,
    columnWidth,
    rightEdgeSpacing,
    timeIntervalHeight,
    theme,
    hourFormat,
    offsetY,
    spaceFromTop,
  } = useTimelineCalendarContext();
  const leftWithHourColumn = eventItem.leftByIndex! + hourWidth;
  const eventWidth = useSharedValue(eventItem.width);
  const initLeft = useSharedValue(eventItem?.left);

  useEffect(() => {
    requestAnimationFrame(() => {
      eventWidth.value = withTiming(columnWidth - rightEdgeSpacing, {
        duration: 100,
      });
      initLeft.value = withTiming(0, { duration: 100 });
    });
  }, [columnWidth, initLeft, eventWidth, leftWithHourColumn, rightEdgeSpacing]);

  const animView = useAnimatedStyle(() => {
    return {
      width: eventWidth.value,
      left: translationX.value + initLeft.value,
      top: translationY.value,
    };
  });

  const _renderEventContent = () => {
    return (
      <Text style={[styles.title, theme.eventTitle]}>{eventItem.title}</Text>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: eventItem.color || '#FFFFFF',
            height: eventItem.height,
          },
          eventItem.containerStyle,
          animView,
        ]}
      >
        {renderEventContent
          ? renderEventContent(eventItem, timeIntervalHeight)
          : _renderEventContent()}
      </Animated.View>
      <AnimatedHour
        translationY={translationY}
        hourWidth={hourWidth}
        theme={theme}
        hourFormat={hourFormat}
        timeIntervalHeight={timeIntervalHeight}
        offsetY={offsetY}
        spaceFromTop={spaceFromTop}
      />
    </View>
  );
};

export default DragDropToEdit;

interface AnimatedHourProps {
  translationY: Animated.SharedValue<number>;
  timeIntervalHeight: Animated.SharedValue<number>;
  hourWidth: number;
  theme: ThemeProperties;
  hourFormat?: string;
  offsetY: Animated.SharedValue<number>;
  spaceFromTop: number;
}

const AnimatedHour = ({
  translationY,
  timeIntervalHeight,
  hourWidth,
  theme,
  hourFormat,
  offsetY,
  spaceFromTop,
}: AnimatedHourProps) => {
  const [time, setTime] = useState('');

  const _onChangedTime = (
    hourStr: string | number,
    minutesStr: string | number
  ) => {
    let newTime = `${hourStr}:${minutesStr}`;
    if (hourFormat) {
      newTime = dayjs(
        `1970/1/1 ${hourStr}:${minutesStr}`,
        'YYYY/M/D HH:mm'
      ).format(hourFormat);
    }
    setTime(newTime);
  };

  useAnimatedReaction(
    () => translationY.value,
    (translate) => {
      const hour =
        (translate + offsetY.value - spaceFromTop) / timeIntervalHeight.value;
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
    return { top: translationY.value - 6 };
  });

  return (
    <Animated.View
      style={[
        styles.hourContainer,
        {
          width: hourWidth - 8,
        },
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
  container: {
    position: 'absolute',
    borderRadius: 4,
    overflow: 'hidden',
  },
  title: { paddingVertical: 4, paddingHorizontal: 2, fontSize: 10 },
  hourContainer: {
    position: 'absolute',
    borderColor: DEFAULT_PROPS.PRIMARY_COLOR,
    backgroundColor: DEFAULT_PROPS.WHITE_COLOR,
    borderWidth: 1,
    borderRadius: 4,
    top: -6,
    alignItems: 'center',
    left: 4,
  },
  hourText: {
    color: DEFAULT_PROPS.PRIMARY_COLOR,
    fontSize: 10,
  },
});
