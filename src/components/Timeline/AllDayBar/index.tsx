import { AnimatedFlashList, ListRenderItemInfo } from '@shopify/flash-list';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { COLUMNS, DEFAULT_PROPS } from '../../../constants';
import { useTimelineCalendarContext } from '../../../context/TimelineProvider';
import type { EventItem, PackedEvent } from '../../../types';
import { divideEventsByColumns } from '../../../utils';
import MultipleDayBar from './MultipleDayBar';

interface AllDayBarProps {
  events?: Record<string, EventItem[]>;
  height?: number;
  renderEventContent?: (
    event: PackedEvent,
    timeIntervalHeight: SharedValue<number>
  ) => JSX.Element;
  onPressDayNum?: (date: string) => void;
  onPressEvent?: (event: PackedEvent) => void;
}

const AllDayBar = ({
  events,
  height,
  renderEventContent,
  onPressDayNum,
  onPressEvent,
}: AllDayBarProps) => {
  const {
    syncedLists,
    viewMode,
    allDayBarListRef,
    pages,
    rightSideWidth,
    currentIndex,
    hourWidth,
    columnWidth,
    theme,
    locale,
    tzOffset,
    currentDate,
    overlapEventsSpacing,
    rightEdgeSpacing,
    start,
  } = useTimelineCalendarContext();

  const [startDate, setStartDate] = useState(
    pages[viewMode].data[pages[viewMode].index] || ''
  );

  const _renderMultipleDayItem = ({
    item,
    extraData,
  }: ListRenderItemInfo<string>) => {
    const eventsByColumns = divideEventsByColumns({
      events: extraValues.events,
      columns: COLUMNS[viewMode],
      columnWidth,
      startHour: start,
      startDate: item,
      overlapEventsSpacing,
      rightEdgeSpacing,
      tzOffset,
    });

    const dayItemProps = {
      width: rightSideWidth,
      height: height ?? 40,
      startDate: item,
      columnWidth,
      hourWidth,
      viewMode,
      renderEventContent,
      onPressDayNum,
      onPressEvent: onPressEvent,
      theme: extraData.theme,
      locale: extraData.locale,
      highlightDates: extraData.highlightDates,
      tzOffset,
      events: eventsByColumns ?? {},
      currentDate: extraData.currentDate,
    };

    return <MultipleDayBar {...dayItemProps} />;
  };

  const extraValues = useMemo(
    () => ({
      locale,
      theme,
      currentDate,
      events: events,
      start,
      renderEventContent,
    }),
    [locale, theme, currentDate, events, start, renderEventContent]
  );

  const _renderDayBarList = () => {
    const listProps = {
      ref: allDayBarListRef,
      keyExtractor: (item: string) => item,
      scrollEnabled: false,
      disableHorizontalListHeightMeasurement: true,
      showsHorizontalScrollIndicator: false,
      horizontal: true,
      bounces: false,
      scrollEventThrottle: 16,
      pagingEnabled: true,
      extraData: extraValues,
    };

    return (
      <View style={styles.multipleDayContainer}>
        <View
          style={[
            styles.allDayLabelContainer,
            {
              width: hourWidth,
            },
          ]}
        >
          <Text style={theme.allDayBarLabel}>All Day</Text>
        </View>
        <View style={{ width: rightSideWidth, height: height }}>
          <AnimatedFlashList
            {...listProps}
            data={pages[viewMode].data}
            initialScrollIndex={pages[viewMode].index}
            estimatedItemSize={rightSideWidth}
            estimatedListSize={{
              width: rightSideWidth,
              height: height ?? DEFAULT_PROPS.DAY_BAR_HEIGHT,
            }}
            renderItem={_renderMultipleDayItem}
          />
        </View>
      </View>
    );
  };

  useAnimatedReaction(
    () => currentIndex.value,
    (index) => {
      if (syncedLists) {
        return;
      }

      const dateByIndex = pages[viewMode].data[index];
      if (dateByIndex) {
        runOnJS(setStartDate)(dateByIndex);
      }
    },
    [viewMode, syncedLists]
  );

  const _renderDayBarView = () => {
    return (
      <View style={styles.multipleDayContainer}>
        <View style={{ width: hourWidth }} />
        {_renderMultipleDayItem({
          item: startDate,
          extraData: extraValues,
          index: 0,
          target: 'Cell',
        })}
      </View>
    );
  };

  return (
    <View
      style={[
        { backgroundColor: theme.backgroundColor },
        theme.allDayBarContainer,
      ]}
    >
      {syncedLists ? _renderDayBarList() : _renderDayBarView()}
    </View>
  );
};

export default AllDayBar;

const styles = StyleSheet.create({
  allDayLabelContainer: {
    alignItems: 'center',
    paddingTop: 4,
  },
  multipleDayContainer: { flexDirection: 'row' },
  disabledFrame: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0)',
  },
});
