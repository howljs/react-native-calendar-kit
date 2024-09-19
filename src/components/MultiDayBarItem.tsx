import React, { useMemo } from 'react';
import {
  GestureResponderEvent,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  runOnUI,
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { COLLAPSED_ROW_COUNT, COUNT_CONTAINER_HEIGHT } from '../constants';
import { useDayBar } from '../context/DayBarContext';
import { useAllDayEvents } from '../context/EventsProvider';
import { useTheme } from '../context/ThemeProvider';
import { PackedAllDayEvent, EventItem as EventItemType } from '../types';
import DayItem from './DayItem';
import LoadingOverlay from './Loading/Overlay';
import ProgressBar from './Loading/ProgressBar';
import Text from './Text';
import { useActions } from '../context/ActionsProvider';
import {
  dateTimeToISOString,
  forceUpdateZone,
  parseDateTime,
} from '../utils/dateUtils';
import { useTimezone } from '../context/TimezoneProvider';

interface MultiDayBarItemProps {
  pageIndex: number;
  startUnix: number;
}

const MultiDayBarItem: React.FC<MultiDayBarItemProps> = ({
  pageIndex,
  startUnix,
}) => {
  const {
    columnWidthAnim,
    height,
    isRTL,
    calendarData,
    columns,
    numberOfDays,
    eventHeight,
    isExpanded,
    allDayEventsHeight,
    columnWidth,
  } = useDayBar();
  const { timezone } = useTimezone();
  const { onPressEvent, onPressBackground, onLongPressBackground } =
    useActions();

  const visibleDates = useMemo(() => {
    let data: Record<string, { unix: number }> = {};
    for (let i = 0; i < columns; i++) {
      const dateUnix = calendarData.visibleDatesArray[pageIndex + i];
      if (!dateUnix) {
        continue;
      }
      data[dateUnix] = { unix: dateUnix };
    }
    return data;
  }, [calendarData.visibleDatesArray, columns, pageIndex]);

  const colors = useTheme((state) => state.colors);
  const { data: events, eventCounts } = useAllDayEvents(
    startUnix,
    numberOfDays,
    visibleDates
  );

  const animStyle = useAnimatedStyle(() => ({
    width: columnWidthAnim.value,
  }));

  const _renderColumn = (date: string) => {
    return (
      <Animated.View
        key={`column_${visibleDates[date]!.unix}`}
        pointerEvents="box-none"
        style={animStyle}
      >
        <DayItem dateUnix={visibleDates[date]!.unix} />
      </Animated.View>
    );
  };

  const _toggleExpand = () => {
    runOnUI(() => {
      isExpanded.value = !isExpanded.value;
    })();
  };

  const countContainerStyle = useAnimatedStyle(() => ({
    width: columnWidthAnim.value,
    height: isExpanded.value ? 0 : COUNT_CONTAINER_HEIGHT,
  }));

  const _renderCount = (date: string) => {
    const count = eventCounts[date];
    if (!count || count <= COLLAPSED_ROW_COUNT) {
      return null;
    }

    return (
      <Animated.View key={`count_${date}`} style={countContainerStyle}>
        <TouchableOpacity
          style={[StyleSheet.absoluteFill, styles.countContainer]}
          onPress={_toggleExpand}
        >
          <Text style={styles.countText}>+{count - COLLAPSED_ROW_COUNT}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const containerStyle = useAnimatedStyle(() => ({
    height: height + allDayEventsHeight.value + 8,
    width: '100%',
  }));

  const direction = isRTL ? 'rtl' : 'ltr';

  const eventsContainerStyle = useAnimatedStyle(() => ({
    height: allDayEventsHeight.value,
  }));

  const _renderLine = (date: string, index: number) => {
    return (
      <BottomLine
        key={`line_${date}`}
        index={index}
        columnWidth={columnWidthAnim}
        color={colors.border}
      />
    );
  };

  const _onPressBackground = (event: GestureResponderEvent) => {
    const columnIndex = Math.floor(event.nativeEvent.locationX / columnWidth);
    const dayIndex = pageIndex + columnIndex;
    const dayUnix = calendarData.visibleDatesArray[dayIndex];
    if (dayUnix) {
      const dateObj = forceUpdateZone(parseDateTime(dayUnix), timezone);
      const dateString = dateTimeToISOString(dateObj);
      onPressBackground?.({ date: dateString, isAllDay: true }, event);
    }
  };

  const _onLongPressBackground = (event: GestureResponderEvent) => {
    const columnIndex = Math.floor(event.nativeEvent.locationX / columnWidth);
    const dayIndex = pageIndex + columnIndex;
    const dayUnix = calendarData.visibleDatesArray[dayIndex];
    if (dayUnix) {
      const dateObj = forceUpdateZone(parseDateTime(dayUnix), timezone);
      const dateString = dateTimeToISOString(dateObj);
      onLongPressBackground?.({ date: dateString, isAllDay: true }, event);
    }
  };

  return (
    <Animated.View style={containerStyle}>
      <View style={[styles.container, { direction }]}>
        {Object.keys(visibleDates).map(_renderColumn)}
      </View>
      <Animated.View style={[styles.eventsContainer, eventsContainerStyle]}>
        <TouchableWithoutFeedback
          onPress={_onPressBackground}
          onLongPress={
            onLongPressBackground ? _onLongPressBackground : undefined
          }
          disabled={!onLongPressBackground && !onPressBackground}
        >
          <View style={styles.eventsInnerContainer}>
            {events.map((event) => (
              <EventItem
                key={event._internal.id}
                event={event}
                columnWidth={columnWidthAnim}
                visibleColumns={columns}
                eventHeight={eventHeight}
                isExpanded={isExpanded}
                onPressEvent={onPressEvent}
              />
            ))}
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.countsContainer}>
          {Object.keys(visibleDates).map(_renderCount)}
        </View>
      </Animated.View>
      <View style={styles.linesContainer}>
        {Object.keys(visibleDates).map(_renderLine)}
      </View>
      <LoadingOverlay />
      <ProgressBar />
    </Animated.View>
  );
};

export default MultiDayBarItem;

const BottomLine = ({
  index,
  columnWidth,
  color,
}: {
  index: number;
  columnWidth: SharedValue<number>;
  color: string;
}) => {
  const animStyle = useAnimatedStyle(() => ({
    left: index * columnWidth.value,
  }));

  return (
    <Animated.View
      style={[styles.bottomLine, animStyle, { backgroundColor: color }]}
    />
  );
};

const EventItem = ({
  event,
  columnWidth,
  eventHeight,
  isExpanded,
  onPressEvent,
}: {
  event: PackedAllDayEvent;
  columnWidth: SharedValue<number>;
  visibleColumns: number;
  eventHeight: SharedValue<number>;
  isExpanded: SharedValue<boolean>;
  onPressEvent?: (event: EventItemType) => void;
}) => {
  const { _internal, ...rest } = event;
  const eventContainerStyle = useAnimatedStyle(() => {
    const isShow = isExpanded.value || _internal.rowIndex < 2;
    return {
      position: 'absolute',
      left: _internal.startIndex * columnWidth.value,
      width: _internal.columnSpan * columnWidth.value,
      top: _internal.rowIndex * eventHeight.value,
      height: isShow ? eventHeight.value : 0,
      opacity: withTiming(isShow ? 1 : 0),
    };
  });

  const _onPressEvent = () => {
    if (onPressEvent) {
      onPressEvent(rest);
    }
  };

  return (
    <Animated.View style={eventContainerStyle}>
      <TouchableOpacity activeOpacity={0.6} onPress={_onPressEvent}>
        <View
          style={[
            styles.eventContent,
            { backgroundColor: rest.color ?? '#ccc' },
          ]}
        >
          <Text numberOfLines={1} style={styles.eventTitle}>
            {rest.title}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row' },
  absolute: { position: 'absolute' },
  eventsContainer: {
    marginTop: 4,
  },
  eventContent: {
    width: ' 100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 2,
  },
  eventTitle: { fontSize: 12, color: '#FFF', paddingHorizontal: 2 },
  eventsInnerContainer: { flexGrow: 1 },
  linesContainer: {
    flexDirection: 'row',
  },
  bottomLine: {
    position: 'absolute',
    height: 20,
    width: 1,
    bottom: 0,
  },
  countsContainer: {
    flexDirection: 'row',
  },
  countContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: { fontSize: 12 },
});
