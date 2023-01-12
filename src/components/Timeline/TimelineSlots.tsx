import { AnimatedFlashList, ListRenderItemInfo } from '@shopify/flash-list';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated as RNAnimated,
  GestureResponderEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  View,
  ViewabilityConfig,
  ViewToken,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useTimelineCalendarContext } from '../../context/TimelineProvider';
import type { EventItem, PackedEvent, UnavailableItemProps } from '../../types';
import DragEditItem from './DragEditItem';
import TimelineHours from './TimelineHours';
import TimelinePage from './TimelinePage';

interface TimelineSlotsProps {
  isDragging: boolean;
  onPressBackground?: (date: string, event: GestureResponderEvent) => void;
  onLongPressBackground?: (date: string, event: GestureResponderEvent) => void;
  onPressOutBackground?: (date: string, event: GestureResponderEvent) => void;
  onDateChanged?: (date: string) => void;
  isLoading?: boolean;
  holidays?: string[];
  events?: { [date: string]: EventItem[] };
  onPressEvent?: (eventItem: PackedEvent) => void;
  onLongPressEvent?: (eventItem: PackedEvent) => void;
  renderEventContent?: (
    event: PackedEvent,
    timeIntervalHeight: SharedValue<number>
  ) => JSX.Element;
  renderSelectedEventContent?: (
    event: PackedEvent,
    timeIntervalHeight: SharedValue<number>
  ) => JSX.Element;
  selectedEvent?: PackedEvent;
  onEndDragSelectedEvent?: (event: PackedEvent) => void;
  renderCustomUnavailableItem?: (props: UnavailableItemProps) => JSX.Element;
  editEventGestureEnabled?: boolean;
  EditIndicatorComponent?: JSX.Element;
}

const TimelineSlots = ({
  onDateChanged,
  isDragging,
  isLoading,
  holidays,
  events,
  selectedEvent,
  onEndDragSelectedEvent,
  editEventGestureEnabled = true,
  renderEventContent,
  renderSelectedEventContent,
  EditIndicatorComponent,
  ...other
}: TimelineSlotsProps) => {
  const {
    timelineVerticalListRef,
    spaceFromBottom,
    spaceFromTop,
    timeIntervalHeight,
    totalHours,
    timelineWidth,
    viewMode,
    timelineHorizontalListRef,
    maxTimeIntervalHeight,
    pages,
    syncedLists,
    dayBarListRef,
    currentIndex,
    rightSideWidth,
    offsetY,
    isScrolling,
    allowDragToCreate,
    pinchRef,
    currentDate,
  } = useTimelineCalendarContext();

  const contentContainerStyle = useAnimatedStyle(() => {
    const containerHeight =
      totalHours * timeIntervalHeight.value + spaceFromTop + spaceFromBottom;
    return { height: containerHeight };
  });

  const scrollX = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (!syncedLists) {
      scrollX.removeAllListeners();
      return;
    }
    scrollX.addListener((ev) => {
      dayBarListRef.current?.scrollToOffset({
        offset: ev.value,
        animated: false,
      });
    });
  });

  const _onHorizontalScroll = RNAnimated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: true,
      listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = e.nativeEvent.contentOffset.x;
        const width = e.nativeEvent.layoutMeasurement.width;
        const pageIndex = Math.round(x / width);
        if (currentIndex.value !== pageIndex) {
          currentIndex.value = pageIndex;
        }
      },
    }
  );

  const extraValues = useMemo(
    () => ({
      allowDragToCreate,
      isLoading,
      holidays,
      events,
      selectedEventId: selectedEvent?.id,
      currentDate,
    }),
    [
      allowDragToCreate,
      isLoading,
      holidays,
      events,
      selectedEvent?.id,
      currentDate,
    ]
  );

  const _renderPage = ({ item, extraData }: ListRenderItemInfo<string>) => {
    return (
      <TimelinePage
        startDate={item}
        isLoading={extraData?.isLoading}
        holidays={extraData?.holidays}
        events={extraData?.events}
        selectedEventId={extraData?.selectedEventId}
        renderEventContent={renderEventContent}
        currentDate={extraData.currentDate}
        {...other}
      />
    );
  };

  const _viewabilityConfig = useRef<ViewabilityConfig>({
    waitForInteraction: true,
    itemVisiblePercentThreshold: 99,
  }).current;

  const prevIndex = useRef(-1);
  const _onViewableItemsChanged = useRef(
    (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      if (info.viewableItems.length === 0) {
        prevIndex.current = info.changed[0]?.index ?? -1;
      } else {
        const isPressNavigator = info.changed.length === 2;
        const isDragList =
          prevIndex.current !== -1 &&
          prevIndex.current !== info.viewableItems[0]?.index;

        if (isPressNavigator || isDragList) {
          onDateChanged?.(info.viewableItems[0]?.item);
          prevIndex.current = -1;
        }

        setTimeout(() => {
          isScrolling.current = false;
        }, 1000);
      }
    }
  ).current;

  const _onVerticalScroll = ({
    nativeEvent: { contentOffset },
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    offsetY.value = contentOffset.y;
  };

  const _renderSlots = () => {
    const listProps = {
      ref: timelineHorizontalListRef,
      horizontal: true,
      showsHorizontalScrollIndicator: false,
      data: pages[viewMode].data,
      initialScrollIndex: pages[viewMode].index,
      pagingEnabled: true,
      scrollEventThrottle: 16,
      bounces: false,
      disableHorizontalListHeightMeasurement: true,
      extraData: extraValues,
      scrollEnabled: !isDragging && !selectedEvent?.id,
      viewabilityConfig: _viewabilityConfig,
      onViewableItemsChanged: _onViewableItemsChanged,
      renderItem: _renderPage,
      keyExtractor: (item: string) => item,
      onScroll: _onHorizontalScroll,
    };

    const listSize = {
      height:
        totalHours * maxTimeIntervalHeight + spaceFromTop + spaceFromBottom,
      width: viewMode === 'day' ? timelineWidth : rightSideWidth,
    };

    if (viewMode === 'day') {
      return (
        <View style={listSize}>
          <AnimatedFlashList
            estimatedItemSize={timelineWidth}
            estimatedListSize={listSize}
            {...listProps}
          />
        </View>
      );
    }

    return (
      <React.Fragment>
        <TimelineHours />
        <Animated.View style={listSize}>
          <AnimatedFlashList
            estimatedItemSize={rightSideWidth}
            estimatedListSize={listSize}
            {...listProps}
          />
        </Animated.View>
      </React.Fragment>
    );
  };

  return (
    <ScrollView
      ref={timelineVerticalListRef}
      waitFor={Platform.OS === 'android' ? pinchRef : undefined}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      style={styles.container}
      onScroll={_onVerticalScroll}
      scrollEnabled={!isDragging}
    >
      <Animated.View
        style={[
          styles.contentContainer,
          { width: timelineWidth },
          contentContainerStyle,
        ]}
      >
        {_renderSlots()}
      </Animated.View>
      {!!selectedEvent?.id && (
        <DragEditItem
          selectedEvent={selectedEvent}
          onEndDragSelectedEvent={onEndDragSelectedEvent}
          isEnabled={editEventGestureEnabled}
          EditIndicatorComponent={EditIndicatorComponent}
          renderEventContent={renderSelectedEventContent || renderEventContent}
        />
      )}
    </ScrollView>
  );
};

export default TimelineSlots;

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flexDirection: 'row' },
});
