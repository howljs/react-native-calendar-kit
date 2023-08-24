import times from 'lodash/times';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { SECONDS_IN_DAY, START_OFFSET } from '../../constants';
import { useCalendarKit } from '../../context/CalendarKitProvider';
import { useNowIndicator } from '../../context/NowIndicatorProvider';
import {
  EventItem,
  PackedEvent,
  SpecialRegionProps,
  UnavailableHour,
} from '../../types';
import NowIndicator from '../Common/NowIndicator';
import TimelineBoard from './TimelineBoard';
import TimelineBorder from './TimelineBorder';
import TimelineColumn from './TimelineColumn';

interface TimelineProps {
  item: number;
  onLongPressBackground?: () => void;
  OutsideDateRangeComponent?: React.ReactElement;
  unavailableHours?:
    | UnavailableHour[]
    | { [weekDay: string]: UnavailableHour[] };
  holidays?: string[] | { [date: string]: SpecialRegionProps };
  sendTimelineBorderToBack?: boolean;
  columnWidth: SharedValue<number>;
  events: Record<string, PackedEvent[]>;
  onPressEvent?: (event: EventItem) => void;
  onLongPressEvent?: (event: EventItem) => void;
}

const Timeline = ({
  onLongPressBackground,
  item,
  OutsideDateRangeComponent,
  unavailableHours,
  holidays,
  sendTimelineBorderToBack,
  columnWidth,
  events,
  onPressEvent,
  onLongPressEvent,
}: TimelineProps) => {
  const { timelineWidth, timelineHeight, numberOfColumns, isRTL } =
    useCalendarKit();

  const { currentDateStart, showNowIndicator } = useNowIndicator();

  const animView = useAnimatedStyle(() => ({ height: timelineHeight.value }));

  const diffSeconds = currentDateStart - item;
  const maxSeconds = SECONDS_IN_DAY * numberOfColumns;

  const _renderDayColumn = (dayIndex: number) => {
    const dayUnix = item + dayIndex * SECONDS_IN_DAY;
    return (
      <TimelineColumn
        key={`event_${dayIndex}`}
        events={events[dayUnix] || []}
        dayIndex={dayIndex}
        onPressEvent={onPressEvent}
        onLongPressEvent={onLongPressEvent}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.absolute,
          { top: START_OFFSET, width: timelineWidth },
          !!sendTimelineBorderToBack && styles.z1,
          animView,
        ]}
      >
        <TimelineBoard
          {...{ onLongPressBackground }}
          {...{ OutsideDateRangeComponent }}
          {...{ unavailableHours }}
          {...{ holidays }}
          visibleStartDate={item}
        />
      </Animated.View>
      <TimelineBorder />
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.absolute,
          { top: START_OFFSET, width: timelineWidth },
          styles.z999,
          animView,
          isRTL && { transform: [{ scaleX: -1 }] },
        ]}
      >
        {times(numberOfColumns, _renderDayColumn)}
        {showNowIndicator && diffSeconds >= 0 && diffSeconds <= maxSeconds && (
          <NowIndicator columnWidth={columnWidth} visibleStartDate={item} />
        )}
      </Animated.View>
    </View>
  );
};

export default Timeline;

const styles = StyleSheet.create({
  container: { flex: 1 },
  absolute: { position: 'absolute' },
  z1: { zIndex: 1 },
  z999: { zIndex: 999 },
});
