import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { EXTRA_HEIGHT } from '../../constants';
import { useBody } from '../../context/BodyContext';
import HorizontalLines from './HorizontalLines';
import OutOfRangeWrapper from './OutOfRange';
import TimeColumn from './TimeColumn';
import TouchArea from './TouchArea';
import UnavailableHours from './UnavailableHours';
import VerticalLines from './VerticalLines';

const BodyBoard = () => {
  const { numberOfDays, spaceFromTop, timeIntervalHeight, totalSlots, hourWidth, scrollByDay } =
    useBody();
  const contentView = useAnimatedStyle(() => ({
    height: timeIntervalHeight.value * totalSlots,
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.absolute, { top: EXTRA_HEIGHT + spaceFromTop, zIndex: 1 }, contentView]}>
        <TouchArea />
        <UnavailableHours />
        {!scrollByDay && <OutOfRangeWrapper />}
      </Animated.View>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.absolute, { zIndex: 10, top: EXTRA_HEIGHT + spaceFromTop }, contentView]}>
        <HorizontalLines />
      </Animated.View>
      {numberOfDays > 1 ? (
        <VerticalLines columns={numberOfDays} />
      ) : (
        <View style={{ width: hourWidth }}>
          <TimeColumn includeExtraHeight />
        </View>
      )}
    </View>
  );
};

export default memo(BodyBoard);

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  absolute: { position: 'absolute', left: 0, right: 0 },
});
