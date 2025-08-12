import React from 'react';
import { StyleSheet, View } from 'react-native';
import { EXTRA_HEIGHT } from '../../constants';
import { useBody } from '../../context/BodyContext';
import { ResourceItem } from '../../types';
import {
  DraggableEventProps,
  DraggableEventResource,
} from './ResourceDraggableEvent';

const ResourceOverlay = ({
  totalSize,
  resources,
  renderDraggableEvent,
}: {
  totalSize: number;
  resources: ResourceItem[];
  renderDraggableEvent?: (
    event: DraggableEventProps
  ) => React.ReactElement | null;
}) => {
  const { spaceFromTop } = useBody();
  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.absolute,
        { top: EXTRA_HEIGHT + spaceFromTop },
        styles.dragContainer,
      ]}>
      <DraggableEventResource
        resources={resources}
        totalSize={totalSize}
        renderDraggableEvent={renderDraggableEvent}
      />
    </View>
  );
};

export default ResourceOverlay;

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
  },
  dragContainer: {
    flex: 1,
  },
});
