import dayjs from 'dayjs';
import times from 'lodash/times';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLUMNS, DEFAULT_PROPS } from '../../../constants';
import type { DayBarItemProps } from '../../../types';

const MultipleDayBar = ({
  width,
  columnWidth,
  viewMode,
  startDate,
  onPressDayNum,
  theme,
}: DayBarItemProps) => {
  const _renderDay = (dayIndex: number) => {
    const currentDate = dayjs(startDate).add(dayIndex, 'd');
    const dateStr = currentDate.format('YYYY-MM-DD');
    const isToday = currentDate.isSame(dayjs(), 'd');
    const [dayName, dayNum] = currentDate.format('ddd,DD').split(',');
    const color = isToday ? theme.todayTextColor : theme.dayTextColor;
    const bgColor = isToday
      ? theme.todayBackgroundColor
      : theme.backgroundColor;
    const dayNumColor = isToday
      ? theme.todayBackgroundColor
      : theme.dayTextColor;

    return (
      <View
        key={`${startDate}_${dayIndex}`}
        style={[styles.dayItem, { width: columnWidth }]}
      >
        <Text style={[styles.dayName, { color: dayNumColor }]}>{dayName}</Text>
        <TouchableOpacity
          activeOpacity={0.6}
          disabled={!onPressDayNum}
          onPress={() => onPressDayNum?.(dateStr)}
          style={[styles.dayNumBtn, { backgroundColor: bgColor }]}
        >
          <Text style={[styles.dayNum, { color }]}>{dayNum}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { width, height: DEFAULT_PROPS.DAY_BAR_HEIGHT },
      ]}
    >
      {times(COLUMNS[viewMode]).map(_renderDay)}
    </View>
  );
};

export default MultipleDayBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayItem: { alignItems: 'center' },
  dayNumBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginTop: 2,
  },
  dayName: { fontSize: 12 },
  dayNum: { fontSize: 16 },
});
