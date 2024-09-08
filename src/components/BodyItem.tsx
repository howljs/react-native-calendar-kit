import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { EXTRA_HEIGHT } from '../constants';
import { useBody } from '../context/BodyContext';
import DraggableEvent from './DraggableEvent';
import Events from './Events';
import LoadingOverlay from './Loading/Overlay';
import NowIndicator from './NowIndicator';
import TimelineBoard from './TimelineBoard';

interface MultipleBodyItemProps {
  pageIndex: number;
  startUnix: number;
}

const BodyItem = ({ pageIndex, startUnix }: MultipleBodyItemProps) => {
  const {
    spaceFromTop,
    timelineHeight,
    spaceFromBottom,
    hourWidth,
    numberOfDays,
    calendarData,
    columns,
  } = useBody();

  const visibleDates = useMemo(() => {
    let data: Record<string, { diffDays: number; unix: number }> = {};
    let diffDays = 1;
    for (let i = 0; i < columns; i++) {
      const currentUnix = calendarData.visibleDatesArray[pageIndex + i];
      if (currentUnix) {
        data[currentUnix] = {
          unix: currentUnix,
          diffDays: diffDays,
        };
        diffDays += 1;
      }
    }

    return data;
  }, [calendarData.visibleDatesArray, columns, pageIndex]);

  const leftSpacing = numberOfDays === 1 ? hourWidth : 0;

  const animView = useAnimatedStyle(() => ({
    height: timelineHeight.value - spaceFromTop - spaceFromBottom,
  }));

  return (
    <View style={styles.container}>
      <TimelineBoard
        pageIndex={pageIndex}
        dateUnix={startUnix}
        visibleDates={visibleDates}
      />
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.content,
          { left: leftSpacing, top: EXTRA_HEIGHT + spaceFromTop },
          animView,
        ]}
      >
        <Events startUnix={startUnix} visibleDates={visibleDates} />
        <NowIndicator startUnix={startUnix} visibleDates={visibleDates} />
        <DraggableEvent startUnix={startUnix} visibleDates={visibleDates} />
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
