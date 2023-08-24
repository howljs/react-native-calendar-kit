import React, { useMemo } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ListType, START_OFFSET } from '../../constants';
import { useCalendarKit } from '../../context/CalendarKitProvider';
import { useDayView } from '../../context/DayViewProvider';
import { useEventsController } from '../../context/EventsProvider';
import useSyncedLists from '../../hooks/useSyncedLists';
import { EventItem, SpecialRegionProps, UnavailableHour } from '../../types';
import RecyclerList, { RecyclerItem } from '../Common/RecyclerList';
import Timeline from './Timeline';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface DayViewProps {
  onChange?: (date: string) => void;
  onDateChanged?: (date: string) => void;
  unavailableHours?:
    | UnavailableHour[]
    | { [weekDay: string]: UnavailableHour[] };
  holidays?: string[] | { [date: string]: SpecialRegionProps };
  sendTimelineBorderToBack?: boolean;
  onPressEvent?: (event: EventItem) => void;
  onLongPressEvent?: (event: EventItem) => void;
}

const DayViewBody = ({
  onChange,
  onDateChanged,
  unavailableHours,
  holidays,
  sendTimelineBorderToBack,
  onPressEvent,
  onLongPressEvent,
}: DayViewProps) => {
  const {
    calendarSize,
    isRTL,
    maxTimelineHeight,
    timelineHeight,
    timelineWidth,
    pages,
    scrollVisibleHeight,
    hourWidth,
    totalHours,
    theme,
    delayLongPressToCreate,
    renderAheadItem,
    offsetY,
    verticalListRef,
  } = useCalendarKit();

  const { timelineRef, columnWidth, initialOffset, timelineAnimatedRef } =
    useDayView();
  const { onScroll } = useSyncedLists({
    id: ListType.Timeline,
    onDateChanged,
    onChange,
  });
  const { normalEvents } = useEventsController();

  const _onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    offsetY.value = e.nativeEvent.contentOffset.y;
  };

  const _renderItem = ({ item }: RecyclerItem) => {
    return (
      <Timeline
        {...{ unavailableHours }}
        {...{ holidays }}
        {...{ sendTimelineBorderToBack }}
        {...{ columnWidth }}
        {...{ onPressEvent }}
        item={item}
        events={normalEvents[item] || []}
        onLongPressEvent={onLongPressEvent}
      />
    );
  };

  const animContentStyle = useAnimatedStyle(() => ({
    height: timelineHeight.value,
  }));

  const _onLayout = (e: LayoutChangeEvent) =>
    (scrollVisibleHeight.value = e.nativeEvent.layout.height);

  const extraData = useMemo(
    () => ({
      isRTL,
      width: calendarSize.width,
      maxTimelineHeight,
      timelineWidth,
      hourWidth,
      totalHours,
      theme,
      delayLongPressToCreate,
      unavailableHours,
      holidays,
      normalEvents,
      onPressEvent,
      onLongPressEvent,
    }),
    [
      isRTL,
      calendarSize.width,
      maxTimelineHeight,

      timelineWidth,
      hourWidth,
      totalHours,
      theme,
      delayLongPressToCreate,
      unavailableHours,
      holidays,
      normalEvents,
      onPressEvent,
      onLongPressEvent,
    ]
  );

  return (
    <Animated.View style={styles.container}>
      <AnimatedScrollView
        ref={verticalListRef}
        onScroll={_onScroll}
        scrollEventThrottle={16}
        pinchGestureEnabled={false}
        showsVerticalScrollIndicator={false}
        onLayout={_onLayout}
        contentOffset={{ x: 0, y: offsetY.value }}
      >
        <Animated.View
          style={[{ width: calendarSize.width }, animContentStyle]}
        >
          <View
            style={[
              styles.absolute,
              {
                top: -START_OFFSET,
                width: calendarSize.width,
              },
            ]}
          >
            <View style={{ width: calendarSize.width }}>
              <RecyclerList
                ref={timelineRef}
                data={pages.day.data}
                initialOffset={initialOffset}
                renderItem={_renderItem}
                isPagingEnabled
                listSize={{
                  width: calendarSize.width,
                  height: maxTimelineHeight + START_OFFSET * 2,
                }}
                bounces={false}
                inverted={isRTL}
                {...{ extraData }}
                {...{ onScroll }}
                {...{ renderAheadItem }}
                animatedRef={timelineAnimatedRef}
              />
            </View>
          </View>
        </Animated.View>
      </AnimatedScrollView>
    </Animated.View>
  );
};

export default React.memo(DayViewBody);

const styles = StyleSheet.create({
  container: { flex: 1 },
  absolute: { position: 'absolute' },
});
