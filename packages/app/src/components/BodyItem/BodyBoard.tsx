import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { EXTRA_HEIGHT } from '../../constants';
import { useBody } from '../../context/BodyContext';
import HorizontalLines from './HorizontalLines';
import TimeColumn from './TimeColumn';
import TouchArea from './TouchArea';
import UnavailableHours from './UnavailableHours';
import VerticalLines from './VerticalLines';

const BodyBoard = () => {
  const { numberOfDays, spaceFromTop, timeIntervalHeight, totalSlots, hourWidth } = useBody();
  const contentView = useAnimatedStyle(() => ({
    height: timeIntervalHeight.value * totalSlots,
  }));

  return (
    <View style={styles.container}>
      {numberOfDays === 1 && (
        <View style={{ width: hourWidth }}>
          <TimeColumn includeExtraHeight />
        </View>
      )}
      <Animated.View
        style={[styles.calendarGrid, { marginTop: EXTRA_HEIGHT + spaceFromTop }, contentView]}>
        <TouchArea />
        <UnavailableHours />
        <HorizontalLines />
      </Animated.View>
      {numberOfDays > 1 && <VerticalLines columns={numberOfDays} />}
    </View>
  );
};

export default memo(BodyBoard);

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  calendarGrid: { width: '100%' },
});
