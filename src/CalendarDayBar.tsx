import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import CalendarListView from './components/CalendarListView';
import MultiDayBarItem from './components/MultiDayBarItem';
import SingleDayBarItem from './components/SingleDayBarItem';
import WeekNumber from './components/WeekNumber';
import { DAY_BAR_HEIGHT, MILLISECONDS_IN_DAY, ScrollType } from './constants';
import { useCalendar } from './context/CalendarProvider';
import {
  DayBarContext,
  type DayBarContextProps,
} from './context/DayBarContext';
import { useTheme } from './context/ThemeProvider';
import useSyncedList from './hooks/useSyncedList';
import type { CalendarDayBarProps } from './types';

const CalendarDayBar: React.FC<CalendarDayBarProps> = ({
  dayBarHeight: initialHeight = DAY_BAR_HEIGHT,
}) => {
  const {
    calendarLayout,
    viewMode,
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
    columnWidth,
    showWeekNumber,
    visibleDateUnixAnim,
  } = useCalendar();

  const colors = useTheme((state) => state.colors);
  const dayBarBackgroundColor = useTheme(
    (state) => state.dayBarBackgroundColor || state.colors.background
  );
  const { onScroll, onVisibleColumnChanged } = useSyncedList({
    id: ScrollType.dayBar,
  });
  const dayBarHeight = useDerivedValue(() => {
    // TODO: all-day events
    return initialHeight;
  }, [viewMode]);

  const animView = useAnimatedStyle(() => {
    return {
      height: dayBarHeight.value,
    };
  });

  const value = useMemo<DayBarContextProps>(
    () => ({
      viewMode,
      height: initialHeight,
      numberOfDays,
      columnWidthAnim,
      calendarLayout,
      hourWidth,
      minuteHeight,
      dayBarHeight,
      isRTL,
      scrollByDay,
      columns,
    }),
    [
      viewMode,
      initialHeight,
      numberOfDays,
      columnWidthAnim,
      calendarLayout,
      hourWidth,
      minuteHeight,
      dayBarHeight,
      isRTL,
      scrollByDay,
      columns,
    ]
  );

  const extraData = useMemo(
    () => ({
      minDate: calendarData.minDateUnix,
      isRTL,
      numberOfDays,
    }),
    [calendarData.minDateUnix, isRTL, numberOfDays]
  );

  const _renderDayBarItem = useCallback(
    (index: number, extra: typeof extraData) => {
      if (extra.numberOfDays === 1) {
        const dateUnixByIndex = extra.minDate + index * MILLISECONDS_IN_DAY;
        return <SingleDayBarItem startUnix={dateUnixByIndex} />;
      }

      const dateUnixByIndex = extra.minDate + index * 7 * MILLISECONDS_IN_DAY;
      return <MultiDayBarItem startUnix={dateUnixByIndex} />;
    },
    []
  );

  const extraWidth = numberOfDays > 1 ? hourWidth : 0;

  return (
    <View style={[styles.dayBarContainer, { width: calendarLayout.width }]}>
      <ScrollView alwaysBounceVertical={false}>
        <DayBarContext.Provider value={value}>
          <Animated.View
            style={[{ backgroundColor: dayBarBackgroundColor }, animView]}
          >
            {numberOfDays > 1 && (
              <View style={[styles.leftArea, { width: hourWidth }]}>
                {showWeekNumber && <WeekNumber date={visibleDateUnixAnim} />}
                <View
                  style={[styles.border, { backgroundColor: colors.border }]}
                />
              </View>
            )}
            <View
              style={[
                styles.absolute,
                {
                  left: extraWidth - 1,
                  width: calendarLayout.width - extraWidth,
                },
              ]}
            >
              <CalendarListView
                key={numberOfDays === 1 ? 'single' : 'multi'}
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
                columnWidth={columnWidth}
                onVisibleColumnChanged={onVisibleColumnChanged}
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
  dayBarContainer: { zIndex: 999 },
  absolute: { position: 'absolute' },
  leftArea: { height: '100%' },
  border: { right: 0, height: '100%', position: 'absolute', width: 1 },
});
