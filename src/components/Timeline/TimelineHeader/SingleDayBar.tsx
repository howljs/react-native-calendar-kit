import dayjs from 'dayjs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DEFAULT_PROPS } from '../../../constants';
import type { DayBarItemProps } from '../../../types';
import { getDayBarStyle } from '../../../utils';

const SingleDayBar = ({
  width,
  startDate,
  theme,
  locale,
  highlightDates,
}: DayBarItemProps) => {
  const _renderDay = () => {
    const currentDate = dayjs(startDate);
    const dateStr = currentDate.format('YYYY-MM-DD');
    const [dayName, dayNum] = currentDate
      .locale(locale)
      .format('ddd,DD')
      .split(',');
    const highlightDate = highlightDates?.[dateStr];

    const { dayNameColor, dayNumberColor, dayNumberBackgroundColor } =
      getDayBarStyle(currentDate, theme, highlightDate);

    return (
      <View style={styles.dayItem}>
        <Text style={[styles.dayName, { color: dayNameColor }]}>{dayName}</Text>
        <TouchableOpacity
          activeOpacity={0.6}
          disabled={true}
          onPress={() => {}}
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
