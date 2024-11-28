import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { useBodyItem } from '../../context/BodyContext';
import { useRegularEventsByDay } from '../../context/EventsProvider';
import type { PackedEvent } from '../../types';
import EventItemWrapper from './EventItemWrapper';

const BodyEvents = () => {
  const { item } = useBodyItem();
  const events = useRegularEventsByDay(item);

  const _renderEvent = useCallback((event: PackedEvent) => {
    return <EventItemWrapper key={event.localId} event={event} />;
  }, []);

  if (events.length === 0) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {events.map(_renderEvent)}
    </View>
  );
};

export default memo(BodyEvents);
