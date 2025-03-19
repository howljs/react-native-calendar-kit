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
  resourceIndex: number;
  widthPercentage: number;
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
      renderCustomUnavailableHour,
      numberOfDays,
    } = useBody();
    const backgroundColor = useTheme(
      useCallback(
        (state) => state.unavailableHourBackgroundColor || state.colors.surface,
        []
      )
    );

    const allUnavailableHours = useMemo(() => {
      const resourcesList = resources || [];
      const isResourceSupported = numberOfDays === 1;
      // If no resources or only one resource, apply all unavailable hours to the full width
      if (resourcesList.length <= 1 || !isResourceSupported) {
        return unavailableHours.map((item) => ({
          item,
          resourceIndex: 0,
          widthPercentage: 1,
        }));
      }

      // For multiple resources scenario
      const result: UnavailableColumnHourProps[] = [];
      const widthPerResource = 1 / resourcesList.length;

      // Create a map for faster resource lookup
      const resourceMap = new Map<string, number>();
      resourcesList.forEach((resource, index) => {
        if (resource.id) {
          resourceMap.set(resource.id, index);
        }
      });

      // Process all unavailable hours in a single pass
      unavailableHours.forEach((item) => {
        if (!item.resourceId) {
          // Global unavailable hour - apply to all resources
          resourcesList.forEach((_, index) => {
            result.push({
              item,
              resourceIndex: index,
              widthPercentage: widthPerResource,
            });
          });
        } else {
          // Resource-specific unavailable hour
          const resourceIndex = resourceMap.get(item.resourceId);
          if (resourceIndex !== undefined) {
            result.push({
              item,
              resourceIndex,
              widthPercentage: widthPerResource,
            });
          }
        }
      });

      return result;
    }, [resources, numberOfDays, unavailableHours]);

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
          diffDays={visibleDateIndex}
          diffMinutes={clampedStart}
          totalMinutes={totalMinutes}
          backgroundColor={item.backgroundColor || backgroundColor}
          enableBackgroundInteraction={item.enableBackgroundInteraction}
          renderCustomUnavailableHour={renderCustomUnavailableHour}
          originalProps={item}
          resourceIndex={props.resourceIndex}
          widthPercentage={props.widthPercentage}
        />
      );
    };

    return allUnavailableHours.map(_renderSpecialRegion);
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
  resourceIndex: number;
  widthPercentage?: number;
}

const UnavailableHourItem = ({
  totalMinutes,
  diffDays,
  diffMinutes,
  backgroundColor,
  enableBackgroundInteraction,
  renderCustomUnavailableHour,
  originalProps,
  resourceIndex,
  widthPercentage = 1,
}: UnavailableHourItemProps) => {
  const { minuteHeight, columnWidthAnim } = useBody();

  const height = useDerivedValue(() => minuteHeight.value * totalMinutes);
  const childWidth = useDerivedValue(
    () => columnWidthAnim.value * widthPercentage,
    [widthPercentage]
  );

  const animView = useAnimatedStyle(() => {
    return {
      width: childWidth.value,
      height: height.value,
      top: minuteHeight.value * diffMinutes,
      left: diffDays * columnWidthAnim.value + resourceIndex * childWidth.value,
    };
  });

  return (
    <Animated.View
      pointerEvents={enableBackgroundInteraction ? 'none' : 'auto'}
      style={[styles.container, { backgroundColor }, animView]}>
      {renderCustomUnavailableHour &&
        renderCustomUnavailableHour({
          ...originalProps,
          width: childWidth,
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
