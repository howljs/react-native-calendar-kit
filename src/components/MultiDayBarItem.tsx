import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useDayBar } from '../context/DayBarContext';
import { useTheme } from '../context/ThemeProvider';
import DayItem from './DayItem';
import LoadingOverlay from './Loading/Overlay';
import ProgressBar from './Loading/ProgressBar';

interface MultiDayBarItemProps {
  pageIndex: number;
}

const MultiDayBarItem: React.FC<MultiDayBarItemProps> = ({ pageIndex }) => {
  const {
    columnWidthAnim,
    height,
    dayBarHeight,
    isRTL,
    calendarData,
    columns,
  } = useDayBar();

  const colors = useTheme((state) => state.colors);

  const animStyle = useAnimatedStyle(() => ({
    width: columnWidthAnim.value,
    height: dayBarHeight.value,
  }));

  const dates = useMemo(() => {
    let data = [];
    for (let i = 0; i < columns; i++) {
      const dateUnix = calendarData.visibleDatesArray[pageIndex + i];
      if (!dateUnix) {
        continue;
      }
      data.push(dateUnix);
    }
    return data;
  }, [calendarData.visibleDatesArray, columns, pageIndex]);

  const _renderColumn = (dateUnix: number) => {
    return (
      <Animated.View
        key={`column_${dateUnix}`}
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
        {dates.map(_renderColumn)}
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
