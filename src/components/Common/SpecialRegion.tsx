import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type {
  SpecialRegionProps as CustomSpecialRegionProps,
  UnavailableHour,
} from '../../types';
import SpecialRegionByRange from './SpecialRegionByRange';

interface SpecialRegionProps {
  regions?: UnavailableHour[];
  columnWidth: SharedValue<number>;
  dayIndex?: number;
  backgroundColor: string;
  regionProps?: CustomSpecialRegionProps;
  start?: number;
  end?: number;
  timeIntervalHeight?: SharedValue<number>;
  isRTL?: boolean;
  timeInterval?: number;
}

const SpecialRegion = ({
  regions,
  dayIndex = 0,
  columnWidth,
  backgroundColor,
  regionProps,
  start,
  end,
  timeIntervalHeight,
  isRTL,
  timeInterval,
}: SpecialRegionProps) => {
  const animView = useAnimatedStyle(() => ({
    left: dayIndex * columnWidth.value,
    width: columnWidth.value,
  }));

  if (!regions) {
    return (
      <Animated.View
        style={[
          styles.container,
          styles.fullHeight,
          animView,
          { backgroundColor: regionProps?.backgroundColor ?? backgroundColor },
          isRTL && styles.rtl,
        ]}
      >
        {regionProps?.CustomContentComponent &&
          regionProps.CustomContentComponent}
      </Animated.View>
    );
  }

  const _renderSpecialRegion = (region: UnavailableHour) => {
    const startFixed = Math.max(region.start, start!);
    const endFixed = Math.min(region.end, end!);

    const totalHours = endFixed - startFixed;
    if (totalHours <= 0) {
      return;
    }

    return (
      <SpecialRegionByRange
        key={`${region.start}_${region.end}`}
        start={startFixed - start!}
        totalHours={totalHours}
        timeIntervalHeight={timeIntervalHeight!}
        timeInterval={timeInterval!}
        region={region}
        backgroundColor={backgroundColor}
        isRTL={isRTL}
      />
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        styles.boxNone,
        styles.fullHeight,
        animView,
        isRTL && styles.rtl,
      ]}
    >
      {regions.map(_renderSpecialRegion)}
    </Animated.View>
  );
};

export default React.memo(SpecialRegion);

const styles = StyleSheet.create({
  container: { position: 'absolute', overflow: 'hidden' },
  boxNone: { pointerEvents: 'box-none' },
  fullHeight: { height: '100%' },
  rtl: { transform: [{ scaleX: -1 }] },
});
