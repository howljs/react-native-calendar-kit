import { useTheme } from '@calendar-kit/core';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

import { MILLISECONDS_IN_DAY } from '../../constants';
import { useBody, useBodyItemContainer } from '../../context/BodyContext';

const OutOfRange = ({ item }: { item: number }) => {
  const { outOfRangeData, numberOfDays } = useBody();
  const diffDays = useSharedValue(0);

  const isBeforeMin = item < outOfRangeData.minUnix;
  const { columnWidthAnim, renderCustomOutOfRange, timeIntervalHeight, totalSlots, gridListRef } =
    useBody();

  useEffect(() => {
    if (!gridListRef.current) {
      return;
    }

    const endDate = item + (numberOfDays - 1) * MILLISECONDS_IN_DAY;
    const dates = gridListRef.current.getVisibleDates(item, endDate);
    const outOfRangeDays = dates.reduce((count, date) => {
      if (date < outOfRangeData.minUnix || date > outOfRangeData.maxUnix) {
        return count + 1;
      }
      return count;
    }, 0);

    diffDays.value = outOfRangeDays;
  }, [diffDays, gridListRef, item, numberOfDays, outOfRangeData.maxUnix, outOfRangeData.minUnix]);

  const disableBackgroundColor = useTheme(
    (state) => state.outOfRangeBackgroundColor || state.colors.surface
  );

  const disableHeight = useDerivedValue(
    () => timeIntervalHeight.value * totalSlots,
    [timeIntervalHeight, totalSlots]
  );

  const disableWidth = useDerivedValue(
    () => diffDays.value * columnWidthAnim.value,
    [columnWidthAnim, diffDays]
  );

  const disableAnim = useAnimatedStyle(() => {
    return {
      width: disableWidth.value,
      height: disableHeight.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.outOfRange,
        isBeforeMin ? { left: 0 } : { right: 0 },
        { backgroundColor: disableBackgroundColor },
        disableAnim,
      ]}>
      {renderCustomOutOfRange &&
        renderCustomOutOfRange({
          width: columnWidthAnim,
          height: disableHeight,
        })}
    </Animated.View>
  );
};

const OutOfRangeWrapper = () => {
  const { item } = useBodyItemContainer();
  const { outOfRangeData, numberOfDays } = useBody();
  const isBeforeMin = item < outOfRangeData.minUnix;
  const isAfterMax = item + numberOfDays * MILLISECONDS_IN_DAY > outOfRangeData.maxUnix;

  if (!isBeforeMin && !isAfterMax) {
    return null;
  }

  return <OutOfRange item={item} />;
};

export default OutOfRangeWrapper;

const styles = StyleSheet.create({
  outOfRange: {
    position: 'absolute',
    height: '100%',
    zIndex: 10,
  },
});
