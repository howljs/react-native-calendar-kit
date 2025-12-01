import React, { useMemo } from 'react';
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
  dateUnix?: number;
}

const BodyResourceItem = ({ resources, dateUnix }: BodyResourceItemProps) => {
  const { spaceFromTop, timelineHeight, spaceFromBottom } = useBody();
  const globalVisibleDateUnix = useDateChangedListener();

  const targetDateUnix = dateUnix ?? globalVisibleDateUnix;

  const visibleDates = useMemo(
    () => ({
      [targetDateUnix]: {
        diffDays: 0,
        unix: targetDateUnix,
      },
    }),
    [targetDateUnix]
  );

  const height = useDerivedValue(() => {
    return timelineHeight.value - spaceFromTop - spaceFromBottom;
  }, [spaceFromTop, spaceFromBottom]);

  const animView = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <View style={styles.container}>
      <ResourceBoard resources={resources} visibleDates={visibleDates} />
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.content,
          {
            left: 0,
            top: EXTRA_HEIGHT + spaceFromTop,
          },
          animView,
        ]}>
        <Events
          startUnix={targetDateUnix}
          visibleDates={visibleDates}
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
