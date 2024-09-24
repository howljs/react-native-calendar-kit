import React, { useCallback } from 'react';
import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  SharedValue,
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
import { OnEventResponse, PackedAllDayEvent, SizeAnimation } from '../types';
import DayItem from './DayItem';
import ExpandButton from './ExpandButton';
import LoadingOverlay from './Loading/Overlay';
import ProgressBar from './Loading/ProgressBar';
import Text from './Text';

interface SingleDayBarItemProps {
  startUnix: number;
  renderExpandIcon?: (props: {
    isExpanded: SharedValue<boolean>;
  }) => React.ReactElement | null;
  renderEvent?: (
    event: PackedAllDayEvent,
    size: SizeAnimation
  ) => React.ReactNode;
}

const SingleDayBarItem = ({
  startUnix,
  renderExpandIcon,
  renderEvent,
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
  } = useHeader();
  const { data: events, eventCounts } = useAllDayEventsByDay(startUnix);
  const { onPressEvent } = useActions();

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

  const _renderSingleDay = () => {
    if (useAllDayEvent) {
      return (
        <View style={styles.container}>
          <View
            style={[
              styles.dayItemContainer,
              { width: hourWidth, borderRightColor: dayBarStyles.borderColor },
            ]}
          >
            <DayItem dateUnix={startUnix} />
            <ExpandButton
              isExpanded={isExpanded}
              isShowExpandButton={isShowExpandButton}
              renderExpandIcon={renderExpandIcon}
            />
          </View>
          <View style={styles.rightContainer}>
            <Animated.View
              style={[
                dayBarStyles.singleDayEventsContainer,
                eventsContainerStyle,
              ]}
            >
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

    return <DayItem dateUnix={startUnix} />;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        dayBarStyles.singleDayContainer,
        containerStyle,
      ]}
    >
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
        ]}
      >
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
      ]}
    >
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
});
