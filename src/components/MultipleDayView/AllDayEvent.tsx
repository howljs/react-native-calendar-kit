import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { EventItem } from '../../types';

interface AllDayEventProps {
  event: EventItem;
  rightEdgeSpacing: number;
  overlapEventsSpacing: number;
  eventHeight: number;
  onPressEvent?: (event: EventItem) => void;
  onLongPressEvent?: (event: EventItem) => void;
  isRTL?: boolean;
  width: SharedValue<number>;
}

const AllDayEvent = ({
  event,
  rightEdgeSpacing,
  overlapEventsSpacing,
  eventHeight,
  onPressEvent,
  onLongPressEvent,
  isRTL,
  width,
}: AllDayEventProps) => {
  const animView = useAnimatedStyle(() => ({
    width: width.value,
  }));

  const _getEventProps = () => {
    const { startUnix, endUnix, ...otherProps } = event;
    const startDate = new Date(startUnix * 1000);
    const endDate = new Date(endUnix * 1000);
    const eventProps = {
      ...otherProps,
      originStart: event.start,
      originEnd: event.end,
      isAllDay: true,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
    return eventProps;
  };

  const _onPressItem = () => {
    const eventProps = _getEventProps();
    onPressEvent?.(eventProps);
  };

  const _onLongPressItem = () => {
    const eventProps = _getEventProps();
    onLongPressEvent?.(eventProps);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      disabled={!onPressEvent && !onLongPressEvent}
      onPress={_onPressItem}
      onLongPress={onLongPressEvent ? _onLongPressItem : undefined}
    >
      <Animated.View
        style={[
          styles.container,
          {
            height: eventHeight,
            backgroundColor: event.color,
            marginHorizontal: rightEdgeSpacing,
            marginBottom: overlapEventsSpacing,
          },
          isRTL ? styles.alignEnd : styles.alignStart,
          animView,
        ]}
      >
        <Text style={styles.title}>{event.title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default React.memo(AllDayEvent);

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 2, padding: 2 },
  title: { fontSize: 10 },
  alignStart: { alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
});
