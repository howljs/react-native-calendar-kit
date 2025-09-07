import React, { FC, memo, useCallback, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { useDerivedValue } from 'react-native-reanimated';
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
  widthPercentage?: number;
}

export const UnavailableHoursByDate = memo(
  ({
    currentUnix,
    visibleDateIndex,
    resources,
    widthPercentage,
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
        widthPercentage={widthPercentage}
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
    widthPercentage,
  }: UnavailableColumnsProps) => {
    const {
      start: calendarStart,
      end: calendarEnd,
      renderCustomUnavailableHour,
      numberOfDays,
    } = useBody();
    const { backgroundColor, containerStyle } = useTheme(
      useCallback((state) => {
        return {
          backgroundColor:
            state.unavailableHourBackgroundColor || state.colors.surface,
          containerStyle: state.unavailableHourContainerStyle || {},
        };
      }, [])
    );

    const allUnavailableHours = useMemo(() => {
      const resourcesList = resources || [];
      const isResourceSupported = numberOfDays === 1;
      // If no resources or only one resource, apply all unavailable hours to the full width
      if (resourcesList.length <= 1 || !isResourceSupported) {
        return unavailableHours.map((item) => ({
          item,
          resourceIndex: 0,
          widthPercentage: widthPercentage || 1,
        }));
      }

      // For multiple resources scenario
      const result: UnavailableColumnHourProps[] = [];
      const widthPerResource = widthPercentage || 1 / resourcesList.length;

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
    }, [resources, numberOfDays, widthPercentage, unavailableHours]);

    const _renderSpecialRegion = (
      props: UnavailableColumnHourProps,
      regionIndex: number
    ) => {
      const item = props.item;
      const clampedStart = Math.max(item.start - calendarStart, 0);
      const start = item.start > calendarStart ? item.start : calendarStart;
      const duration = item.end - start;

      return (
        <UnavailableHourItem
          key={`${currentUnix}_${regionIndex}`}
          diffDays={visibleDateIndex}
          diffMinutes={clampedStart}
          duration={duration}
          totalMinutes={calendarEnd - calendarStart}
          backgroundColor={item.backgroundColor || backgroundColor}
          containerStyle={containerStyle}
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
  duration: number;
  diffDays: number;
  diffMinutes: number;
  backgroundColor: string;
  containerStyle: ViewStyle;
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
  duration,
  diffDays,
  diffMinutes,
  backgroundColor,
  containerStyle,
  enableBackgroundInteraction,
  renderCustomUnavailableHour,
  originalProps,
  resourceIndex,
  widthPercentage = 1,
}: UnavailableHourItemProps) => {
  const { minuteHeight, columnWidthAnim, columnWidth } = useBody();

  const height = useDerivedValue(() => minuteHeight.value * duration);
  const childWidth = useDerivedValue(
    () => columnWidthAnim.value * widthPercentage,
    [widthPercentage]
  );

  return (
    <View
      pointerEvents={enableBackgroundInteraction ? 'none' : 'auto'}
      style={[
        containerStyle,
        styles.container,
        {
          backgroundColor,
          width: columnWidth * widthPercentage,
          left:
            diffDays * columnWidth +
            resourceIndex * (columnWidth * widthPercentage),
          top: `${(diffMinutes / totalMinutes) * 100}%`,
          height: `${(duration / totalMinutes) * 100}%`,
        },
      ]}>
      {renderCustomUnavailableHour &&
        renderCustomUnavailableHour({
          ...originalProps,
          width: childWidth,
          height,
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});
