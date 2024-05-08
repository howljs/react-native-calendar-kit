import React, { FC, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MILLISECONDS_IN_DAY } from '../../constants';
import { useBody } from '../../context/BodyContext';
import { useTheme } from '../../context/ThemeProvider';
import {
  UnavailableHoursSelector,
  useUnavailableHours,
} from '../../context/UnavailableHoursProvider';
import { UnavailableHourProps } from '../../types';

interface UnavailableHoursProps {
  dateUnix: number;
}

const UnavailableHours: FC<UnavailableHoursProps> = ({ dateUnix }) => {
  const {
    start: calendarStart,
    renderCustomUnavailableHour,
    columns,
  } = useBody();
  const backgroundColor = useTheme(
    (state) => state.unavailableHourBackgroundColor || state.colors.surface
  );

  const { data } = useUnavailableHours(dateUnix, columns);

  if (data.length === 0) {
    return null;
  }

  const _renderSpecialRegion = (
    props: UnavailableHoursSelector,
    index: number
  ) => {
    const clampedStart = Math.max(props.start - calendarStart, 0);
    const start = props.start > calendarStart ? props.start : calendarStart;
    const totalMinutes = props.end - start;
    const diffDays = (props.date - dateUnix) / MILLISECONDS_IN_DAY;

    return (
      <UnavailableHourItem
        key={`${props.date}_${index}`}
        diffDays={diffDays}
        diffMinutes={clampedStart}
        totalMinutes={totalMinutes}
        backgroundColor={props.backgroundColor || backgroundColor}
        enableBackgroundInteraction={props.enableBackgroundInteraction}
        renderCustomUnavailableHour={renderCustomUnavailableHour}
        originalProps={props}
      />
    );
  };

  return <>{data.map(_renderSpecialRegion)}</>;
};

export default UnavailableHours;

interface UnavailableHourItemProps {
  totalMinutes: number;
  diffDays: number;
  diffMinutes: number;
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
  diffDays,
  diffMinutes,
  backgroundColor,
  enableBackgroundInteraction,
  renderCustomUnavailableHour,
  originalProps,
}: UnavailableHourItemProps) => {
  const { minuteHeight, columnWidthAnim } = useBody();

  const totalMinutesAnim = useSharedValue(totalMinutes);
  const diffMinutesAnim = useSharedValue(diffMinutes);
  const diffDaysAnim = useSharedValue(diffDays);

  useEffect(() => {
    totalMinutesAnim.value = withTiming(totalMinutes);
    diffMinutesAnim.value = withTiming(diffMinutes);
    diffDaysAnim.value = withTiming(diffDays);
  }, [
    diffDays,
    diffDaysAnim,
    diffMinutes,
    diffMinutesAnim,
    totalMinutes,
    totalMinutesAnim,
  ]);

  const height = useDerivedValue(
    () => minuteHeight.value * totalMinutesAnim.value
  );

  const animView = useAnimatedStyle(() => {
    return {
      width: columnWidthAnim.value,
      height: height.value,
      top: minuteHeight.value * diffMinutesAnim.value,
      left: columnWidthAnim.value * diffDaysAnim.value,
    };
  });

  return (
    <Animated.View
      pointerEvents={enableBackgroundInteraction ? 'box-none' : 'auto'}
      style={[styles.container, { backgroundColor }, animView]}
    >
      {renderCustomUnavailableHour &&
        renderCustomUnavailableHour({
          ...originalProps,
          width: columnWidthAnim,
          height: height,
        })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});
