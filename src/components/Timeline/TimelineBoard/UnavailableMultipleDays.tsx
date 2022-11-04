import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTimelineCalendarContext } from '../../../context/TimelineProvider';

interface UnavailableMultipleDaysProps {
  diffDays: number;
  left?: number;
  right?: number;
}

const UnavailableMultipleDays = ({
  diffDays,
  left,
  right,
}: UnavailableMultipleDaysProps) => {
  const { columnWidth, theme } = useTimelineCalendarContext();

  return (
    <View
      style={[
        styles.unavailableDay,
        {
          left,
          right,
          backgroundColor: theme.unavailableBackgroundColor,
          width: diffDays * columnWidth,
        },
      ]}
    />
  );
};

export default memo(UnavailableMultipleDays);

const styles = StyleSheet.create({
  unavailableDay: {
    height: '100%',
    position: 'absolute',
  },
});
