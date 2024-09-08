import React, { FC, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useActions } from '../context/ActionsProvider';
import { useBody } from '../context/BodyContext';
import {
  useDragEvent,
  useDragEventActions,
} from '../context/DragEventProvider';
import { useRegularEvents } from '../context/EventsProvider';
import { useTimezone } from '../context/TimezoneProvider';
import { DragEventProps, PackedEvent } from '../types';
import { forceUpdateZone } from '../utils/dateUtils';
import EventItem from './EventItem';

const Events: FC<{
  startUnix: number;
  visibleDates: Record<string, { diffDays: number; unix: number }>;
}> = ({ startUnix, visibleDates }) => {
  const { renderEvent, numberOfDays } = useBody();
  const { onPressEvent, onLongPressEvent } = useActions();
  const { draggingId, selectedEventId } = useDragEvent();
  const { timezone } = useTimezone();
  const { triggerDragEvent } = useDragEventActions();
  const { data: events } = useRegularEvents(
    startUnix,
    numberOfDays,
    visibleDates
  );

  const _triggerDragEvent = useCallback(
    (event: PackedEvent) => {
      const eventStart = forceUpdateZone(
        event._internal.startUnix,
        timezone
      ).startOf('day');
      const originalStart = forceUpdateZone(event.start, timezone).startOf(
        'day'
      );
      const startIndex = eventStart.diff(originalStart, 'days').days;
      triggerDragEvent!(
        {
          start: event.start,
          end: event.end,
          startIndex,
        },
        event as DragEventProps
      );
    },
    [triggerDragEvent, timezone]
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
        key={event._internal.id}
        event={event}
        startUnix={startUnix}
        renderEvent={renderEvent}
        onPressEvent={onPressEvent}
        onLongPressEvent={
          triggerDragEvent ? _triggerDragEvent : _onLongPressEvent
        }
        isDragging={draggingId === event.id || selectedEventId === event.id}
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
