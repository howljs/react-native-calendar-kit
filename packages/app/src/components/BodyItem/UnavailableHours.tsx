import { useTheme } from '@calendar-kit/core';
import React, { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

import { useBody } from '../../context/BodyContext';
import { useUnavailableHoursByDate } from '../../hooks/useUnavailableHours';
import type { UnavailableHourProps } from '../../types';
import { useBodyContainer } from './BodyItemContext';

const UnavailableHours = () => {
  const { item } = useBodyContainer();
  const { start: calendarStart, renderCustomUnavailableHour } = useBody();
  const backgroundColor = useTheme(
    useCallback((state) => state.unavailableHourBackgroundColor || state.colors.surface, [])
  );

  const unavailableHours = useUnavailableHoursByDate(item);
  if (!unavailableHours) {
    return null;
  }

  const _renderSpecialRegion = (props: UnavailableHourProps, regionIndex: number) => {
    const clampedStart = Math.max(props.start - calendarStart, 0);
    const start = props.start > calendarStart ? props.start : calendarStart;
    const totalMinutes = props.end - start;

    return (
      <UnavailableHourItem
        key={`${item}_${props.columnIndex}_${regionIndex}`}
        diffMinutes={clampedStart}
        columnIndex={props.columnIndex}
        totalMinutes={totalMinutes}
        backgroundColor={props.backgroundColor || backgroundColor}
        enableBackgroundInteraction={props.enableBackgroundInteraction}
        renderCustomUnavailableHour={renderCustomUnavailableHour}
        originalProps={props}
      />
    );
  };

  return unavailableHours.map(_renderSpecialRegion);
};

export default memo(UnavailableHours);

interface UnavailableHourItemProps {
  totalMinutes: number;
  diffMinutes: number;
  columnIndex: number;
  backgroundColor: string;
  enableBackgroundInteraction?: boolean;
  renderCustomUnavailableHour?: (
    props: UnavailableHourProps & {
      width: SharedValue<number>;
      height: SharedValue<number>;
    }
  ) => React.ReactNode;
  originalProps: UnavailableHourProps;
}

const UnavailableHourItem = ({
  totalMinutes,
  diffMinutes,
  backgroundColor,
  columnIndex,
  enableBackgroundInteraction,
}: UnavailableHourItemProps) => {
  const { minuteHeight, columnWidthAnim } = useBody();

  const height = useDerivedValue(
    () => minuteHeight.value * totalMinutes,
    [minuteHeight, totalMinutes]
  );
  const top = useDerivedValue(() => minuteHeight.value * diffMinutes, [diffMinutes, minuteHeight]);
  const left = useDerivedValue(
    () => columnWidthAnim.value * columnIndex,
    [columnIndex, columnWidthAnim]
  );
  const animView = useAnimatedStyle(() => {
    return {
      width: columnWidthAnim.value,
      height: height.value,
      top: top.value,
      left: left.value,
    };
  });

  return (
    <Animated.View
      pointerEvents={enableBackgroundInteraction ? 'none' : 'auto'}
      style={[styles.container, { backgroundColor }, animView]}>
      {/* {renderCustomUnavailableHour &&
        renderCustomUnavailableHour({
          ...originalProps,
          width: columnWidthAnim,
          height,
        })} */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});
