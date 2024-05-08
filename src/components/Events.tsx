import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { useBody } from '../context/BodyContext';
import { useRegularEvents } from '../context/EventsProvider';
import { PackedEvent } from '../types';
import EventItem from './EventItem';

const Events: FC<{ startUnix: number }> = ({ startUnix }) => {
  const { renderEvent, columns } = useBody();
  const { data: events } = useRegularEvents(startUnix, columns);
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
