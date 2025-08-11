import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { EXTRA_HEIGHT } from '../constants';
import { useBody } from '../context/BodyContext';
import { useDateChangedListener } from '../context/VisibleDateProvider';
import { ResourceItem } from '../types';
import Events from './Events';
import LoadingOverlay from './Loading/Overlay';
import ResourceBoard from './Resource/ResourceBoard';

interface BodyResourceItemProps {
  resources: ResourceItem[];
}

const BodyResourceItem = ({ resources }: BodyResourceItemProps) => {
  const { spaceFromTop, hourWidth, timelineHeight, spaceFromBottom } =
    useBody();
  const visibleDateUnix = useDateChangedListener();

  const height = useDerivedValue(() => {
    return timelineHeight.value - spaceFromTop - spaceFromBottom;
  }, [spaceFromTop, spaceFromBottom]);

  const animView = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <View style={styles.container}>
      <ResourceBoard resources={resources} />
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.content,
          {
            left: resources ? 0 : Math.max(0, hourWidth - 1),
            top: EXTRA_HEIGHT + spaceFromTop,
          },
          animView,
        ]}>
        <Events
          startUnix={visibleDateUnix}
          visibleDates={{
            [visibleDateUnix]: {
              diffDays: 1,
              unix: visibleDateUnix,
            },
          }}
          resources={resources}
        />
      </Animated.View>
      <LoadingOverlay />
    </View>
  );
};

export default BodyResourceItem;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { position: 'absolute', width: '100%' },
});
