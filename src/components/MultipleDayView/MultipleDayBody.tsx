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
import { useEventsController } from '../../context/EventsProvider';
import { useMultipleDayView } from '../../context/MultipleDayViewProvider';
import useSyncedLists from '../../hooks/useSyncedLists';
import { EventItem, SpecialRegionProps, UnavailableHour } from '../../types';
import HoursColumn from '../Common/HoursColumn';
import RecyclerList, { RecyclerItem } from '../Common/RecyclerList';
import Timeline from './Timeline';
import { useNowIndicator } from '../../context/NowIndicatorProvider';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface MultipleDayBodyProps {
  onChange?: (date: string) => void;
  onDateChanged?: (date: string) => void;
  OutsideDateRangeComponent?: React.ReactElement;
  unavailableHours?:
    | UnavailableHour[]
    | { [weekDay: string]: UnavailableHour[] };
  holidays?: string[] | { [date: string]: SpecialRegionProps };
  sendTimelineBorderToBack?: boolean;
  onPressEvent?: (event: EventItem) => void;
  onLongPressEvent?: (event: EventItem) => void;
}

const MultipleDayBody = ({
  onChange,
  onDateChanged,
  OutsideDateRangeComponent,
  unavailableHours,
  holidays,
  sendTimelineBorderToBack,
  onPressEvent,
  onLongPressEvent,
}: MultipleDayBodyProps) => {
  const {
    calendarSize,
    isRTL,
    maxTimelineHeight,
    timelineHeight,
    timelineWidth,
    pages,
    hourWidth,
    scrollVisibleHeight,
    numberOfColumns,
    theme,
    viewMode,
    delayLongPressToCreate,
    renderAheadItem,
    offsetY,
    verticalListRef,
  } = useCalendarKit();

  const { currentDateStart } = useNowIndicator();
  const { timelineRef, columnWidth, timelineAnimatedRef, initialOffset } =
    useMultipleDayView();
  const { onScroll, isPagingEnabled, snapToOffsets } = useSyncedLists({
    id: ListType.Timeline,
    onDateChanged,
    onChange,
  });
  const { normalEvents } = useEventsController();
  const _onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    offsetY.value = e.nativeEvent.contentOffset.y;
  };

  const _renderItem = ({ item }: RecyclerItem) => {
    const itemProps = {
      item,
      columnWidth,
      OutsideDateRangeComponent,
      unavailableHours,
      holidays,
      sendTimelineBorderToBack,
      onPressEvent,
      onLongPressEvent,
    };

    return <Timeline {...itemProps} events={normalEvents} />;
  };

  const animContentStyle = useAnimatedStyle(() => ({
    height: timelineHeight.value,
  }));

  const _onLayout = (e: LayoutChangeEvent) =>
    (scrollVisibleHeight.value = e.nativeEvent.layout.height);

  const extraData = useMemo(
    () => ({
      isRTL,
      timelineWidth,
      numberOfColumns,
      theme,
      maxTimelineHeight,
      delayLongPressToCreate,
      OutsideDateRangeComponent,
      holidays,
      unavailableHours,
      currentDateStart,
      normalEvents,
      onPressEvent,
      onLongPressEvent,
    }),
    [
      isRTL,
      timelineWidth,
      numberOfColumns,
      theme,
      maxTimelineHeight,
      delayLongPressToCreate,
      OutsideDateRangeComponent,
      holidays,
      unavailableHours,
      currentDateStart,
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
          <HoursColumn />
          <View
            style={[
              styles.absolute,
              {
                right: isRTL ? hourWidth : undefined,
                left: isRTL ? undefined : hourWidth,
                top: -START_OFFSET,
                width: timelineWidth,
              },
            ]}
          >
            <View style={{ width: timelineWidth }}>
              <RecyclerList
                ref={timelineRef}
                data={pages[viewMode].data}
                initialOffset={initialOffset}
                renderItem={_renderItem}
                listSize={{
                  width: timelineWidth,
                  height: maxTimelineHeight + START_OFFSET * 2,
                }}
                bounces={false}
                inverted={isRTL}
                animatedRef={timelineAnimatedRef}
                {...{ isPagingEnabled }}
                {...{ extraData }}
                {...{ snapToOffsets }}
                {...{ onScroll }}
                {...{ renderAheadItem }}
              />
            </View>
          </View>
        </Animated.View>
      </AnimatedScrollView>
    </Animated.View>
  );
};

export default React.memo(MultipleDayBody);

const styles = StyleSheet.create({
  container: { flex: 1 },
  absolute: { position: 'absolute' },
  left: { left: 0 },
  right: { right: 0 },
});
