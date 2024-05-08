import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useDayBar } from '../context/DayBarContext';
import { useTheme } from '../context/ThemeProvider';
import DayItem from './DayItem';
import LoadingOverlay from './Loading/Overlay';
import ProgressBar from './Loading/ProgressBar';
import Text from './Text';

interface SingleDayBarItemProps {
  startUnix: number;
}

const SingleDayBarItem = ({ startUnix }: SingleDayBarItemProps) => {
  const colors = useTheme((state) => state.colors);
  const { hourWidth, dayBarHeight, height } = useDayBar();

  const containerStyle = useAnimatedStyle(() => {
    return {
      height: dayBarHeight.value,
    };
  });

  return (
    <View>
      <Animated.View style={[styles.container, containerStyle]}>
        <View
          style={[
            styles.dayItemContainer,
            { width: hourWidth, borderRightColor: colors.border },
          ]}
        >
          <DayItem dateUnix={startUnix} height={height} />
        </View>
        <View style={styles.eventsContainer}>
          <Text>No events</Text>
        </View>
      </Animated.View>
      <LoadingOverlay />
      <ProgressBar />
    </View>
  );
};

export default SingleDayBarItem;

const styles = StyleSheet.create({
  container: { flexDirection: 'row' },
  dayItemContainer: { borderRightWidth: 1 },
  eventsContainer: { padding: 4 },
});
