import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { UnavailableHour } from '../../types';

interface SpecialRegionByRangeProps {
  start: number;
  totalHours: number;
  timeIntervalHeight: SharedValue<number>;
  region: UnavailableHour;
  backgroundColor: string;
  isRTL?: boolean;
  timeInterval: number;
}

const SpecialRegionByRange = ({
  start,
  totalHours,
  timeIntervalHeight,
  region,
  backgroundColor,
  isRTL,
  timeInterval,
}: SpecialRegionByRangeProps) => {
  const animView = useAnimatedStyle(() => {
    const hourByTimeInterval = 60 / timeInterval;
    return {
      top: start * hourByTimeInterval * timeIntervalHeight.value,
      height: totalHours * hourByTimeInterval * timeIntervalHeight.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        animView,
        { backgroundColor: region.backgroundColor || backgroundColor },
        isRTL && styles.rtl,
      ]}
    >
      {region?.CustomContentComponent && region.CustomContentComponent}
    </Animated.View>
  );
};

export default React.memo(SpecialRegionByRange);

const styles = StyleSheet.create({
  container: { position: 'absolute', width: '100%' },
  rtl: { alignItems: 'flex-end' },
});
