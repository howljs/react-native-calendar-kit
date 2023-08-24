import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { SECONDS_IN_DAY } from '../../constants';
import { useCalendarKit } from '../../context/CalendarKitProvider';
import { useNowIndicator } from '../../context/NowIndicatorProvider';

interface NowIndicatorProps {
  visibleStartDate: number;
  columnWidth: SharedValue<number>;
}

const NowIndicator = ({ columnWidth, visibleStartDate }: NowIndicatorProps) => {
  const { theme, timeIntervalHeight, start, end, timeInterval } =
    useCalendarKit();
  const { currentUnixTime } = useNowIndicator();

  const animView = useAnimatedStyle(() => {
    const diffSeconds = currentUnixTime.value - visibleStartDate;
    const columnIndex = Math.floor(diffSeconds / SECONDS_IN_DAY);

    const startUnix = visibleStartDate + columnIndex * SECONDS_IN_DAY;
    const currentHour = (currentUnixTime.value - startUnix) / (60 * 60);

    const hourHeight = (60 / timeInterval) * timeIntervalHeight.value;
    const startOffset = (currentHour - start) * hourHeight;
    const opacity = startOffset >= 0 && currentHour <= end ? 1 : 0;

    return {
      width: columnWidth.value,
      left: columnIndex * columnWidth.value,
      top: startOffset,
      opacity: opacity,
    };
  });

  return (
    <Animated.View style={[styles.container, animView]}>
      <View
        style={[styles.line, { backgroundColor: theme.nowIndicatorColor }]}
      />
      <View
        style={[styles.dot, { backgroundColor: theme.nowIndicatorColor }]}
      />
    </Animated.View>
  );
};

export default NowIndicator;

const styles = StyleSheet.create({
  container: { position: 'absolute', justifyContent: 'center' },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#007aff',
    width: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007aff',
    position: 'absolute',
    left: -4,
  },
});
