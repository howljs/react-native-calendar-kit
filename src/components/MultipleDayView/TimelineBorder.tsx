import times from 'lodash/times';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { START_OFFSET } from '../../constants';
import { useCalendarKit } from '../../context/CalendarKitProvider';
import { useMultipleDayView } from '../../context/MultipleDayViewProvider';

interface TimelineBorderProps {}

const TimelineBorder = ({}: TimelineBorderProps) => {
  const {
    timelineHeight,
    numberOfColumns,
    totalHours,
    timelineWidth,
    timeIntervalHeight,
    theme,
  } = useCalendarKit();

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {times(numberOfColumns, (index) => (
        <VerticalLine
          key={`col_${index}`}
          timelineHeight={timelineHeight}
          index={index}
          cellBorderColor={theme.cellBorderColor}
        />
      ))}
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
      top: timeIntervalHeight.value * index + START_OFFSET,
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

interface VerticalLineProps {
  timelineHeight: Readonly<SharedValue<number>>;
  index: number;
  cellBorderColor: string;
}

const VerticalLine = ({
  timelineHeight,
  index,
  cellBorderColor,
}: VerticalLineProps) => {
  const { columnWidth } = useMultipleDayView();
  const animView = useAnimatedStyle(() => ({
    height: timelineHeight.value + START_OFFSET * 2,
    left: columnWidth.value * index,
  }));
  return (
    <Animated.View
      style={[
        styles.verticalLine,
        { backgroundColor: cellBorderColor },
        animView,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  verticalLine: {
    width: 1,
    backgroundColor: '#000000',
    position: 'absolute',
  },
  horizontalLine: {
    height: 1,
    backgroundColor: '#000000',
    position: 'absolute',
  },
});
