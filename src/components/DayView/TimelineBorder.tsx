import times from 'lodash/times';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useCalendarKit } from '../../context/CalendarKitProvider';

interface TimelineBorderProps {}

const TimelineBorder = ({}: TimelineBorderProps) => {
  const { totalHours, timelineWidth, timeIntervalHeight, theme } =
    useCalendarKit();

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {times(totalHours + 1, (index) => (
        <HorizontalLine
          key={`row_${index}`}
          timelineWidth={timelineWidth}
          index={index}
          timeIntervalHeight={timeIntervalHeight}
          cellBorderColor={theme.cellBorderColor}
        />
      ))}
    </View>
  );
};

export default TimelineBorder;

interface HorizontalLineProps {
  timeIntervalHeight: Readonly<SharedValue<number>>;
  timelineWidth: number;
  index: number;
  cellBorderColor: string;
}

const HorizontalLine = ({
  timeIntervalHeight,
  index,
  timelineWidth,
  cellBorderColor,
}: HorizontalLineProps) => {
  const animView = useAnimatedStyle(() => {
    return {
      top: timeIntervalHeight.value * index,
    };
  });

  return (
    <React.Fragment>
      <Animated.View
        style={[
          styles.horizontalLine,
          { width: timelineWidth, backgroundColor: cellBorderColor },
          animView,
        ]}
      />
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  horizontalLine: {
    height: 1,
    backgroundColor: '#000000',
    position: 'absolute',
  },
});
