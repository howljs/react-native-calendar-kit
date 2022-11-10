import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTimelineCalendarContext } from '../../../context/TimelineProvider';
import type { UnavailableHour, UnavailableItemProps } from '../../../types';
import UnavailableHourItem from './UnavailableHourItem';

interface VerticalBlockProps {
  dayIndex: number;
  isOutsideLimit: boolean;
  unavailableHour?: UnavailableHour[];
  isDayDisabled?: boolean;
  renderCustomUnavailableItem?: (props: UnavailableItemProps) => JSX.Element;
}

const VerticalBlock: React.FC<VerticalBlockProps> = ({
  dayIndex,
  isOutsideLimit,
  unavailableHour,
  isDayDisabled,
  renderCustomUnavailableItem,
}) => {
  const { columnWidth, start, end, theme } = useTimelineCalendarContext();

  const _renderUnavailableHour = (hour: UnavailableHour, i: number) => {
    const startFixed = Math.max(hour.start, start);
    const endFixed = Math.min(hour.end, end);
    return (
      <UnavailableHourItem
        key={`${dayIndex}_${i}`}
        top={startFixed - start}
        hour={endFixed - startFixed}
        renderCustomUnavailableItem={renderCustomUnavailableItem}
      />
    );
  };

  const _renderUnavailableHours = () => {
    if (!isOutsideLimit) {
      if (isDayDisabled) {
        const startFixed = Math.max(0, start);
        const endFixed = Math.min(24, end);
        return (
          <UnavailableHourItem
            top={startFixed - start}
            hour={endFixed - startFixed}
            renderCustomUnavailableItem={renderCustomUnavailableItem}
          />
        );
      }

      if (unavailableHour) {
        return unavailableHour.map(_renderUnavailableHour);
      }
    }
    return;
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.verticalBlock,
        {
          left: columnWidth * dayIndex,
          width: columnWidth,
        },
      ]}
    >
      {_renderUnavailableHours()}
      <View
        style={[
          styles.verticalLine,
          { backgroundColor: theme.cellBorderColor },
        ]}
      />
    </View>
  );
};

export default memo(VerticalBlock);

const styles = StyleSheet.create({
  verticalBlock: { position: 'absolute', height: '100%' },
  verticalLine: {
    width: 1,
    backgroundColor: '#E8E9ED',
    position: 'absolute',
    height: '100%',
    right: 0,
  },
});
