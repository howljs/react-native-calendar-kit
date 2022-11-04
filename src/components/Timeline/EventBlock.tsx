import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { PackedEvent } from '../../types';

export interface EventBlockProps {
  event: PackedEvent;
  dayIndex: number;
  columnWidth: number;
  onPressEvent?: (eventItem: PackedEvent) => void;
  onLongPressEvent?: (eventItem: PackedEvent) => void;
  timeIntervalHeight: SharedValue<number>;
  renderEventContent?: (event: PackedEvent) => void;
  selectedEventId?: string;
}

const EVENT_DEFAULT_COLOR = '#FFFFFF';

const EventBlock = ({
  event,
  dayIndex,
  columnWidth,
  onPressEvent,
  onLongPressEvent,
  timeIntervalHeight,
  renderEventContent,
  selectedEventId,
}: EventBlockProps) => {
  const _onLongPress = () => {
    const eventParams = {
      ...event,
      top: event.top * timeIntervalHeight.value,
      height: event.height * timeIntervalHeight.value,
      leftByIndex: columnWidth * dayIndex,
    };
    onLongPressEvent?.(eventParams);
  };

  const _onPress = () => {
    const eventParams = {
      ...event,
      top: event.top * timeIntervalHeight.value,
      height: event.height * timeIntervalHeight.value,
      leftByIndex: columnWidth * dayIndex,
    };
    onPressEvent?.(eventParams);
  };

  const eventStyle = useAnimatedStyle(() => ({
    top: event.top * timeIntervalHeight.value,
    height: event.height * timeIntervalHeight.value,
  }));

  const _renderEventContent = () => {
    return <Text style={styles.title}>{event.title}</Text>;
  };

  const eventOpacity = selectedEventId ? 0.6 : 1;

  return (
    <Animated.View
      style={[
        styles.eventBlock,
        {
          left: event.left + columnWidth * dayIndex,
          width: event.width,
          opacity: eventOpacity,
        },
        eventStyle,
      ]}
    >
      <TouchableOpacity
        delayLongPress={300}
        disabled={!!selectedEventId}
        onPress={_onPress}
        onLongPress={_onLongPress}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: event.color || EVENT_DEFAULT_COLOR },
        ]}
        activeOpacity={0.6}
      >
        {renderEventContent ? renderEventContent(event) : _renderEventContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default memo(EventBlock, (prev, next) => {
  const prevProps = pickBy(prev, (v) => typeof v !== 'function');
  const nextProps = pickBy(next, (v) => typeof v !== 'function');
  return isEqual(prevProps, nextProps);
});

const styles = StyleSheet.create({
  eventBlock: {
    position: 'absolute',
    borderRadius: 4,
    overflow: 'hidden',
  },
  title: { paddingVertical: 4, paddingHorizontal: 2, fontSize: 10 },
});
