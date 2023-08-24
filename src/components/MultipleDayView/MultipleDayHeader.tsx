import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ListType } from '../../constants';
import { useCalendarKit } from '../../context/CalendarKitProvider';
import { useEventsController } from '../../context/EventsProvider';
import { useMultipleDayView } from '../../context/MultipleDayViewProvider';
import useSyncedLists from '../../hooks/useSyncedLists';
import RecyclerList, { RecyclerItem } from '../Common/RecyclerList';
import DayBarItem from './DayBarItem';
import { EventItem } from '../../types';
import { useNowIndicator } from '../../context/NowIndicatorProvider';

interface MultipleDayHeaderProps {
  locale: string;
  onPressDayNumber?: (date: string) => void;
  onPressEvent?: (event: EventItem) => void;
  onLongPressEvent?: (event: EventItem) => void;
}

const MultipleDayHeader = ({
  locale,
  onPressDayNumber,
  onPressEvent,
  onLongPressEvent,
}: MultipleDayHeaderProps) => {
  const {
    calendarSize,
    timelineWidth,
    isRTL,
    pages,
    dayBarHeight,
    hourWidth,
    theme,
    numberOfColumns,
    viewMode,
    renderAheadItem,
    maxAllDayHeight,
  } = useCalendarKit();
  const { currentDateStart } = useNowIndicator();
  const { dayBarRef, initialOffset, dayBarAnimatedRef } = useMultipleDayView();

  const { onScroll, isPagingEnabled, snapToOffsets } = useSyncedLists({
    id: ListType.DayBar,
  });

  const { allDayEvents, allDayHeight } = useEventsController();

  const _renderItem = ({ item }: RecyclerItem) => (
    <DayBarItem
      startUnix={item}
      locale={locale}
      allDayEvents={allDayEvents}
      allDayHeight={allDayHeight}
      onPressDayNumber={onPressDayNumber}
      onPressEvent={onPressEvent}
      onLongPressEvent={onLongPressEvent}
    />
  );

  const extraData = useMemo(
    () => ({
      isRTL,
      timelineWidth,
      numberOfColumns,
      theme,
      dayBarHeight,
      locale,
      currentDateStart,
      allDayEvents,
      onPressDayNumber,
      onPressEvent,
      onLongPressEvent,
    }),
    [
      isRTL,
      timelineWidth,
      numberOfColumns,
      theme,
      dayBarHeight,
      locale,
      currentDateStart,
      allDayEvents,
      onPressDayNumber,
      onPressEvent,
      onLongPressEvent,
    ]
  );

  const animView = useAnimatedStyle(() => ({
    height: dayBarHeight + allDayHeight.value,
  }));

  return (
    <View style={{ width: calendarSize.width }}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: theme.dayBar.backgroundColor },
          animView,
        ]}
      >
        <View
          style={[
            styles.absolute,
            {
              left: isRTL ? undefined : hourWidth,
              right: isRTL ? hourWidth : undefined,
              width: timelineWidth,
            },
          ]}
        >
          <RecyclerList
            ref={dayBarRef}
            data={pages[viewMode].data}
            initialOffset={initialOffset}
            renderItem={_renderItem}
            listSize={{
              width: timelineWidth,
              height: dayBarHeight + maxAllDayHeight,
            }}
            bounces={false}
            inverted={isRTL}
            animatedRef={dayBarAnimatedRef}
            {...{ isPagingEnabled }}
            {...{ extraData }}
            {...{ snapToOffsets }}
            {...{ onScroll }}
            {...{ renderAheadItem }}
          />
        </View>
      </Animated.View>
      <View
        style={[
          styles.borderBottom,
          {
            width: calendarSize.width,
            backgroundColor: theme.cellBorderColor,
          },
        ]}
      />
    </View>
  );
};

export default React.memo(MultipleDayHeader);

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  absolute: { position: 'absolute' },
  borderBottom: { position: 'absolute', bottom: 0, height: 1 },
});
