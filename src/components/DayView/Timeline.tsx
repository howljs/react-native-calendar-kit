import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { START_OFFSET } from '../../constants';
import { useCalendarKit } from '../../context/CalendarKitProvider';
import type {
  EventItem,
  PackedEvent,
  SpecialRegionProps,
  UnavailableHour,
} from '../../types';
import HoursColumn from '../Common/HoursColumn';
import NowIndicator from '../Common/NowIndicator';
import TimelineBoard from './TimelineBoard';
import TimelineBorder from './TimelineBorder';
import EventBlock from '../Common/EventBlock';
import { useNowIndicator } from '../../context/NowIndicatorProvider';

interface TimelineProps {
  item: number;
  onLongPressBackground?: () => void;
  unavailableHours?:
    | UnavailableHour[]
    | { [weekDay: string]: UnavailableHour[] };
  holidays?: string[] | { [date: string]: SpecialRegionProps };
  sendTimelineBorderToBack?: boolean;
  columnWidth: SharedValue<number>;
  events: PackedEvent[];
  onPressEvent?: (event: EventItem) => void;
  onLongPressEvent?: (event: EventItem) => void;
}

const Timeline = ({
  onLongPressBackground,
  unavailableHours,
  holidays,
  item,
  sendTimelineBorderToBack,
  columnWidth,
  events,
  onPressEvent,
  onLongPressEvent,
}: TimelineProps) => {
  const {
    timelineWidth,
    timelineHeight,
    hourWidth,
    isRTL,
    minuteHeight,
    start,
    end,
    rightEdgeSpacing,
    overlapEventsSpacing,
  } = useCalendarKit();
  const { showNowIndicator, currentDateStart } = useNowIndicator();

  const animView = useAnimatedStyle(() => ({ height: timelineHeight.value }));

  const _renderEvent = (event: PackedEvent) => {
    return (
      <EventBlock
        key={event.event.id}
        packedEvent={event}
        minuteHeight={minuteHeight}
        columnWidth={columnWidth}
        start={start}
        end={end}
        onPressEvent={onPressEvent}
        rightEdgeSpacing={rightEdgeSpacing}
        overlapEventsSpacing={overlapEventsSpacing}
        isRTL={isRTL}
        onLongPressEvent={onLongPressEvent}
      />
    );
  };

  return (
    <View
      style={[
        styles.container,
        isRTL ? styles.rowReverse : styles.row,
        { marginTop: START_OFFSET },
      ]}
    >
      <View style={{ width: hourWidth }}>
        <HoursColumn />
      </View>
      <Animated.View
        pointerEvents="box-none"
        style={[{ width: timelineWidth }, animView]}
      >
        <View
          pointerEvents="box-none"
          style={[
            StyleSheet.absoluteFill,
            !!sendTimelineBorderToBack && styles.z1,
          ]}
        >
          <TimelineBoard
            {...{ onLongPressBackground }}
            {...{ unavailableHours }}
            {...{ holidays }}
            visibleStartDate={item}
          />
        </View>
        <TimelineBorder />
        <View
          pointerEvents="box-none"
          style={[
            StyleSheet.absoluteFill,
            styles.z999,
            isRTL && { transform: [{ scaleX: -1 }] },
          ]}
        >
          {events.map(_renderEvent)}
          {showNowIndicator && currentDateStart === item && (
            <NowIndicator visibleStartDate={item} columnWidth={columnWidth} />
          )}
        </View>
      </Animated.View>
    </View>
  );
};

export default Timeline;

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  row: { flexDirection: 'row' },
  rowReverse: { flexDirection: 'row-reverse' },
  z1: { zIndex: 1 },
  z999: { zIndex: 999 },
});
