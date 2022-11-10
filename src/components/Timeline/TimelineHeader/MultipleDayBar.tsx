import dayjs from 'dayjs';
import times from 'lodash/times';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLUMNS, DEFAULT_PROPS } from '../../../constants';
import type { DayBarItemProps } from '../../../types';
import { getDayBarStyle } from '../../../utils';

const MultipleDayBar = ({
  width,
  columnWidth,
  viewMode,
  startDate,
  onPressDayNum,
  theme,
  locale,
  highlightDates,
}: DayBarItemProps) => {
  const _renderDay = (dayIndex: number) => {
    const currentDate = dayjs(startDate).add(dayIndex, 'd');
    const dateStr = currentDate.format('YYYY-MM-DD');
    const [dayName, dayNum] = currentDate
      .locale(locale)
      .format('ddd,DD')
      .split(',');
    const highlightDate = highlightDates?.[dateStr];

    const { dayNameColor, dayNumberColor, dayNumberBackgroundColor } =
      getDayBarStyle(currentDate, theme, highlightDate);

    return (
      <View
        key={`${startDate}_${dayIndex}`}
        style={[styles.dayItem, { width: columnWidth }]}
      >
        <Text style={[styles.dayName, { color: dayNameColor }]}>{dayName}</Text>
        <TouchableOpacity
          activeOpacity={0.6}
          disabled={!onPressDayNum}
          onPress={() => onPressDayNum?.(dateStr)}
          style={[
            styles.dayNumBtn,
            { backgroundColor: dayNumberBackgroundColor },
          ]}
        >
          <Text style={[styles.dayNum, { color: dayNumberColor }]}>
            {dayNum}
          </Text>
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
