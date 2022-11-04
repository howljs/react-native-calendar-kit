import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTimelineCalendarContext } from '../../../context/TimelineProvider';

interface VerticalLineProps {
  index: number;
}

const VerticalLine = ({ index }: VerticalLineProps) => {
  const { columnWidth, theme } = useTimelineCalendarContext();

  return (
    <View
      style={[
        styles.verticalLine,
        { backgroundColor: theme.cellBorderColor, right: columnWidth * index },
      ]}
    />
  );
};

export default memo(VerticalLine);

const styles = StyleSheet.create({
  verticalLine: {
    width: 1,
    backgroundColor: '#E8E9ED',
    position: 'absolute',
    height: '100%',
  },
});
