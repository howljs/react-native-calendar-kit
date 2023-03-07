import times from 'lodash/times';
import moment from 'moment-timezone';
import React, { memo, useMemo } from 'react';
import {
  GestureResponderEvent,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { COLUMNS, SECONDS_IN_DAY } from '../../../constants';
import { useTimelineCalendarContext } from '../../../context/TimelineProvider';
import type { UnavailableItemProps } from '../../../types';
import type { HourItem } from '../TimelineHours';
import HorizontalLine from './HorizontalLine';
import UnavailableMultipleDays from './UnavailableMultipleDays';
import VerticalBlock from './VerticalBlock';
import VerticalLine from './VerticalLine';

interface TimelineBoardProps {
  startDate: string;
  onPressBackgroundHandler: (
    type: 'longPress' | 'press' | 'pressOut',
    event: GestureResponderEvent
  ) => void;
  holidays?: string[];
  renderCustomUnavailableItem?: (props: UnavailableItemProps) => JSX.Element;
  renderHalfLineCustom?: (width: number) => JSX.Element;
  halfLineContainerStyle?: ViewStyle;
}

const TimelineBoard = ({
  holidays,
  startDate,
  onPressBackgroundHandler,
  renderCustomUnavailableItem,
  renderHalfLineCustom,
  halfLineContainerStyle,
}: TimelineBoardProps) => {
  const {
    hours,
    viewMode,
    isShowHalfLine,
    unavailableHours,
    minDate,
    maxDate,
  } = useTimelineCalendarContext();

  const _renderHorizontalLine = ({ hourNumber }: HourItem, index: number) => {
    return (
      <React.Fragment key={`line_${hourNumber}`}>
        <HorizontalLine hourIndex={index} />
        {isShowHalfLine && (
          <HorizontalLine
            hourIndex={index + 0.5}
            renderHalfLineCustom={renderHalfLineCustom}
            containerStyle={halfLineContainerStyle}
          />
        )}
        {index === hours.length - 1 && <HorizontalLine hourIndex={index + 1} />}
      </React.Fragment>
    );
  };

  const minDayUnix = useMemo(() => moment(minDate).unix(), [minDate]);
  const maxDayUnix = useMemo(() => moment(maxDate).unix(), [maxDate]);
  const startDayUnix = useMemo(() => moment(startDate).unix(), [startDate]);

  const _renderVerticalBlock = (dayIndex: number) => {
    if (!unavailableHours && !holidays) {
      return <VerticalLine key={dayIndex} index={dayIndex} />;
    }
    const currentUnix = startDayUnix + dayIndex * SECONDS_IN_DAY;
    const isLtMin = currentUnix - minDayUnix < 0;
    const isGtMax = maxDayUnix - currentUnix < 0;

    let unavailableHour;
    if (unavailableHours) {
      if (Array.isArray(unavailableHours)) {
        unavailableHour = unavailableHours;
      } else {
        const current = moment.unix(currentUnix);
        const currentDateStr = current.format('YYYY-MM-DD');
        const currentWeekDay = current.day();
        unavailableHour =
          unavailableHours?.[currentDateStr] ||
          unavailableHours?.[currentWeekDay];
      }
    }

    let isDayDisabled = false;
    if (holidays?.length) {
      const dateStr = moment.unix(currentUnix).format('YYYY-MM-DD');
      isDayDisabled = holidays.includes(dateStr);
    }

    return (
      <VerticalBlock
        key={dayIndex}
        dayIndex={dayIndex}
        isOutsideLimit={isLtMin || isGtMax}
        unavailableHour={unavailableHour}
        isDayDisabled={isDayDisabled}
        renderCustomUnavailableItem={renderCustomUnavailableItem}
      />
    );
  };

  const numOfDays = COLUMNS[viewMode];
  const _renderOutsideDateLimit = () => {
    if (numOfDays !== 1) {
      const diffDayMin = (minDayUnix - startDayUnix) / SECONDS_IN_DAY;
      const endDayUnix = startDayUnix + (numOfDays - 1) * SECONDS_IN_DAY;
      const diffDayMax = (endDayUnix - maxDayUnix) / SECONDS_IN_DAY;

      if (diffDayMin > 0 || diffDayMax > 0) {
        return (
          <UnavailableMultipleDays
            left={diffDayMin > 0 ? 0 : undefined}
            right={diffDayMax > 0 ? 0 : undefined}
            diffDays={diffDayMin > 0 ? diffDayMin : diffDayMax}
            renderCustomUnavailableItem={renderCustomUnavailableItem}
          />
        );
      }
    }

    return;
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {_renderOutsideDateLimit()}
      {times(numOfDays, _renderVerticalBlock)}
      {hours.map(_renderHorizontalLine)}
      <TouchableWithoutFeedback
        delayLongPress={300}
        onPress={(e) => onPressBackgroundHandler('press', e)}
        onLongPress={(e) => onPressBackgroundHandler('longPress', e)}
        onPressOut={(e) => onPressBackgroundHandler('pressOut', e)}
      >
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>
    </View>
  );
};

export default memo(TimelineBoard);
