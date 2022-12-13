import React, { memo } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTimelineCalendarContext } from '../../../context/TimelineProvider';

interface HorizontalLineProps {
  hourIndex: number;
  renderHalfLineCustom?: (width: number) => JSX.Element;
  containerStyle?: ViewStyle;
}

const HorizontalLine = ({
  hourIndex,
  renderHalfLineCustom,
  containerStyle,
}: HorizontalLineProps) => {
  const { timeIntervalHeight, theme, rightSideWidth } =
    useTimelineCalendarContext();

  const horizontalStyle = useAnimatedStyle(() => {
    return {
      top: timeIntervalHeight.value * hourIndex,
    };
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.line,
        { width: rightSideWidth, backgroundColor: theme.cellBorderColor },
        containerStyle,
        horizontalStyle,
      ]}
    >
      {renderHalfLineCustom && renderHalfLineCustom(rightSideWidth)}
    </Animated.View>
  );
};

export default memo(HorizontalLine);

const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: '#E8E9ED',
    position: 'absolute',
  },
});
