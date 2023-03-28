import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTimelineCalendarContext } from '../../../context/TimelineProvider';
import type { UnavailableItemProps } from '../../../types';

interface UnavailableHourProps {
  top: number;
  hour: number;
  renderCustomUnavailableItem?: (props: UnavailableItemProps) => JSX.Element;
}

const UnavailableHourItem = ({
  top,
  hour,
  renderCustomUnavailableItem,
}: UnavailableHourProps) => {
  const { heightByTimeInterval, theme, columnWidth } =
    useTimelineCalendarContext();
  const unavailableHourStyle = useAnimatedStyle(() => {
    return {
      top: top * heightByTimeInterval.value,
      height: hour * heightByTimeInterval.value,
    };
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.unavailableHourItem,
        { backgroundColor: theme.unavailableBackgroundColor },
        unavailableHourStyle,
      ]}
    >
      {renderCustomUnavailableItem &&
        renderCustomUnavailableItem({
          timeIntervalHeight: heightByTimeInterval,
          hour,
          width: columnWidth,
        })}
    </Animated.View>
  );
};

export default memo(UnavailableHourItem);

const styles = StyleSheet.create({
  unavailableHourItem: {
    left: 0,
    width: '100%',
    position: 'absolute',
    overflow: 'hidden',
  },
});
