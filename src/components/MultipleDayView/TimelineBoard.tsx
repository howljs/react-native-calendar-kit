import times from 'lodash/times';
import React from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { SECONDS_IN_DAY } from '../../constants';
import { useCalendarKit } from '../../context/CalendarKitProvider';
import { useMultipleDayView } from '../../context/MultipleDayViewProvider';
import { SpecialRegionProps, UnavailableHour } from '../../types';
import { getWeekDayFromUnix, parseUnixToDateStr } from '../../utils/dateUtils';
import OutsideDateRange from '../Common/OutsideDateRange';
import SpecialRegion from '../Common/SpecialRegion';

interface TimelineBoardProps {
  onLongPressBackground?: () => void;
  visibleStartDate: number;
  OutsideDateRangeComponent?: React.ReactElement;
  unavailableHours?:
    | UnavailableHour[]
    | { [weekDay: string]: UnavailableHour[] };
  holidays?: string[] | { [date: string]: SpecialRegionProps };
}

const TimelineBoard = ({
  onLongPressBackground,
  visibleStartDate,
  OutsideDateRangeComponent,
  unavailableHours,
  holidays,
}: TimelineBoardProps) => {
  const {
    numberOfColumns,
    delayLongPressToCreate,
    viewMode,
    pages,
    theme,
    isRTL,
    start,
    end,
    timeIntervalHeight,
    timeInterval,
  } = useCalendarKit();
  const { columnWidth } = useMultipleDayView();

  const _renderOutSideDateRange = () => {
    if (viewMode !== 'workWeek' && viewMode !== 'week') {
      return;
    }

    const diffDayMin = (pages.day.minDate - visibleStartDate) / SECONDS_IN_DAY;
    const endDayUnix =
      visibleStartDate + (numberOfColumns - 1) * SECONDS_IN_DAY;
    const diffDayMax = (endDayUnix - pages.day.maxDate) / SECONDS_IN_DAY;
    if (diffDayMin < 0 && diffDayMax < 0) {
      return;
    }

    const position = {
      left: diffDayMin > 0 ? 0 : undefined,
      right: diffDayMax > 0 ? 0 : undefined,
    };

    return (
      <OutsideDateRange
        {...position}
        diffDays={diffDayMin > 0 ? diffDayMin : diffDayMax}
        backgroundColor={theme.unavailableBackgroundColor}
        columnWidth={columnWidth}
        OutsideDateRangeComponent={OutsideDateRangeComponent}
        isRTL={isRTL}
      />
    );
  };

  const _renderSpecialRegion = (dayIndex: number) => {
    if (!unavailableHours && !holidays) {
      return;
    }

    const currentUnix = visibleStartDate + dayIndex * SECONDS_IN_DAY;
    const isLtMin = currentUnix - pages.day.minDate < 0;
    const isGtMax = pages.day.maxDate - currentUnix < 0;
    const isOutSideDateRange = isLtMin || isGtMax;
    if (isOutSideDateRange) {
      return;
    }

    const dateStr = parseUnixToDateStr(currentUnix);
    if (holidays) {
      if (Array.isArray(holidays)) {
        let isDayDisabled = holidays.includes(dateStr);
        if (isDayDisabled) {
          return (
            <SpecialRegion
              key={`holiday_${dateStr}`}
              backgroundColor={theme.unavailableBackgroundColor}
              dayIndex={dayIndex}
              columnWidth={columnWidth}
              isRTL={isRTL}
            />
          );
        }
      } else {
        let regionProps = holidays[dateStr];
        if (regionProps) {
          return (
            <SpecialRegion
              key={`holiday_${dateStr}`}
              backgroundColor={theme.unavailableBackgroundColor}
              dayIndex={dayIndex}
              columnWidth={columnWidth}
              regionProps={regionProps}
              isRTL={isRTL}
            />
          );
        }
      }
    }

    let specialRegions: UnavailableHour[] | undefined;
    if (Array.isArray(unavailableHours)) {
      specialRegions = unavailableHours;
    } else if (unavailableHours) {
      const currentWeekDay = getWeekDayFromUnix(currentUnix);
      specialRegions =
        unavailableHours[dateStr] || unavailableHours[currentWeekDay];
    }

    if (!specialRegions) {
      return;
    }

    return (
      <SpecialRegion
        key={`unavailableHours_${currentUnix}`}
        backgroundColor={theme.unavailableBackgroundColor}
        dayIndex={dayIndex}
        columnWidth={columnWidth}
        regions={specialRegions}
        start={start}
        end={end}
        timeIntervalHeight={timeIntervalHeight}
        timeInterval={timeInterval}
        isRTL={isRTL}
      />
    );
  };

  return (
    <View style={[StyleSheet.absoluteFill, isRTL && styles.rtl]}>
      <TouchableWithoutFeedback
        delayLongPress={delayLongPressToCreate}
        onLongPress={onLongPressBackground}
      >
        <View style={[StyleSheet.absoluteFill]} />
      </TouchableWithoutFeedback>
      {_renderOutSideDateRange()}
      {times(numberOfColumns, _renderSpecialRegion)}
    </View>
  );
};

export default TimelineBoard;

const styles = StyleSheet.create({ rtl: { transform: [{ scaleX: -1 }] } });
