import times from 'lodash/times';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SharedValue, useSharedValue } from 'react-native-reanimated';
import { COLUMNS } from '../../../constants';
import type { CalendarViewMode, PackedEvent } from '../../../types';

const EVENT_HEIGHT = 18;

const MultipleDayBar = ({
  width,
  height,
  columnWidth,
  viewMode,
  startDate,
  events,
  renderEventContent,
}: {
  width: number;
  height: number;
  startDate: string;
  columnWidth: number;
  viewMode: CalendarViewMode;
  events: PackedEvent[][];
  renderEventContent?: (
    event: PackedEvent,
    timeIntervalHeight: SharedValue<number>
  ) => JSX.Element;
}) => {
  const eventHeight = useSharedValue(EVENT_HEIGHT);

  const _renderDay = (dayIndex: number) => {
    return (
      <View
        key={`${startDate}_${dayIndex}`}
        style={{
          width: columnWidth,
        }}
      >
        {!!events?.[dayIndex]?.length && (
          <ScrollView scrollEnabled horizontal={false}>
            {events?.[dayIndex]?.map((event) => (
              <View key={event.id} style={styles.defaultEventWrapper}>
                {renderEventContent ? (
                  renderEventContent?.(event, eventHeight)
                ) : (
                  <DefaultAllDayEvent event={event} />
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { width, height }]}>
      {times(COLUMNS[viewMode]).map(_renderDay)}
    </View>
  );
};

const DefaultAllDayEvent: React.FC<{
  event: PackedEvent;
}> = ({ event }) => (
  <View
    style={[
      styles.allDayEventContentContainer,
      { backgroundColor: event.color },
    ]}
  >
    <Text style={styles.allDayEventText} numberOfLines={1}>
      {event.title}
    </Text>
  </View>
);

export default MultipleDayBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  defaultEventWrapper: {
    height: EVENT_HEIGHT,
    marginRight: 8,
    marginBottom: 4,
  },
  allDayEventContentContainer: {
    height: EVENT_HEIGHT,
    borderRadius: 4,
    marginRight: 4,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  allDayEventText: {
    fontSize: 12,
    lineHeight: 12,
  },
});
