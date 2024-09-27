import React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { EXTRA_HEIGHT, MILLISECONDS_IN_DAY } from '../../constants';
import { useActions } from '../../context/ActionsProvider';
import { useBody } from '../../context/BodyContext';
import { useDragEventActions } from '../../context/DragEventProvider';
import { useTheme } from '../../context/ThemeProvider';
import { useTimezone } from '../../context/TimeZoneProvider';
import {
  dateTimeToISOString,
  forceUpdateZone,
  parseDateTime,
} from '../../utils/dateUtils';
import TimeColumn from '../TimeColumn';
import Touchable from '../Touchable';
import HorizontalLine from './HorizontalLine';
import OutOfRangeView from './OutOfRangeView';
import UnavailableHours from './UnavailableHours';
import VerticalLine from './VerticalLine';

interface TimelineBoardProps {
  pageIndex: number;
  dateUnix: number;
  visibleDates: Record<number, { diffDays: number; unix: number }>;
}

const TimelineBoard = ({
  pageIndex,
  dateUnix,
  visibleDates,
}: TimelineBoardProps) => {
  const {
    totalSlots,
    timeIntervalHeight,
    spaceFromTop,
    hourWidth,
    start,
    columnWidthAnim,
    numberOfDays,
    calendarData,
    columns,
  } = useBody();
  const { timeZone } = useTimezone();
  const colors = useTheme((state) => state.colors);
  const { onPressBackground, onLongPressBackground } = useActions();
  const { triggerDragCreateEvent } = useDragEventActions();

  const _renderVerticalLines = () => {
    const lines: React.ReactNode[] = [];
    for (let i = 0; i < columns; i++) {
      lines.push(
        <VerticalLine
          key={i}
          borderColor={colors.border}
          index={i}
          columnWidth={columnWidthAnim}
        />
      );
    }
    return lines;
  };

  const _renderHorizontalLines = () => {
    const rows: React.ReactNode[] = [];
    for (let i = 0; i < totalSlots; i++) {
      rows.push(
        <HorizontalLine
          key={i}
          borderColor={colors.border}
          index={i}
          height={timeIntervalHeight}
        />
      );

      rows.push(
        <HorizontalLine
          key={`${i}.5`}
          borderColor={colors.border}
          index={i + 0.5}
          height={timeIntervalHeight}
        />
      );
    }

    rows.push(
      <HorizontalLine
        key={totalSlots}
        borderColor={colors.border}
        index={totalSlots}
        height={timeIntervalHeight}
      />
    );
    return rows;
  };

  const onPress = (event: GestureResponderEvent) => {
    const columnIndex = Math.floor(
      event.nativeEvent.locationX / columnWidthAnim.value
    );
    const dayIndex = pageIndex + columnIndex;
    const dayUnix = calendarData.visibleDatesArray[dayIndex];
    const hour = event.nativeEvent.locationY / timeIntervalHeight.value;

    if (dayUnix) {
      const dateObj = forceUpdateZone(
        parseDateTime(dayUnix).plus({
          minutes: hour * 60 + start,
        }),
        timeZone
      );
      onPressBackground?.({ dateTime: dateTimeToISOString(dateObj) }, event);
    }
  };

  const onLongPress = (event: GestureResponderEvent) => {
    const columnIndex = Math.floor(
      event.nativeEvent.locationX / columnWidthAnim.value
    );
    const dayIndex = pageIndex + columnIndex;
    const dayUnix = calendarData.visibleDatesArray[dayIndex];
    const hour = event.nativeEvent.locationY / timeIntervalHeight.value;

    if (dayUnix) {
      const dateObj = forceUpdateZone(
        parseDateTime(dayUnix).plus({
          minutes: hour * 60 + start,
        }),
        timeZone
      );
      const dateString = dateTimeToISOString(dateObj);
      triggerDragCreateEvent?.(dateString, event);
      onLongPressBackground?.({ dateTime: dateString }, event);
    }
  };

  const contentView = useAnimatedStyle(() => ({
    height: timeIntervalHeight.value * totalSlots,
  }));

  const _renderOutOfRangeView = () => {
    const diffMinDays = Math.floor(
      (calendarData.originalMinDateUnix - dateUnix) / MILLISECONDS_IN_DAY
    );
    if (diffMinDays > 0) {
      return (
        <OutOfRangeView position="left" diffDays={calendarData.diffMinDays} />
      );
    }

    const diffMaxDays = Math.floor(
      (calendarData.originalMaxDateUnix - dateUnix) / MILLISECONDS_IN_DAY
    );
    if (diffMaxDays < 7) {
      return (
        <OutOfRangeView position="right" diffDays={calendarData.diffMaxDays} />
      );
    }

    return null;
  };

  const _renderUnavailableHours = () => {
    return <UnavailableHours visibleDates={visibleDates} />;
  };

  return (
    <View style={styles.container}>
      {numberOfDays === 1 && (
        <View style={{ width: hourWidth }}>
          <TimeColumn />
        </View>
      )}
      <Animated.View
        style={[
          styles.calendarGrid,
          { marginTop: EXTRA_HEIGHT + spaceFromTop },
          contentView,
        ]}>
        <Touchable
          style={styles.touchable}
          onPress={onPressBackground ? onPress : undefined}
          onLongPress={
            triggerDragCreateEvent || onLongPressBackground
              ? onLongPress
              : undefined
          }
          disabled={
            !onPressBackground &&
            !triggerDragCreateEvent &&
            !onLongPressBackground
          }
        />
        {_renderUnavailableHours()}
        {_renderOutOfRangeView()}
        {_renderHorizontalLines()}
      </Animated.View>
      {numberOfDays > 1 && _renderVerticalLines()}
    </View>
  );
};

export default React.memo(TimelineBoard);

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  calendarGrid: { flex: 1 },
  separator: {
    backgroundColor: '#2D2D2D',
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#626266',
    borderRightColor: '#626266',
    position: 'absolute',
  },
  touchableContainer: { flex: 1, flexDirection: 'row' },
  touchable: { flex: 1 },
});
