import dayjs from 'dayjs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DEFAULT_PROPS } from '../../../constants';
import type { DayBarItemProps } from '../../../types';

const SingleDayBar = ({ width, startDate, theme }: DayBarItemProps) => {
  const _renderDay = () => {
    const currentDate = dayjs(startDate);
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
      <View style={styles.dayItem}>
        <Text style={[styles.dayName, { color: dayNumColor }]}>{dayName}</Text>
        <TouchableOpacity
          activeOpacity={0.6}
          disabled={true}
          onPress={() => {}}
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
      {_renderDay()}
    </View>
  );
};

export default SingleDayBar;

const styles = StyleSheet.create({
  container: { alignItems: 'center', flexDirection: 'row' },
  dayItem: { alignItems: 'center', flex: 1 },
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
