import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import CalendarListView from './components/CalendarListView';
import ExpandButton from './components/ExpandButton';
import MultiDayBarItem from './components/MultiDayBarItem';
import SingleDayBarItem from './components/SingleDayBarItem';
import WeekNumber from './components/WeekNumber';
import {
  COLLAPSED_ROW_COUNT,
  COUNT_CONTAINER_HEIGHT,
  DAY_BAR_HEIGHT,
  MAX_ALL_DAY_EVENT_HEIGHT,
  MIN_ALL_DAY_EVENT_HEIGHT,
  ScrollType,
} from './constants';
import { useCalendar } from './context/CalendarProvider';
import {
  DayBarContext,
  type DayBarContextProps,
} from './context/DayBarContext';
import { useEventCountsByWeek } from './context/EventsProvider';
import { useTheme } from './context/ThemeProvider';
import useSyncedList from './hooks/useSyncedList';
import type { CalendarDayBarProps } from './types';
import { clampValues } from './utils/utils';

const CalendarDayBar: React.FC<CalendarDayBarProps> = ({
  dayBarHeight: initialHeight = DAY_BAR_HEIGHT,
  renderDayBarItem,
}) => {
  const {
    calendarLayout,
    numberOfDays,
    columnWidthAnim,
    minuteHeight,
    hourWidth,
    dayBarListRef,
    calendarData,
    calendarGridWidth,
    isRTL,
    snapToInterval,
    scrollByDay,
    initialOffset,
    columns,
    showWeekNumber,
    visibleDateUnixAnim,
    visibleWeeks,
    columnWidth,
    useAllDayEvent,
  } = useCalendar();

  const colors = useTheme((state) => state.colors);
  const dayBarBackgroundColor = useTheme(
    (state) => state.dayBarBackgroundColor || state.colors.background
  );
  const { onScroll, onVisibleColumnChanged } = useSyncedList({
    id: ScrollType.dayBar,
  });

  const isExpanded = useSharedValue(false);
  const isShowExpandButton = useSharedValue(false);
  const eventHeight = useDerivedValue(() =>
    clampValues(
      15 * minuteHeight.value,
      MIN_ALL_DAY_EVENT_HEIGHT,
      MAX_ALL_DAY_EVENT_HEIGHT
    )
  );
  const eventCounts = useEventCountsByWeek(columns === 1 ? 'day' : 'week');
  const allDayEventsHeight = useDerivedValue(() => {
    const currentStartWeek = visibleWeeks.value[0];
    const nextStartWeek = visibleWeeks.value[1];
    let count = currentStartWeek ? eventCounts[currentStartWeek] ?? 0 : 0;
    if (nextStartWeek) {
      const countNextWeek = eventCounts[nextStartWeek] ?? 0;
      count = Math.max(count, countNextWeek);
    }

    if (count && count > 0) {
      const totalCount = isExpanded.value
        ? count
        : Math.min(count, COLLAPSED_ROW_COUNT);
      const nextHeight = totalCount * eventHeight.value;
      const isShowExpand = count > COLLAPSED_ROW_COUNT;
      isShowExpandButton.value = isShowExpand;
      const extraHeight =
        columns === 1
          ? isShowExpand
            ? isExpanded.value
              ? -initialHeight - 14
              : 12 - initialHeight
            : -initialHeight
          : 0;
      return withTiming(nextHeight + COUNT_CONTAINER_HEIGHT + extraHeight, {
        duration: 250,
      });
    }

    isShowExpandButton.value = false;
    return withTiming(0, { duration: 250 });
  }, [eventCounts, initialHeight, columns]);

  const animView = useAnimatedStyle(() => {
    return {
      height: Math.max(initialHeight, initialHeight + allDayEventsHeight.value),
    };
  });

  const value = useMemo<DayBarContextProps>(
    () => ({
      height: initialHeight,
      numberOfDays,
      columnWidthAnim,
      calendarLayout,
      hourWidth,
      minuteHeight,
      isRTL,
      scrollByDay,
      columns,
      calendarData,
      eventHeight,
      isExpanded,
      allDayEventsHeight,
      isShowExpandButton,
      columnWidth,
      useAllDayEvent,
    }),
    [
      initialHeight,
      numberOfDays,
      columnWidthAnim,
      calendarLayout,
      hourWidth,
      minuteHeight,
      isRTL,
      scrollByDay,
      columns,
      calendarData,
      eventHeight,
      isExpanded,
      allDayEventsHeight,
      isShowExpandButton,
      columnWidth,
      useAllDayEvent,
    ]
  );

  const extraData = useMemo(
    () => ({
      minDate: calendarData.minDateUnix,
      visibleDatesArray: calendarData.visibleDatesArray,
      isRTL,
      numberOfDays,
      columns,
      renderDayBarItem,
    }),
    [
      calendarData.minDateUnix,
      calendarData.visibleDatesArray,
      isRTL,
      numberOfDays,
      columns,
      renderDayBarItem,
    ]
  );

  const _renderDayBarItem = (index: number, extra: typeof extraData) => {
    const dateUnixByIndex = extra.visibleDatesArray[index * extra.columns];
    if (!dateUnixByIndex) {
      return null;
    }

    if (renderDayBarItem) {
      return renderDayBarItem({
        startUnix: dateUnixByIndex,
        index,
        extra,
      });
    }

    if (extra.columns === 1) {
      return <SingleDayBarItem startUnix={dateUnixByIndex} />;
    }

    return (
      <MultiDayBarItem
        pageIndex={index * extra.columns}
        startUnix={dateUnixByIndex}
      />
    );
  };

  const extraScrollData = useMemo(() => {
    return {
      visibleDates: calendarData.visibleDatesArray,
      visibleColumns: numberOfDays,
    };
  }, [calendarData.visibleDatesArray, numberOfDays]);

  const leftSize = numberOfDays > 1 ? hourWidth : 0;

  return (
    <View style={[styles.dayBarContainer, { width: calendarLayout.width }]}>
      <ScrollView alwaysBounceVertical={false} overScrollMode="never">
        <DayBarContext.Provider value={value}>
          <Animated.View
            style={[{ backgroundColor: dayBarBackgroundColor }, animView]}
          >
            {numberOfDays > 1 && (
              <View style={[styles.leftArea, { width: hourWidth }]}>
                {showWeekNumber && <WeekNumber date={visibleDateUnixAnim} />}
                <ExpandButton />
                <View
                  style={[styles.border, { backgroundColor: colors.border }]}
                />
              </View>
            )}
            <View
              style={[
                styles.absolute,
                {
                  left: Math.max(0, leftSize - 1),
                  width: calendarGridWidth,
                },
              ]}
            >
              <CalendarListView
                animatedRef={dayBarListRef}
                count={calendarData.count}
                width={calendarGridWidth}
                height={calendarLayout.height}
                renderItem={_renderDayBarItem}
                extraData={extraData}
                inverted={isRTL}
                snapToInterval={snapToInterval}
                initialOffset={initialOffset}
                onScroll={onScroll}
                columnsPerPage={columns}
                onVisibleColumnChanged={onVisibleColumnChanged}
                extraScrollData={extraScrollData}
              />
            </View>
          </Animated.View>
        </DayBarContext.Provider>
      </ScrollView>
    </View>
  );
};

export default React.memo(CalendarDayBar);

const styles = StyleSheet.create({
  dayBarContainer: {
    zIndex: 999,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  absolute: { position: 'absolute' },
  leftArea: { height: '100%' },
  border: { right: 0, height: '100%', position: 'absolute', width: 1 },
});
