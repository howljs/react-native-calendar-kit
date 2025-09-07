import React, { memo, useMemo } from 'react';
import { GestureResponderEvent, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { EXTRA_HEIGHT } from '../../constants';
import { useActions } from '../../context/ActionsProvider';
import { useBody } from '../../context/BodyContext';
import { useDragEventActions } from '../../context/DragEventProvider';
import { useTheme } from '../../context/ThemeProvider';
import { useTimezone } from '../../context/TimeZoneProvider';
import { ResourceItem } from '../../types';
import {
  dateTimeToISOString,
  forceUpdateZone,
  parseDateTime,
} from '../../utils/dateUtils';
import HorizontalLine from '../TimelineBoard/HorizontalLine';
import VerticalLine from '../TimelineBoard/VerticalLine';
import Touchable from '../Touchable';
import UnavailableHoursByResource from './UnavailableHoursByResource';

interface ResourceBoardProps {
  resources: ResourceItem[];
}

const ResourceBoard = ({ resources }: ResourceBoardProps) => {
  const colors = useTheme((state) => state.colors);

  const {
    spaceFromTop,
    totalSlots,
    columnWidth,
    minuteHeight,
    renderCustomHorizontalLine,
    visibleDateUnixAnim,
    start,
    resourcePerPage,
    spaceFromBottom,
    timelineHeight,
  } = useBody();
  const { timeZone } = useTimezone();
  const { onPressBackground, onLongPressBackground } = useActions();
  const { triggerDragCreateEvent } = useDragEventActions();

  const contentView = useAnimatedStyle(() => ({
    height: timelineHeight.value - spaceFromTop - spaceFromBottom,
  }));

  const onPress = (event: GestureResponderEvent) => {
    const dayUnix = visibleDateUnixAnim.value;
    const minutes = event.nativeEvent.locationY / minuteHeight.value + start;
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const baseDateTime = parseDateTime(dayUnix).set({ hour, minute });
    const dateObj = forceUpdateZone(baseDateTime, timeZone);
    const newProps: { dateTime: string; resourceId?: string } = {
      dateTime: dateTimeToISOString(dateObj),
    };
    if (resources) {
      const colWidth = columnWidth / resourcePerPage;
      const resourceIdx = Math.floor(event.nativeEvent.locationX / colWidth);
      newProps.resourceId = resources[resourceIdx]?.id;
    }
    onPressBackground?.(newProps, event);
  };

  const onLongPress = (event: GestureResponderEvent) => {
    const dayUnix = visibleDateUnixAnim.value;
    const minutes = event.nativeEvent.locationY / minuteHeight.value + start;
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const baseDateTime = parseDateTime(dayUnix).set({ hour, minute });
    const dateObj = forceUpdateZone(baseDateTime, timeZone);
    const dateString = dateTimeToISOString(dateObj);
    const newProps: { dateTime: string; resourceId?: string } = {
      dateTime: dateString,
    };
    if (resources) {
      const colWidth = columnWidth / resourcePerPage;
      const resourceIdx = Math.floor(event.nativeEvent.locationX / colWidth);
      newProps.resourceId = resources[resourceIdx]?.id;
    }
    onLongPressBackground?.(newProps, event);
    if (triggerDragCreateEvent) {
      triggerDragCreateEvent?.(newProps, event);
    }
  };

  const _renderVerticalLines = useMemo(() => {
    const lines: React.ReactNode[] = [];

    for (let i = 0; i <= resources.length; i++) {
      lines.push(
        <VerticalLine
          key={i}
          borderColor={colors.border}
          index={i}
          columnWidth={columnWidth}
          childColumns={resourcePerPage}
        />
      );
    }
    return lines;
  }, [resources.length, colors.border, columnWidth, resourcePerPage]);

  const _renderHorizontalLines = useMemo(() => {
    const rows: React.ReactNode[] = [];
    for (let i = 0; i < totalSlots; i++) {
      rows.push(
        <HorizontalLine
          key={i}
          borderColor={colors.border}
          index={i}
          totalSlots={totalSlots}
          renderCustomHorizontalLine={renderCustomHorizontalLine}
        />
      );

      rows.push(
        <HorizontalLine
          key={`${i}.5`}
          borderColor={colors.border}
          index={i + 0.5}
          totalSlots={totalSlots}
          renderCustomHorizontalLine={renderCustomHorizontalLine}
        />
      );
    }

    rows.push(
      <HorizontalLine
        key={totalSlots}
        borderColor={colors.border}
        index={totalSlots}
        totalSlots={totalSlots}
        renderCustomHorizontalLine={renderCustomHorizontalLine}
      />
    );
    return rows;
  }, [totalSlots, colors.border, renderCustomHorizontalLine]);

  return (
    <View style={styles.container}>
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
        <UnavailableHoursByResource resources={resources} />
        {_renderHorizontalLines}
      </Animated.View>
      {resources.length > 1 && _renderVerticalLines}
    </View>
  );
};

export default memo(ResourceBoard);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarGrid: { width: '100%' },
  touchable: { flex: 1 },
});
