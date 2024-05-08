import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
} from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { EXTRA_HEIGHT, MILLISECONDS_IN_DAY } from '../../constants';
import { useActions } from '../../context/ActionsProvider';
import { useBody } from '../../context/BodyContext';
import { useTheme } from '../../context/ThemeProvider';
import { dateTimeToISOString, parseDateTime } from '../../utils/dateUtils';
import TimeColumn from '../TimeColumn';
import HorizontalLine from './HorizontalLine';
import OutOfRangeView from './OutOfRangeView';
import UnavailableHours from './UnavailableHours';
import VerticalLine from './VerticalLine';

interface TimelineBoardProps {
  dateUnix: number;
}

const TimelineBoard = ({ dateUnix }: TimelineBoardProps) => {
  const {
    totalSlots,
    timeIntervalHeight,
    spaceFromTop,
    hourWidth,
    start,
    columnWidthAnim,
    numberOfDays,
    calendarData,
    columns,
    onLongPressBackground,
  } = useBody();
  const colors = useTheme((state) => state.colors);
  const { onPressBackground } = useActions();

  const _renderVerticalLines = () => {
    let lines: React.ReactNode[] = [];
    for (let i = 0; i < columns; i++) {
      lines.push(
        <VerticalLine
          key={i}
          borderColor={colors.border}
          index={i}
          columnWidth={columnWidthAnim}
        />
      );
    }
    return lines;
  };

  const _renderHorizontalLines = () => {
    let rows: React.ReactNode[] = [];
    for (let i = 0; i < totalSlots; i++) {
      rows.push(
        <HorizontalLine
          key={i}
          borderColor={colors.border}
          index={i}
          height={timeIntervalHeight}
        />
      );

      rows.push(
        <HorizontalLine
          key={`${i}.5`}
          borderColor={colors.border}
          index={i + 0.5}
          height={timeIntervalHeight}
        />
      );
    }

    rows.push(
      <HorizontalLine
        key={totalSlots}
        borderColor={colors.border}
        index={totalSlots}
        height={timeIntervalHeight}
      />
    );
    return rows;
  };

  const onPress = (event: GestureResponderEvent) => {
    const dayIndex = Math.floor(
      event.nativeEvent.locationX / columnWidthAnim.value
    );
    const hour = event.nativeEvent.locationY / timeIntervalHeight.value;

    const dateByPosition = dateUnix + dayIndex * MILLISECONDS_IN_DAY;
    const dateObj = parseDateTime(dateByPosition).plus({
      hours: hour + start,
    });

    onPressBackground?.(dateTimeToISOString(dateObj));
  };

  const contentView = useAnimatedStyle(() => ({
    height: timeIntervalHeight.value * totalSlots,
  }));

  const _renderOutOfRangeView = () => {
    const minDate = calendarData.originalMinDateUnix;
    const diffMinDays = Math.floor((dateUnix - minDate) / MILLISECONDS_IN_DAY);
    if (diffMinDays < 0) {
      return <OutOfRangeView position="left" diffDays={-diffMinDays} />;
    }

    const maxDate = calendarData.originalMaxDateUnix;
    const diffMaxDays =
      Math.floor((maxDate - dateUnix) / MILLISECONDS_IN_DAY) + 1;
    if (diffMaxDays - columns < 0) {
      return (
        <OutOfRangeView position="right" diffDays={columns - diffMaxDays} />
      );
    }

    return null;
  };

  const _renderUnavailableHours = () => {
    return <UnavailableHours dateUnix={dateUnix} />;
  };

  return (
    <View style={styles.container}>
      {numberOfDays === 1 && (
        <View style={{ width: hourWidth }}>
          <TimeColumn />
        </View>
      )}
      <Animated.View
        style={[
          styles.calendarGrid,
          { marginTop: EXTRA_HEIGHT + spaceFromTop },
          contentView,
        ]}
      >
        <TouchableOpacity
          style={styles.touchable}
          activeOpacity={1}
          onPress={onPress}
          onLongPress={onLongPressBackground}
          disabled={!onPressBackground}
        />
        {_renderOutOfRangeView()}
        {_renderUnavailableHours()}
        {_renderHorizontalLines()}
      </Animated.View>
      {numberOfDays > 1 && _renderVerticalLines()}
    </View>
  );
};

export default React.memo(TimelineBoard);

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  calendarGrid: { flex: 1 },
  separator: {
    backgroundColor: '#2D2D2D',
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#626266',
    borderRightColor: '#626266',
    position: 'absolute',
  },
  touchableContainer: { flex: 1, flexDirection: 'row' },
  touchable: { flex: 1 },
});
