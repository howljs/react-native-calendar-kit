import React from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { useCalendarKit } from '../../context/CalendarKitProvider';
import { useDayView } from '../../context/DayViewProvider';
import type { SpecialRegionProps, UnavailableHour } from '../../types';
import { getWeekDayFromUnix, parseUnixToDateStr } from '../../utils/dateUtils';
import SpecialRegion from '../Common/SpecialRegion';

interface TimelineBoardProps {
  visibleStartDate: number;
  onLongPressBackground?: () => void;
  unavailableHours?:
    | UnavailableHour[]
    | { [weekDay: string]: UnavailableHour[] };
  holidays?: string[] | { [date: string]: SpecialRegionProps };
}

const TimelineBoard = ({
  visibleStartDate,
  onLongPressBackground,
  unavailableHours,
  holidays,
}: TimelineBoardProps) => {
  const {
    delayLongPressToCreate,
    theme,
    start,
    end,
    timeIntervalHeight,
    isRTL,
    timeInterval,
  } = useCalendarKit();
  const { columnWidth } = useDayView();

  const _renderSpecialRegion = () => {
    if (!unavailableHours && !holidays) {
      return;
    }

    const dateStr = parseUnixToDateStr(visibleStartDate);
    if (holidays) {
      if (Array.isArray(holidays)) {
        let isDayDisabled = holidays.includes(dateStr);
        if (isDayDisabled) {
          return (
            <SpecialRegion
              key={`holiday_${dateStr}`}
              backgroundColor={theme.unavailableBackgroundColor}
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
      const currentWeekDay = getWeekDayFromUnix(visibleStartDate);
      specialRegions =
        unavailableHours[dateStr] || unavailableHours[currentWeekDay];
    }

    if (!specialRegions) {
      return;
    }

    return (
      <SpecialRegion
        key={`unavailableHours_${visibleStartDate}`}
        backgroundColor={theme.unavailableBackgroundColor}
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
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>
      {_renderSpecialRegion()}
    </View>
  );
};

export default TimelineBoard;

const styles = StyleSheet.create({ rtl: { transform: [{ scaleX: -1 }] } });
