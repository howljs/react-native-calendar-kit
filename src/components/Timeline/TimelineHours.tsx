import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useTimelineCalendarContext } from '../../context/TimelineProvider';

export type HourItem = { text: string; hourNumber: number };

const TimelineHours = () => {
  const { hours, hourWidth, timeIntervalHeight, spaceFromTop, theme } =
    useTimelineCalendarContext();

  const _renderHour = (hour: HourItem, index: number) => {
    return (
      <HourItem
        key={index}
        hour={hour}
        index={index}
        timeIntervalHeight={timeIntervalHeight}
        spaceContent={spaceFromTop}
      />
    );
  };

  return (
    <View
      style={[
        styles.hours,
        {
          width: hourWidth,
          backgroundColor: theme.backgroundColor,
          marginBottom: spaceFromTop,
        },
      ]}
    >
      {hours.map(_renderHour)}
      <View
        style={[
          styles.verticalLine,
          { top: spaceFromTop, backgroundColor: theme.cellBorderColor },
        ]}
      />
    </View>
  );
};

export default memo(TimelineHours);

const HourItem = ({
  hour,
  index,
  timeIntervalHeight,
  spaceContent,
}: {
  hour: HourItem;
  index: number;
  timeIntervalHeight: SharedValue<number>;
  spaceContent: number;
}) => {
  const hourLabelStyle = useAnimatedStyle(() => {
    return { top: timeIntervalHeight.value * index - 6 + spaceContent };
  });

  return (
    <Animated.Text
      key={`hourLabel_${hour.text}`}
      style={[styles.hourText, hourLabelStyle]}
    >
      {hour.text}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  hours: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  hourText: { position: 'absolute', fontSize: 10 },
  verticalLine: {
    width: 1,
    backgroundColor: '#E8E9ED',
    position: 'absolute',
    right: 0,
    height: '100%',
  },
});
