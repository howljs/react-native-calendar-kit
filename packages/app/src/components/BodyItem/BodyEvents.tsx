import { useRegularEventsByDay } from '@calendar-kit/core';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useBody } from '../../context/BodyContext';
import type { PackedEvent } from '../../types';
import { useBodyColumn } from './BodyItemContext';
import EventItem from './EventItem';

const BodyEvents = () => {
  const { item } = useBodyColumn();
  const events = useRegularEventsByDay(item);
  const { renderEvent } = useBody();

  if (events.length === 0) {
    return null;
  }

  const _renderEvent = (event: PackedEvent) => {
    return <EventItem key={event.localId} event={event} renderEvent={renderEvent} />;
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {events.map(_renderEvent)}
    </View>
  );
};

export default memo(BodyEvents);
