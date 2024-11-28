import {
  AnimatedCalendarList,
  type ListRenderItemContainerInfo,
  type ListRenderItemInfo,
  LoadingOverlay,
  ProgressBar,
  useLayout,
  useTheme,
} from '@calendar-kit/core';
import React, { useCallback, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import DayItem from './components/HeaderItem/DayItem';
import HeaderColumn from './components/HeaderItem/HeaderColumn';
import HeaderContainer from './components/HeaderItem/HeaderContainer';
import WeekNumber from './components/HeaderItem/WeekNumber';
import { DAY_BAR_HEIGHT, ScrollType } from './constants';
import { useCalendar } from './context/CalendarContext';
import type { HeaderContextProps } from './context/HeaderContext';
import { HeaderContext } from './context/HeaderContext';
import useSyncedList from './hooks/useSyncedList';
import type { CalendarHeaderProps } from './types';

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  dayBarHeight = DAY_BAR_HEIGHT,
  LeftAreaComponent,
}) => {
  const {
    numberOfDays,
    columnWidthAnim,
    hourWidth,
    headerListRef,
    calendarGridWidth,
    snapToOffsets,
    showWeekNumber,
    visibleDateUnixAnim,
    visibleDateUnix,
    columnWidth,
    dateList,
    pagesPerSide,
    manualHorizontalScroll,
    headerContainerRef,
  } = useCalendar();

  const calendarWidth = useLayout(useCallback((state) => state.width, []));
  const headerStyles = useTheme(
    useCallback(
      (state) => ({
        headerBackgroundColor: state.headerBackgroundColor || state.colors.background,
        borderColor: state.colors.border,
        headerContainer: state.headerContainer,
      }),
      []
    )
  );

  const scrollProps = useSyncedList({
    id: ScrollType.dayBar,
  });

  const value = useMemo<HeaderContextProps>(
    () => ({
      dayBarHeight,
      numberOfDays,
      columnWidthAnim,
      hourWidth,
      columnWidth,
    }),
    [dayBarHeight, numberOfDays, columnWidthAnim, hourWidth, columnWidth]
  );

  const extraData = useMemo(() => ({}), []);

  const _renderItemContainer = ({ item, index, children }: ListRenderItemContainerInfo) => {
    return (
      <HeaderContainer item={item} index={index}>
        {children}
        <LoadingOverlay />
      </HeaderContainer>
    );
  };

  const _renderItem = ({ item, index }: ListRenderItemInfo) => {
    return (
      <HeaderColumn item={item} index={index}>
        <DayItem />
      </HeaderColumn>
    );
  };

  const leftSize = numberOfDays > 1 ? hourWidth : 0;

  const _renderLeftArea = () => {
    if (LeftAreaComponent) {
      return <View style={[styles.leftArea, { width: hourWidth }]}>{LeftAreaComponent}</View>;
    }

    return (
      <View style={[styles.leftArea, { width: hourWidth }]}>
        {showWeekNumber && <WeekNumber date={visibleDateUnixAnim} />}
        <View style={[styles.border, { backgroundColor: headerStyles.borderColor }]} />
      </View>
    );
  };

  return (
    <View
      ref={headerContainerRef}
      style={[
        styles.headerContainer,
        {
          backgroundColor: headerStyles.headerBackgroundColor,
          borderBottomColor: headerStyles.borderColor,
        },
        headerStyles.headerContainer,
        { width: calendarWidth },
      ]}>
      <ScrollView alwaysBounceVertical={false} overScrollMode="never">
        <HeaderContext.Provider value={value}>
          <View
            style={[
              {
                height: dayBarHeight,
                overflow: Platform.select({
                  web: 'hidden',
                  default: 'visible',
                }),
              },
            ]}>
            {numberOfDays > 1 && _renderLeftArea()}
            <View
              style={[
                styles.absolute,
                {
                  left: Math.max(0, leftSize - 1),
                  width: calendarWidth - leftSize,
                },
              ]}>
              <AnimatedCalendarList
                ref={headerListRef}
                data={dateList}
                layoutSize={{
                  width: calendarGridWidth,
                  height: dayBarHeight,
                }}
                renderItemContainer={_renderItemContainer}
                renderItem={_renderItem}
                extraData={extraData}
                snapToOffsets={snapToOffsets}
                initialDate={visibleDateUnix.current}
                numColumns={numberOfDays}
                scrollEnabled={!manualHorizontalScroll && Platform.OS !== 'web'}
                renderAheadItem={pagesPerSide}
                pagingEnabled
                snapToAlignment={snapToOffsets ? 'start' : undefined}
                decelerationRate={snapToOffsets ? 'fast' : undefined}
                {...scrollProps}
              />
            </View>
          </View>
        </HeaderContext.Provider>
      </ScrollView>
      <ProgressBar />
    </View>
  );
};

export default React.memo(CalendarHeader);

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  absolute: { position: 'absolute' },
  leftArea: { height: '100%' },
  border: { right: 0, height: '100%', position: 'absolute', width: 1 },
});
