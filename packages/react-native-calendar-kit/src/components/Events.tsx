import type { FC } from 'react';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useActions } from '../context/ActionsProvider';
import { useBody } from '../context/BodyContext';
import {
  useDragEvent,
  useDragEventActions,
} from '../context/DragEventProvider';
import { useRegularEvents } from '../context/EventsProvider';
import { useTimezone } from '../context/TimeZoneProvider';
import type { PackedEvent } from '../types';
import { forceUpdateZone, parseDateTime } from '../utils/dateUtils';
import EventItem from './EventItem';

const Events: FC<{
  startUnix: number;
  visibleDates: Record<string, { diffDays: number; unix: number }>;
}> = ({ startUnix, visibleDates }) => {
  const { renderEvent, numberOfDays } = useBody();
  const { onPressEvent, onLongPressEvent } = useActions();
  const { draggingId, selectedEventId } = useDragEvent();
  const { timeZone } = useTimezone();
  const { triggerDragEvent } = useDragEventActions();
  const { data: events } = useRegularEvents(
    startUnix,
    numberOfDays,
    visibleDates
  );

  const _triggerDragEvent = useCallback(
    (event: PackedEvent) => {
      if (!event.start.dateTime || !event.end.dateTime) {
        return;
      }

      const eventStart = forceUpdateZone(
        event._internal.startUnix,
        timeZone
      ).startOf('day');
      const originalStart = forceUpdateZone(
        parseDateTime(event.start.dateTime, { zone: event.start.timeZone }),
        timeZone
      ).startOf('day');
      const startIndex = eventStart.diff(originalStart, 'days').days;
      triggerDragEvent!(
        {
          start: {
            dateTime: event.start.dateTime,
            timeZone: event.start.timeZone,
          },
          end: {
            dateTime: event.end.dateTime,
            timeZone: event.end.timeZone,
          },
          startIndex,
        },
        event
      );
    },
    [triggerDragEvent, timeZone]
  );

  const _onLongPressEvent = useCallback(
    (event: PackedEvent) => {
      const clonedEvent = { ...event, _internal: undefined };
      delete clonedEvent._internal;
      onLongPressEvent!(clonedEvent);
    },
    [onLongPressEvent]
  );

  if (events.length === 0) {
    return null;
  }

  const _renderEvent = (event: PackedEvent) => {
    return (
      <EventItem
        key={event.localId}
        event={event}
        startUnix={startUnix}
        renderEvent={renderEvent}
        onPressEvent={onPressEvent}
        onLongPressEvent={
          triggerDragEvent ? _triggerDragEvent : _onLongPressEvent
        }
        isDragging={
          draggingId === event.localId || selectedEventId === event.localId
        }
        visibleDates={visibleDates}
      />
    );
  };

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {events.map(_renderEvent)}
    </View>
  );
};

export default Events;
