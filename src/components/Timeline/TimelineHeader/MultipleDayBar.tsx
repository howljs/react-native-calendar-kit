import times from 'lodash/times';
import moment from 'moment-timezone';
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
  currentDate,
  tzOffset,
}: DayBarItemProps) => {
  const _renderDay = (dayIndex: number) => {
    const dateByIndex = moment.tz(startDate, tzOffset).add(dayIndex, 'd');
    const dateStr = dateByIndex.format('YYYY-MM-DD');
    const [dayNameText, dayNum] = dateByIndex
      .locale(locale)
      .format('ddd,DD')
      .split(',');
    const highlightDate = highlightDates?.[dateStr];

    const { dayName, dayNumber, dayNumberContainer } = getDayBarStyle(
      currentDate,
      dateByIndex,
      theme,
      highlightDate
    );

    return (
      <View
        key={`${startDate}_${dayIndex}`}
        style={[styles.dayItem, { width: columnWidth }]}
      >
        <Text
          allowFontScaling={theme.allowFontScaling}
          style={[styles.dayName, dayName]}
        >
          {dayNameText}
        </Text>
        <TouchableOpacity
          activeOpacity={0.6}
          disabled={!onPressDayNum}
          onPress={() => onPressDayNum?.(dateStr)}
          style={[styles.dayNumBtn, dayNumberContainer]}
        >
          <Text
            allowFontScaling={theme.allowFontScaling}
            style={[styles.dayNumber, dayNumber]}
          >
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
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    borderRadius: 14,
    width: 28,
    height: 28,
    backgroundColor: DEFAULT_PROPS.WHITE_COLOR,
  },
  dayName: { color: DEFAULT_PROPS.SECONDARY_COLOR, fontSize: 12 },
  dayNumber: { color: DEFAULT_PROPS.SECONDARY_COLOR, fontSize: 16 },
});
