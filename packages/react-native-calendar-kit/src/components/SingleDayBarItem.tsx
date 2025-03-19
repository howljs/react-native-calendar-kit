import React, { useCallback } from 'react';
import type { GestureResponderEvent, TextStyle, ViewStyle } from 'react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { COLLAPSED_ITEMS } from '../constants';
import { useActions } from '../context/ActionsProvider';
import { useHeader } from '../context/DayBarContext';
import { useAllDayEventsByDay } from '../context/EventsProvider';
import { useLocale } from '../context/LocaleProvider';
import { useTheme } from '../context/ThemeProvider';
import type {
  OnEventResponse,
  PackedAllDayEvent,
  SizeAnimation,
} from '../types';
import DayItem from './DayItem';
import ExpandButton from './ExpandButton';
import LoadingOverlay from './Loading/Overlay';
import ProgressBar from './Loading/ProgressBar';
import Text from './Text';
import {
  dateTimeToISOString,
  forceUpdateZone,
  parseDateTime,
} from '../utils/dateUtils';
import { useTimezone } from '../context/TimeZoneProvider';
import Touchable from './Touchable';

interface SingleDayBarItemProps {
  startUnix: number;
  renderExpandIcon?: (props: {
    isExpanded: SharedValue<boolean>;
  }) => React.ReactElement | null;
  renderEvent?: (
    event: PackedAllDayEvent,
    size: SizeAnimation
  ) => React.ReactNode;
  pageIndex: number;
  renderDayItem?: (date: { dateUnix: number }) => React.ReactNode;
}

const SingleDayBarItem = ({
  startUnix,
  renderExpandIcon,
  renderEvent,
  pageIndex,
  renderDayItem,
}: SingleDayBarItemProps) => {
  const dayBarStyles = useTheme(
    useCallback(
      (state) => ({
        borderColor: state.colors.border,
        singleDayContainer: state.singleDayContainer,
        singleDayEventsContainer: state.singleDayEventsContainer,
        countContainer: state.countContainer,
        countText: state.countText,
      }),
      []
    )
  );
  const {
    hourWidth,
    dayBarHeight,
    allDayEventsHeight,
    useAllDayEvent,
    isExpanded,
    isShowExpandButton,
    headerBottomHeight,
    columnWidth,
    calendarData,
  } = useHeader();
  const { timeZone } = useTimezone();
  const { data: events, eventCounts } = useAllDayEventsByDay(startUnix);
  const { onPressEvent, onPressBackground, onLongPressBackground } =
    useActions();

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

  const height = useDerivedValue(() => {
    return Math.max(
      dayBarHeight,
      allDayEventsHeight.value +
        (isExpanded.value ? 10 : headerBottomHeight + 10)
    );
  }, [dayBarHeight, headerBottomHeight]);

  const containerStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  const eventsContainerStyle = useAnimatedStyle(() => ({
    height: allDayEventsHeight.value,
  }));

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

  const _renderSingleDay = () => {
    if (useAllDayEvent) {
      return (
        <View style={[styles.container, dayBarStyles.singleDayContainer]}>
          <View
            style={[
              styles.dayItemContainer,
              { width: hourWidth, borderRightColor: dayBarStyles.borderColor },
            ]}>
            {renderDayItem ? (
              renderDayItem({ dateUnix: startUnix })
            ) : (
              <DayItem dateUnix={startUnix} />
            )}
            <ExpandButton
              isExpanded={isExpanded}
              isShowExpandButton={isShowExpandButton}
              renderExpandIcon={renderExpandIcon}
            />
          </View>
          <View style={styles.rightContainer}>
            <Touchable
              onPress={_onPressBackground}
              onLongPress={
                onLongPressBackground ? _onLongPressBackground : undefined
              }
              disabled={!onLongPressBackground && !onPressBackground}
              style={StyleSheet.absoluteFill}
            />
            <Animated.View
              style={[
                dayBarStyles.singleDayEventsContainer,
                eventsContainerStyle,
              ]}>
              {events.map(_renderEvent)}
            </Animated.View>
            {eventCounts > COLLAPSED_ITEMS && (
              <EventCounts
                eventCounts={eventCounts}
                countContainerStyle={dayBarStyles.countContainer}
                countTextStyle={dayBarStyles.countText}
              />
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.onlyDayContainer, dayBarStyles.singleDayContainer]}>
        {renderDayItem ? (
          renderDayItem({ dateUnix: startUnix })
        ) : (
          <DayItem dateUnix={startUnix} />
        )}
      </View>
    );
  };

  return (
    <Animated.View style={containerStyle}>
      {_renderSingleDay()}
      <LoadingOverlay />
      <ProgressBar />
    </Animated.View>
  );
};

export default SingleDayBarItem;

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
    eventHeight: height,
    isExpanded,
    columnWidthAnim,
    rightEdgeSpacing,
    overlapEventsSpacing,
  } = useHeader();
  const { _internal, ...rest } = event;
  const eventWidth = useDerivedValue(() => {
    return columnWidthAnim.value - rightEdgeSpacing;
  });

  const isShow = useDerivedValue(() => {
    return isExpanded.value || _internal.rowIndex < 2;
  }, [_internal.rowIndex]);

  const eventHeight = useDerivedValue(() => {
    return isShow.value ? height.value - overlapEventsSpacing : 0;
  }, [overlapEventsSpacing]);

  const eventContainerStyle = useAnimatedStyle(() => ({
    width: eventWidth.value,
    height: eventHeight.value,
    marginBottom: 2,
    opacity: withTiming(isShow.value ? 1 : 0),
  }));

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
          <Text
            style={[
              styles.eventTitle,
              rest.titleStyle,
              { color: rest.titleColor },
            ]}>
            {rest.title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const EventCounts = ({
  eventCounts,
  countContainerStyle,
  countTextStyle,
}: {
  eventCounts: number;
  countContainerStyle?: ViewStyle;
  countTextStyle?: TextStyle;
}) => {
  const { isExpanded, headerBottomHeight } = useHeader();
  const locale = useLocale();

  const countStyle = useAnimatedStyle(() => ({
    display: isExpanded.value ? 'none' : 'flex',
  }));

  return (
    <Animated.View
      style={[
        styles.countContainer,
        countContainerStyle,
        { height: headerBottomHeight },
        countStyle,
      ]}>
      <Text style={[styles.countText, countTextStyle]}>
        {locale.more.replace('{count}', `${eventCounts - COLLAPSED_ITEMS}`)}
      </Text>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        onPress={() => {
          isExpanded.value = true;
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexGrow: 1,
  },
  dayItemContainer: { borderRightWidth: 1 },
  rightContainer: { flexGrow: 1 },
  eventContent: {
    width: ' 100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 2,
  },
  countContainer: {
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  eventTitle: { fontSize: 12, color: '#FFF', paddingHorizontal: 2 },
  countText: { fontSize: 12, paddingHorizontal: 8 },
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  onlyDayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
});
