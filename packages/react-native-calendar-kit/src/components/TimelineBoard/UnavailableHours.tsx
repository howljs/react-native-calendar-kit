import React, { FC, memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { useBody } from '../../context/BodyContext';
import { useTheme } from '../../context/ThemeProvider';
import { useUnavailableHoursByDate } from '../../context/UnavailableHoursProvider';
import { ResourceItem, UnavailableHourProps } from '../../types';

interface UnavailableHoursProps {
  visibleDates: Record<string, { diffDays: number; unix: number }>;
  resources?: ResourceItem[];
}

const UnavailableHours: FC<UnavailableHoursProps> = ({
  visibleDates,
  resources,
}) => {
  const _renderColumn = (currentUnix: string, index: number) => (
    <UnavailableHoursByDate
      key={`UnavailableHours_${currentUnix}`}
      currentUnix={Number(currentUnix)}
      visibleDateIndex={index}
      resources={resources}
    />
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {Object.keys(visibleDates).map(_renderColumn)}
    </View>
  );
};

export default UnavailableHours;

interface UnavailableHoursByDateProps {
  currentUnix: number;
  visibleDateIndex: number;
  resources?: ResourceItem[];
}

const UnavailableHoursByDate = memo(
  ({
    currentUnix,
    visibleDateIndex,
    resources,
  }: UnavailableHoursByDateProps) => {
    const unavailableHours = useUnavailableHoursByDate(currentUnix);

    if (!unavailableHours) {
      return null;
    }

    return (
      <UnavailableColumns
        currentUnix={currentUnix}
        visibleDateIndex={visibleDateIndex}
        unavailableHours={unavailableHours}
        resources={resources}
      />
    );
  }
);

interface UnavailableColumnsProps extends UnavailableHoursByDateProps {
  unavailableHours: UnavailableHourProps[];
}

interface UnavailableColumnHourProps {
  item: UnavailableHourProps;
  offsetLeft: number;
  width: number;
}

const UnavailableColumns = memo(
  ({
    currentUnix,
    visibleDateIndex,
    unavailableHours,
    resources,
  }: UnavailableColumnsProps) => {
    const {
      start: calendarStart,
      columnWidth,
      renderCustomUnavailableHour,
    } = useBody();
    const backgroundColor = useTheme(
      useCallback(
        (state) => state.unavailableHourBackgroundColor || state.colors.surface,
        []
      )
    );
    const countResources = useMemo(() => resources?.length || 1, [resources]);
    const allUnavailableHours = useMemo(() => {
      if (!resources?.length) {
        return unavailableHours.map((item) => ({
          item,
          offsetLeft: 0,
          width: columnWidth,
        }));
      }

      return resources.reduce(
        (acc, resource, resourceIndex) => [
          ...acc,
          ...unavailableHours
            .filter(({ resourceId }) => !resourceId)
            .map((item) => ({
              item,
              offsetLeft: 0,
              width: columnWidth,
            })),
          ...unavailableHours
            .filter(({ resourceId }) => resourceId === resource.id)
            .map((item) => ({
              item,
              offsetLeft: resourceIndex * (columnWidth / countResources),
              width: columnWidth / countResources,
            })),
        ],
        [] as UnavailableColumnHourProps[]
      );
    }, [resources, unavailableHours, columnWidth, countResources]);

    const _renderSpecialRegion = (
      props: UnavailableColumnHourProps,
      regionIndex: number
    ) => {
      const item = props.item;
      const clampedStart = Math.max(item.start - calendarStart, 0);
      const start = item.start > calendarStart ? item.start : calendarStart;
      const totalMinutes = item.end - start;

      return (
        <UnavailableHourItem
          key={`${currentUnix}_${regionIndex}`}
          columnWidth={props.width}
          offsetLeft={props.offsetLeft}
          diffDays={visibleDateIndex}
          diffMinutes={clampedStart}
          totalMinutes={totalMinutes}
          backgroundColor={item.backgroundColor || backgroundColor}
          enableBackgroundInteraction={item.enableBackgroundInteraction}
          renderCustomUnavailableHour={renderCustomUnavailableHour}
          originalProps={item}
        />
      );
    };

    return allUnavailableHours.map(_renderSpecialRegion);
  }
);

interface UnavailableHourItemProps {
  columnWidth: number;
  offsetLeft: number;
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
  columnWidth,
  offsetLeft,
  totalMinutes,
  diffDays,
  diffMinutes,
  backgroundColor,
  enableBackgroundInteraction,
  renderCustomUnavailableHour,
  originalProps,
}: UnavailableHourItemProps) => {
  const { minuteHeight } = useBody();

  const height = useDerivedValue(() => minuteHeight.value * totalMinutes);
  const width = useDerivedValue(() => columnWidth);

  const animView = useAnimatedStyle(() => {
    return {
      width: width.value,
      height: height.value,
      top: minuteHeight.value * diffMinutes,
      left: width.value * diffDays + offsetLeft,
    };
  });

  return (
    <Animated.View
      pointerEvents={enableBackgroundInteraction ? 'none' : 'auto'}
      style={[styles.container, { backgroundColor }, animView]}>
      {renderCustomUnavailableHour &&
        renderCustomUnavailableHour({
          ...originalProps,
          width,
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
