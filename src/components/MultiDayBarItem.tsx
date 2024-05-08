import times from 'lodash/times';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { MILLISECONDS_IN_DAY } from '../constants';
import { useDayBar } from '../context/DayBarContext';
import { useTheme } from '../context/ThemeProvider';
import DayItem from './DayItem';
import LoadingOverlay from './Loading/Overlay';
import ProgressBar from './Loading/ProgressBar';

interface MultiDayBarItemProps {
  startUnix: number;
}

const MultiDayBarItem: React.FC<MultiDayBarItemProps> = ({ startUnix }) => {
  const { columnWidthAnim, height, dayBarHeight, isRTL, columns } = useDayBar();

  const colors = useTheme((state) => state.colors);

  const animStyle = useAnimatedStyle(() => ({
    width: columnWidthAnim.value,
    height: dayBarHeight.value,
  }));

  const _renderColumn = (index: number) => {
    const dateUnix = startUnix + index * MILLISECONDS_IN_DAY;

    return (
      <Animated.View
        key={`column_${index}`}
        pointerEvents="box-none"
        style={animStyle}
      >
        <DayItem dateUnix={dateUnix} height={height} />
        <Animated.View
          style={[styles.bottomLine, { backgroundColor: colors.border }]}
        />
      </Animated.View>
    );
  };

  const containerStyle = useAnimatedStyle(() => ({
    height: dayBarHeight.value,
  }));

  const direction = isRTL ? 'rtl' : 'ltr';

  return (
    <Animated.View style={containerStyle}>
      <View style={[styles.container, { direction }]}>
        {times(columns).map(_renderColumn)}
      </View>
      <LoadingOverlay />
      <ProgressBar />
    </Animated.View>
  );
};

export default MultiDayBarItem;

const styles = StyleSheet.create({
  container: { flexDirection: 'row' },
  bottomLine: {
    position: 'absolute',
    height: 16,
    width: 1,
    bottom: -2,
    left: 0,
  },
  leftArea: {},
  absolute: { position: 'absolute' },
});
