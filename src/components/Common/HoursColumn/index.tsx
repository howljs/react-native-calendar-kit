import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { START_OFFSET } from '../../../constants';
import { useCalendarKit } from '../../../context/CalendarKitProvider';
import { HourItemType } from '../../../types';
import HourItem from './HourItem';

interface HoursColumnProps {}

const HoursColumn = ({}: HoursColumnProps) => {
  const { hours, theme, maxTimelineHeight, hourWidth, isRTL } =
    useCalendarKit();

  const _renderHour = (hour: HourItemType, index: number) => {
    return (
      <HourItem key={`hourLabel_${hour.text}`} hour={hour} index={index} />
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: hourWidth,
          height: maxTimelineHeight + START_OFFSET * 2,
          backgroundColor: theme.hourColumn.backgroundColor,
          top: -START_OFFSET,
        },
        isRTL ? styles.right : styles.left,
      ]}
    >
      <View style={{ marginTop: START_OFFSET }}>{hours.map(_renderHour)}</View>
      <Animated.View
        style={[
          styles.verticalLine,
          isRTL ? styles.left : styles.right,
          {
            backgroundColor: theme.cellBorderColor,
          },
        ]}
      />
    </View>
  );
};

export default HoursColumn;

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
    position: 'absolute',
  },
  verticalLine: {
    width: 1,
    position: 'absolute',
    height: '100%',
  },
  left: { left: 0 },
  right: { right: 0 },
});
