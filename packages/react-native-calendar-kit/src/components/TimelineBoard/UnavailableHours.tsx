import type { FC } from 'react';
import React, { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { useBody } from '../../context/BodyContext';
import { useTheme } from '../../context/ThemeProvider';
import { useUnavailableHoursByDate } from '../../context/UnavailableHoursProvider';
import type { UnavailableHourProps } from '../../types';

interface UnavailableHoursProps {
  visibleDates: Record<string, { diffDays: number; unix: number }>;
}

const UnavailableHours: FC<UnavailableHoursProps> = ({ visibleDates }) => {
  const _renderColumn = (currentUnix: string, index: number) => (
    <UnavailableColumn
      key={`UnavailableHours_${currentUnix}`}
      currentUnix={Number(currentUnix)}
      index={index}
    />
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {Object.keys(visibleDates).map(_renderColumn)}
    </View>
  );
};

export default UnavailableHours;

const UnavailableColumn = memo(
  ({ currentUnix, index }: { currentUnix: number; index: number }) => {
    const { start: calendarStart, renderCustomUnavailableHour } = useBody();
    const backgroundColor = useTheme(
      useCallback(
        (state) => state.unavailableHourBackgroundColor || state.colors.surface,
        []
      )
    );

    const unavailableHours = useUnavailableHoursByDate(currentUnix);
    if (!unavailableHours) {
      return null;
    }

    const _renderSpecialRegion = (
      props: UnavailableHourProps,
      regionIndex: number
    ) => {
      const clampedStart = Math.max(props.start - calendarStart, 0);
      const start = props.start > calendarStart ? props.start : calendarStart;
      const totalMinutes = props.end - start;

      return (
        <UnavailableHourItem
          key={`${currentUnix}_${regionIndex}`}
          diffDays={index}
          diffMinutes={clampedStart}
          totalMinutes={totalMinutes}
          backgroundColor={props.backgroundColor || backgroundColor}
          enableBackgroundInteraction={props.enableBackgroundInteraction}
          renderCustomUnavailableHour={renderCustomUnavailableHour}
          originalProps={props}
        />
      );
    };

    return unavailableHours.map(_renderSpecialRegion);
  }
);

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

  const height = useDerivedValue(() => minuteHeight.value * totalMinutes);

  const animView = useAnimatedStyle(() => {
    return {
      width: columnWidthAnim.value,
      height: height.value,
      top: minuteHeight.value * diffMinutes,
      left: columnWidthAnim.value * diffDays,
    };
  });

  return (
    <Animated.View
      pointerEvents={enableBackgroundInteraction ? 'none' : 'auto'}
      style={[styles.container, { backgroundColor }, animView]}>
      {renderCustomUnavailableHour &&
        renderCustomUnavailableHour({
          ...originalProps,
          width: columnWidthAnim,
          height,
        })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});
