import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { EXTRA_HEIGHT } from '../constants';
import { useBody } from '../context/BodyContext';
import Events from './Events';
import LoadingOverlay from './Loading/Overlay';
import NowIndicator from './NowIndicator';
import TimelineBoard from './TimelineBoard';

interface MultipleBodyItemProps {
  startUnix: number;
}

const BodyItem = ({ startUnix }: MultipleBodyItemProps) => {
  const {
    spaceFromTop,
    timelineHeight,
    spaceFromBottom,
    hourWidth,
    numberOfDays,
  } = useBody();

  const leftSpacing = numberOfDays === 1 ? hourWidth : 0;

  const animView = useAnimatedStyle(() => ({
    height: timelineHeight.value - spaceFromTop - spaceFromBottom,
  }));

  return (
    <View style={styles.container}>
      <TimelineBoard dateUnix={startUnix} />
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.content,
          { left: leftSpacing, top: EXTRA_HEIGHT + spaceFromTop },
          animView,
        ]}
      >
        <Events startUnix={startUnix} />
        <NowIndicator startUnix={startUnix} />
      </Animated.View>
      <LoadingOverlay />
    </View>
  );
};

export default BodyItem;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { position: 'absolute', width: '100%' },
});
