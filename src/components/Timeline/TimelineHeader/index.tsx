import { AnimatedFlashList, ListRenderItemInfo } from '@shopify/flash-list';
import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { DEFAULT_PROPS } from '../../../constants';
import { useTimelineCalendarContext } from '../../../context/TimelineProvider';
import type {
  DayBarItemProps,
  EventItem,
  HighlightDates,
  PackedEvent,
  TimelineProps,
} from '../../../types';
import AllDayBar from '../AllDayBar';
import MultipleDayBar from './MultipleDayBar';
import ProgressBar from './ProgressBar';
import SingleDayBar from './SingleDayBar';

interface TimelineHeaderProps {
  renderEventContent?: TimelineProps['renderEventContent'];
  renderDayBarLeftSection?: TimelineProps['renderDayBarLeftSection'];
  renderAllDayBarLeftSection?: TimelineProps['renderAllDayBarLeftSection'];
  renderDayBarItem?: (props: DayBarItemProps) => JSX.Element;
  dayBarItemHeight?: number;
  onPressDayNum?: (date: string) => void;
  isLoading?: boolean;
  highlightDates?: HighlightDates;
  selectedEventId?: string;
  events?: Record<string, EventItem[]>;
  onPressEvent?: (event: PackedEvent) => void;
}

const TimelineHeader = ({
  renderEventContent,
  renderDayBarLeftSection,
  renderAllDayBarLeftSection,
  renderDayBarItem,
  dayBarItemHeight,
  onPressDayNum,
  isLoading,
  highlightDates,
  selectedEventId,
  events,
  onPressEvent,
}: TimelineHeaderProps) => {
  const {
    syncedLists,
    viewMode,
    dayBarListRef,
    pages,
    timelineWidth,
    rightSideWidth,
    currentIndex,
    hourWidth,
    columnWidth,
    theme,
    locale,
    tzOffset,
    currentDate,
  } = useTimelineCalendarContext();

  const [startDate, setStartDate] = useState(
    pages[viewMode].data[pages[viewMode].index] || ''
  );

  const dayBarIndex = useRef(pages.week.index);

  const _renderSingleDayItem = ({
    item,
    extraData,
  }: ListRenderItemInfo<string>) => {
    const dayItemProps = {
      width: timelineWidth,
      startDate: item,
      columnWidth,
      hourWidth,
      viewMode,
      onPressDayNum,
      theme: extraData.theme,
      locale: extraData.locale,
      highlightDates: extraData.highlightDates,
      tzOffset,
      currentDate: extraData.currentDate,
    };

    if (renderDayBarItem) {
      return renderDayBarItem(dayItemProps);
    }

    return <SingleDayBar {...dayItemProps} />;
  };

  const _renderMultipleDayItem = ({
    item,
    extraData,
  }: ListRenderItemInfo<string>) => {
    const dayItemProps = {
      width: rightSideWidth,
      startDate: item,
      columnWidth,
      hourWidth,
      viewMode,
      onPressDayNum,
      theme: extraData.theme,
      locale: extraData.locale,
      highlightDates: extraData.highlightDates,
      tzOffset,
      currentDate: extraData.currentDate,
    };

    if (renderDayBarItem) {
      return renderDayBarItem(dayItemProps);
    }

    return <MultipleDayBar {...dayItemProps} />;
  };

  const extraValues = useMemo(
    () => ({ locale, highlightDates, theme, currentDate }),
    [locale, highlightDates, theme, currentDate]
  );

  const _renderDayBarList = () => {
    const listProps = {
      ref: dayBarListRef,
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

    if (viewMode === 'day') {
      return (
        <View style={{ width: timelineWidth, height: dayBarItemHeight }}>
          <AnimatedFlashList
            {...listProps}
            data={pages[viewMode].data}
            initialScrollIndex={pages[viewMode].index}
            estimatedItemSize={timelineWidth}
            estimatedListSize={{
              width: timelineWidth,
              height: dayBarItemHeight ?? DEFAULT_PROPS.DAY_BAR_HEIGHT,
            }}
            renderItem={_renderSingleDayItem}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const width = e.nativeEvent.layoutMeasurement.width;
              const pageIndex = Math.round(x / width);
              if (dayBarIndex.current !== pageIndex) {
                dayBarIndex.current = pageIndex;
              }
            }}
          />
        </View>
      );
    }

    return (
      <View style={styles.multipleDayContainer}>
        <View style={{ width: hourWidth }}>
          {renderDayBarLeftSection && renderDayBarLeftSection()}
        </View>
        <View style={{ width: rightSideWidth, height: dayBarItemHeight }}>
          <AnimatedFlashList
            {...listProps}
            data={pages[viewMode].data}
            initialScrollIndex={pages[viewMode].index}
            estimatedItemSize={rightSideWidth}
            estimatedListSize={{
              width: rightSideWidth,
              height: dayBarItemHeight ?? DEFAULT_PROPS.DAY_BAR_HEIGHT,
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
    if (viewMode === 'day') {
      return _renderSingleDayItem({
        item: startDate,
        extraData: extraValues,
        index: 0,
        target: 'Cell',
      });
    }
    return (
      <View style={styles.multipleDayContainer}>
        <View style={{ width: hourWidth }}>
          {renderDayBarLeftSection && renderDayBarLeftSection()}
        </View>
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
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {syncedLists ? _renderDayBarList() : _renderDayBarView()}
      {selectedEventId && <View style={styles.disabledFrame} />}
      {viewMode !== 'day' && events && Object.keys(events).length > 0 && (
        <AllDayBar
          height={36}
          events={events}
          renderEventContent={renderEventContent}
          renderAllDayBarLeftSection={renderAllDayBarLeftSection}
          onPressEvent={onPressEvent}
        />
      )}
      {isLoading && <ProgressBar barColor={theme.loadingBarColor} />}
    </View>
  );
};

export default TimelineHeader;

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 99,
  },
  multipleDayContainer: { flexDirection: 'row' },
  disabledFrame: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0)',
  },
});
