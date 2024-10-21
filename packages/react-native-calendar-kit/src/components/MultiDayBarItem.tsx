import React, { useCallback, useMemo } from 'react';
import type { GestureResponderEvent, TextStyle, ViewStyle } from 'react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { useActions } from '../context/ActionsProvider';
import { useHeader } from '../context/DayBarContext';
import { useAllDayEvents } from '../context/EventsProvider';
import { useTheme } from '../context/ThemeProvider';
import { useTimezone } from '../context/TimeZoneProvider';
import type {
  OnEventResponse,
  PackedAllDayEvent,
  SizeAnimation,
} from '../types';
import {
  dateTimeToISOString,
  forceUpdateZone,
  parseDateTime,
} from '../utils/dateUtils';
import DayItem from './DayItem';
import LoadingOverlay from './Loading/Overlay';
import ProgressBar from './Loading/ProgressBar';
import Text from './Text';
import Touchable from './Touchable';

interface MultiDayBarItemProps {
  pageIndex: number;
  startUnix: number;
  renderEvent?: (
    event: PackedAllDayEvent,
    size: SizeAnimation
  ) => React.ReactNode;
  renderDayItem?: (date: { dateUnix: number }) => React.ReactNode;
}

const MultiDayBarItem: React.FC<MultiDayBarItemProps> = ({
  pageIndex,
  startUnix,
  renderEvent,
  renderDayItem,
}) => {
  const dayBarStyles = useTheme(
    useCallback(
      (state) => ({
        borderColor: state.colors.border,
        dayBarContainer: state.dayBarContainer,
        allDayEventsContainer: state.allDayEventsContainer,
        headerBottomContainer: state.headerBottomContainer,
        countContainer: state.countContainer,
        countText: state.countText,
      }),
      []
    )
  );

  const {
    columnWidthAnim,
    dayBarHeight,
    calendarData,
    columns,
    numberOfDays,
    allDayEventsHeight,
    columnWidth,
  } = useHeader();
  const { timeZone } = useTimezone();
  const { onPressEvent, onPressBackground, onLongPressBackground } =
    useActions();

  const visibleDates = useMemo(() => {
    const data: Record<string, { unix: number }> = {};
    for (let i = 0; i < columns; i++) {
      const dateUnix = calendarData.visibleDatesArray[pageIndex + i];
      if (!dateUnix) {
        continue;
      }
      data[dateUnix] = { unix: dateUnix };
    }
    return data;
  }, [calendarData.visibleDatesArray, columns, pageIndex]);

  const { data: events, eventCounts } = useAllDayEvents(
    startUnix,
    numberOfDays,
    visibleDates
  );

  const _onPressBackground = (event: GestureResponderEvent) => {
    const columnIndex = Math.floor(event.nativeEvent.locationX / columnWidth);
    const dayIndex = pageIndex + columnIndex;
    const dayUnix = calendarData.visibleDatesArray[dayIndex];
    if (dayUnix) {
      const dateObj = forceUpdateZone(parseDateTime(dayUnix), timeZone);
      const dateString = dateTimeToISOString(dateObj);
      onPressBackground?.({ date: dateString }, event);
    }
  };

  const _onLongPressBackground = (event: GestureResponderEvent) => {
    const columnIndex = Math.floor(event.nativeEvent.locationX / columnWidth);
    const dayIndex = pageIndex + columnIndex;
    const dayUnix = calendarData.visibleDatesArray[dayIndex];
    if (dayUnix) {
      const dateObj = forceUpdateZone(parseDateTime(dayUnix), timeZone);
      const dateString = dateTimeToISOString(dateObj);
      onLongPressBackground?.({ date: dateString }, event);
    }
  };

  const eventsContainerStyle = useAnimatedStyle(() => ({
    height: allDayEventsHeight.value,
  }));

  const animStyle = useAnimatedStyle(() => ({
    width: columnWidthAnim.value,
  }));

  const _renderDayItem = (date: string) => {
    return (
      <Animated.View
        key={`column_${visibleDates[date].unix}`}
        pointerEvents="box-none"
        style={animStyle}>
        {renderDayItem ? (
          renderDayItem({ dateUnix: visibleDates[date].unix })
        ) : (
          <DayItem dateUnix={visibleDates[date].unix} />
        )}
      </Animated.View>
    );
  };

  const _renderEvent = (event: PackedAllDayEvent) => {
    return (
      <EventItem
        key={event.localId}
        event={event}
        onPressEvent={onPressEvent}
        renderEvent={renderEvent}
      />
    );
  };

  const _renderBottomColumn = (date: string) => {
    const count = eventCounts[date];
    return (
      <BottomColumn
        key={`bottom_${date}`}
        count={count}
        columnWidth={columnWidthAnim}
        borderColor={dayBarStyles.borderColor}
        countContainerStyle={dayBarStyles.countContainer}
        countTextStyle={dayBarStyles.countText}
      />
    );
  };

  const height = useDerivedValue(() => {
    return dayBarHeight + allDayEventsHeight.value;
  }, [dayBarHeight]);

  const containerHeight = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View style={containerHeight}>
      <View
        style={[
          styles.container,
          dayBarStyles.dayBarContainer,
          { height: dayBarHeight },
        ]}>
        {Object.keys(visibleDates).map(_renderDayItem)}
      </View>
      <Animated.View
        style={[dayBarStyles.allDayEventsContainer, eventsContainerStyle]}>
        <Touchable
          onPress={_onPressBackground}
          onLongPress={
            onLongPressBackground ? _onLongPressBackground : undefined
          }
          disabled={!onLongPressBackground && !onPressBackground}
          style={StyleSheet.absoluteFill}
        />
        {events.map(_renderEvent)}
      </Animated.View>
      <View
        style={[styles.bottomContainer, dayBarStyles.headerBottomContainer]}>
        {Object.keys(visibleDates).map(_renderBottomColumn)}
      </View>
      <LoadingOverlay />
      <ProgressBar />
    </Animated.View>
  );
};

export default MultiDayBarItem;

const BottomColumn = ({
  columnWidth,
  borderColor,
  count,
  countContainerStyle,
  countTextStyle,
}: {
  columnWidth: SharedValue<number>;
  borderColor: string;
  count?: number;
  countContainerStyle?: ViewStyle;
  countTextStyle?: TextStyle;
}) => {
  const { collapsedItems, isExpanded, headerBottomHeight } = useHeader();
  const isShowCount = count && count > collapsedItems;
  const animStyle = useAnimatedStyle(() => ({
    width: columnWidth.value,
  }));

  const countStyle = useAnimatedStyle(() => ({
    display: isExpanded.value ? 'none' : 'flex',
    width: '100%',
  }));

  return (
    <Animated.View style={animStyle}>
      <View style={[styles.bottomLine, { backgroundColor: borderColor }]} />
      {isShowCount && (
        <Animated.View
          style={[
            styles.countContainer,
            countContainerStyle,
            { height: headerBottomHeight },
            countStyle,
          ]}>
          <Text style={[styles.countText, countTextStyle]}>
            +{count - collapsedItems}
          </Text>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => {
              isExpanded.value = true;
            }}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
};

const EventItem = ({
  event,
  onPressEvent,
  renderEvent,
}: {
  event: PackedAllDayEvent;
  onPressEvent?: (event: OnEventResponse) => void;
  renderEvent?: (
    event: PackedAllDayEvent,
    size: SizeAnimation
  ) => React.ReactNode;
}) => {
  const {
    rightEdgeSpacing,
    columnWidthAnim,
    eventHeight: height,
    isExpanded,
    overlapEventsSpacing,
  } = useHeader();
  const { _internal, ...rest } = event;

  const eventWidth = useDerivedValue(
    () => _internal.columnSpan * columnWidthAnim.value - rightEdgeSpacing,
    [_internal.columnSpan, rightEdgeSpacing]
  );

  const isShow = useDerivedValue(() => {
    return isExpanded.value || _internal.rowIndex < 2;
  }, [_internal.rowIndex]);

  const eventHeight = useDerivedValue(() => {
    return isShow.value ? height.value - overlapEventsSpacing : 0;
  }, [overlapEventsSpacing]);

  const left = useDerivedValue(() => {
    return _internal.startIndex * columnWidthAnim.value;
  }, [_internal.startIndex]);

  const top = useDerivedValue(() => {
    return _internal.rowIndex * height.value;
  }, [_internal.rowIndex]);

  const eventContainerStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: left.value,
      width: eventWidth.value,
      top: top.value,
      height: eventHeight.value,
      opacity: isShow.value ? 1 : 0,
    };
  });

  const _onPressEvent = () => {
    if (onPressEvent) {
      onPressEvent(rest);
    }
  };

  return (
    <Animated.View style={eventContainerStyle}>
      <TouchableOpacity
        activeOpacity={0.6}
        disabled={!onPressEvent}
        onPress={_onPressEvent}
        style={[
          styles.eventContent,
          { backgroundColor: rest.color ?? '#ccc' },
          rest.containerStyle,
        ]}>
        {renderEvent ? (
          renderEvent(event, {
            width: eventWidth,
            height: eventHeight,
          })
        ) : (
          <Text style={[styles.eventTitle, rest.titleStyle]}>{rest.title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  eventContent: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: 2,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  eventTitle: { fontSize: 10, color: '#FFF', paddingHorizontal: 2 },
  bottomLine: {
    position: 'absolute',
    height: 16,
    width: 1,
    bottom: 0,
    left: 0,
  },
  bottomContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
  },
  countContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: { fontSize: 12 },
});
