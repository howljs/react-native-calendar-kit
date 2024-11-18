import React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { EXTRA_HEIGHT, MILLISECONDS_IN_DAY } from '../../constants';
import { useActions } from '../../context/ActionsProvider';
import { useBody } from '../../context/BodyContext';
import { useDragEventActions } from '../../context/DragEventProvider';
import { useTimezone } from '../../context/TimeZoneProvider';
import type { ResourceItem } from '../../types';
import { dateTimeToISOString, forceUpdateZone, parseDateTime } from '../../utils/dateUtils';
import TimeColumn from '../TimeColumn';
import Touchable from '../Touchable';
import HorizontalLines from './HorizontalLines';
import OutOfRangeView from './OutOfRangeView';
import UnavailableHours from './UnavailableHours';
import VerticalLines from './VerticalLines';

interface TimelineBoardProps {
  pageIndex: number;
  dateUnix: number;
  visibleDates: Record<number, { diffDays: number; unix: number }>;
  resources?: ResourceItem[];
}

const TimelineBoard = ({ pageIndex, dateUnix, visibleDates, resources }: TimelineBoardProps) => {
  const {
    totalSlots,
    minuteHeight,
    spaceFromTop,
    hourWidth,
    start,
    columnWidthAnim,
    numberOfDays,
    calendarData,
    columns,
    timeIntervalHeight,
    visibleDateUnixAnim,
  } = useBody();
  const { timeZone } = useTimezone();
  const { onPressBackground, onLongPressBackground } = useActions();
  const { triggerDragCreateEvent } = useDragEventActions();

  const onPress = (event: GestureResponderEvent) => {
    const columnIndex = Math.floor(event.nativeEvent.locationX / columnWidthAnim.value);
    const dayIndex = pageIndex + columnIndex;
    const dayUnix = calendarData.visibleDatesArray[dayIndex];
    const minutes = event.nativeEvent.locationY / minuteHeight.value + start;
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    if (dayUnix) {
      const baseDateTime = parseDateTime(dayUnix).set({ hour, minute });
      const dateObj = forceUpdateZone(baseDateTime, timeZone);
      const newProps: { dateTime: string; resourceId?: string } = {
        dateTime: dateTimeToISOString(dateObj),
      };
      if (resources) {
        const colWidth = columnWidthAnim.value / resources.length;
        const resourceIdx = Math.floor(event.nativeEvent.locationX / colWidth);
        newProps.resourceId = resources[resourceIdx]?.id;
      }
      onPressBackground?.(newProps, event);
    }
  };

  const onLongPress = (event: GestureResponderEvent) => {
    const columnIndex = Math.floor(event.nativeEvent.locationX / columnWidthAnim.value);
    const dayIndex = pageIndex + columnIndex;
    const dayUnix = calendarData.visibleDatesArray[dayIndex];
    const minutes = event.nativeEvent.locationY / minuteHeight.value + start;
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    if (dayUnix) {
      const baseDateTime = parseDateTime(dayUnix).set({ hour, minute });
      const dateObj = forceUpdateZone(baseDateTime, timeZone);
      const dateString = dateTimeToISOString(dateObj);
      const newProps: { dateTime: string; resourceId?: string } = {
        dateTime: dateString,
      };
      if (resources) {
        const colWidth = columnWidthAnim.value / resources.length;
        const resourceIdx = Math.floor(event.nativeEvent.locationX / colWidth);
        newProps.resourceId = resources[resourceIdx]?.id;
      }
      onLongPressBackground?.(newProps, event);
      if (triggerDragCreateEvent) {
        const visibleIndex = calendarData.visibleDates[visibleDateUnixAnim.value].index;
        const diffDays = dayIndex - visibleIndex;
        const locationX = diffDays * columnWidthAnim.value;
        triggerDragCreateEvent?.(dateString, locationX);
      }
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
      return <OutOfRangeView position="left" diffDays={calendarData.diffMinDays} />;
    }

    const diffMaxDays = Math.floor(
      (calendarData.originalMaxDateUnix - dateUnix) / MILLISECONDS_IN_DAY
    );
    if (diffMaxDays < 7) {
      return <OutOfRangeView position="right" diffDays={calendarData.diffMaxDays} />;
    }

    return null;
  };

  const _renderUnavailableHours = () => {
    return <UnavailableHours visibleDates={visibleDates} />;
  };

  return (
    <View style={styles.container}>
      {numberOfDays === 1 && !resources && (
        <View style={{ width: hourWidth }}>
          <TimeColumn />
        </View>
      )}
      <Animated.View
        style={[styles.calendarGrid, { marginTop: EXTRA_HEIGHT + spaceFromTop }, contentView]}>
        <Touchable
          style={styles.touchable}
          onPress={onPressBackground ? onPress : undefined}
          onLongPress={triggerDragCreateEvent || onLongPressBackground ? onLongPress : undefined}
          disabled={!onPressBackground && !triggerDragCreateEvent && !onLongPressBackground}
        />
        {_renderUnavailableHours()}
        {_renderOutOfRangeView()}
        <HorizontalLines />
      </Animated.View>
      {(numberOfDays > 1 || resources?.length) && (
        <VerticalLines totalResource={resources ? resources.length : 1} columns={columns} />
      )}
    </View>
  );
};

export default React.memo(TimelineBoard);

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  calendarGrid: { flex: 1 },
  touchable: { flex: 1 },
});
