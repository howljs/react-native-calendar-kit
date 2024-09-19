import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { COLLAPSED_ROW_COUNT, COUNT_CONTAINER_HEIGHT } from '../constants';
import { useActions } from '../context/ActionsProvider';
import { useDayBar } from '../context/DayBarContext';
import { useAllDayEventsByDay } from '../context/EventsProvider';
import { useTheme } from '../context/ThemeProvider';
import { EventItem as EventItemType, PackedAllDayEvent } from '../types';
import DayItem from './DayItem';
import ExpandButton from './ExpandButton';
import LoadingOverlay from './Loading/Overlay';
import ProgressBar from './Loading/ProgressBar';
import Text from './Text';

interface SingleDayBarItemProps {
  startUnix: number;
}

const SingleDayBarItem = ({ startUnix }: SingleDayBarItemProps) => {
  const colors = useTheme((state) => state.colors);
  const { hourWidth, height, allDayEventsHeight, useAllDayEvent } = useDayBar();
  const { data: events, eventCounts } = useAllDayEventsByDay(startUnix);
  const { onPressEvent } = useActions();
  const containerStyle = useAnimatedStyle(() => {
    return {
      height: Math.max(height, height + allDayEventsHeight.value),
    };
  });

  const _renderEvent = (event: PackedAllDayEvent) => {
    return (
      <EventItem
        key={event._internal.id}
        event={event}
        onPressEvent={onPressEvent}
      />
    );
  };

  return (
    <View>
      <Animated.View style={[styles.container, containerStyle]}>
        {!useAllDayEvent ? (
          <View style={styles.dayContainer}>
            <DayItem dateUnix={startUnix} />
          </View>
        ) : (
          <>
            <View
              style={[
                styles.dayItemContainer,
                { width: hourWidth, borderRightColor: colors.border },
              ]}
            >
              <DayItem dateUnix={startUnix} />
              <ExpandButton />
            </View>
            <View style={[styles.eventsContainer]}>
              <View style={styles.events}>{events.map(_renderEvent)}</View>
              {eventCounts > COLLAPSED_ROW_COUNT && (
                <EventCounts eventCounts={eventCounts} />
              )}
            </View>
          </>
        )}
      </Animated.View>
      <LoadingOverlay />
      <ProgressBar />
    </View>
  );
};

export default SingleDayBarItem;

const EventItem = ({
  event,
  onPressEvent,
}: {
  event: PackedAllDayEvent;
  onPressEvent?: (event: EventItemType) => void;
}) => {
  const { eventHeight, isExpanded } = useDayBar();
  const { _internal, ...rest } = event;
  const eventContainerStyle = useAnimatedStyle(() => {
    const isShow = isExpanded.value || _internal.rowIndex < 2;
    return {
      height: isShow ? eventHeight.value - 2 : 0,
      opacity: withTiming(isShow ? 1 : 0),
      marginBottom: 2,
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

const EventCounts = ({ eventCounts }: { eventCounts: number }) => {
  const { isExpanded } = useDayBar();

  const countContainerStyle = useAnimatedStyle(() => ({
    height: isExpanded.value ? 0 : COUNT_CONTAINER_HEIGHT - 10,
  }));

  return (
    <Animated.View style={[styles.countContainer, countContainerStyle]}>
      <TouchableOpacity
        onPress={() => {
          isExpanded.value = true;
        }}
        style={StyleSheet.absoluteFill}
      >
        <Text style={styles.countText}>
          {eventCounts - COLLAPSED_ROW_COUNT} more
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row' },
  dayItemContainer: { borderRightWidth: 1 },
  eventsContainer: { flexGrow: 1, paddingTop: 10 },
  eventContent: {
    width: ' 100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 2,
  },
  events: { flexShrink: 1 },
  countContainer: {
    paddingHorizontal: 4,
  },
  eventTitle: { fontSize: 12, color: '#FFF', paddingHorizontal: 2 },
  countText: { fontSize: 12, paddingHorizontal: 8 },
  dayContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
  },
});
