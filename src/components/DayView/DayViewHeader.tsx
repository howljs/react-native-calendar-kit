import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useCalendarKit } from '../../context/CalendarKitProvider';
import { useDayView } from '../../context/DayViewProvider';
import useSyncedLists from '../../hooks/useSyncedLists';
import RecyclerList, { RecyclerItem } from '../Common/RecyclerList';
import DayBarItem from './DayBarItem';
import { ListType } from '../../constants';
import { useEventsController } from '../../context/EventsProvider';
import { EventItem } from '../../types';

interface DayViewHeaderProps {
  locale: string;
  onDateChanged?: (date: string) => void;
  onPressDayNumber?: (date: string) => void;
  onPressEvent?: (event: EventItem) => void;
  onLongPressEvent?: (event: EventItem) => void;
}

const DayViewHeader = ({
  locale,
  onDateChanged,
  onPressDayNumber,
  onPressEvent,
  onLongPressEvent,
}: DayViewHeaderProps) => {
  const { dayBarHeight, calendarSize, isRTL, theme, pages, renderAheadItem } =
    useCalendarKit();
  const { dayBarRef, initialOffset, dayBarAnimatedRef } = useDayView();
  const { onScroll } = useSyncedLists({
    id: ListType.DayBar,
    onDateChanged,
  });

  const { allDayEvents } = useEventsController();

  const _renderItem = ({ item }: RecyclerItem) => (
    <DayBarItem
      startUnix={item}
      locale={locale}
      events={allDayEvents[item]}
      onPressDayNumber={onPressDayNumber}
      onPressEvent={onPressEvent}
      onLongPressEvent={onLongPressEvent}
    />
  );

  const extraData = useMemo(
    () => ({
      isRTL,
      width: calendarSize.width,
      dayBarHeight,
      theme,
      locale,
      allDayEvents,
      onPressDayNumber,
      onPressEvent,
      onLongPressEvent,
    }),
    [
      isRTL,
      calendarSize.width,
      dayBarHeight,
      theme,
      locale,
      allDayEvents,
      onPressDayNumber,
      onPressEvent,
      onLongPressEvent,
    ]
  );

  return (
    <View>
      <View
        style={[
          styles.dayBar,
          {
            height: dayBarHeight,
            backgroundColor: theme.dayBar.backgroundColor,
            borderBottomColor: theme.cellBorderColor,
          },
        ]}
      >
        <RecyclerList
          ref={dayBarRef}
          data={pages.day.data}
          initialOffset={initialOffset}
          renderItem={_renderItem}
          isPagingEnabled
          listSize={{ width: calendarSize.width, height: dayBarHeight }}
          bounces={false}
          inverted={isRTL}
          animatedRef={dayBarAnimatedRef}
          {...{ extraData }}
          {...{ onScroll }}
          {...{ renderAheadItem }}
        />
      </View>
    </View>
  );
};

export default React.memo(DayViewHeader);

const styles = StyleSheet.create({ dayBar: { borderBottomWidth: 1 } });
