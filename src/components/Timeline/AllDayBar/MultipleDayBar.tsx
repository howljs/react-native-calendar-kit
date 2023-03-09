import times from 'lodash/times';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLUMNS, DEFAULT_PROPS } from '../../../constants';
import type {
  CalendarViewMode,
  HighlightDates,
  LocaleType,
  ThemeProperties,
} from '../../../types';
// import { getDayBarStyle } from '../../../utils';

const MultipleDayBar = ({
  width,
  height,
  columnWidth,
  viewMode,
  startDate,
}: {
  width: number;
  height: number;
  startDate: string;
  columnWidth: number;
  viewMode: CalendarViewMode;
  hourWidth: number;
  onPressDayNum?: (date: string) => void;
  theme: ThemeProperties;
  locale: LocaleType;
  highlightDates?: HighlightDates;
  tzOffset: number;
  currentDate: string;
}) => {
  const _renderDay = (dayIndex: number) => {
    // const dateByIndex = dayjs(startDate).add(dayIndex, 'd');
    // const dateStr = dateByIndex.format('YYYY-MM-DD');
    // const [dayNameText, dayNum] = dateByIndex
    //   .locale(locale)
    //   .format('ddd,DD')
    //   .split(',');
    // const highlightDate = highlightDates?.[dateStr];

    // const { dayName, dayNumber, dayNumberContainer } = getDayBarStyle(
    //   currentDate,
    //   dateByIndex,
    //   theme,
    //   highlightDate
    // );

    return (
      <View
        key={`${startDate}_${dayIndex}`}
        style={{
          width: columnWidth,
          flex: 1,
          backgroundColor: 'pink',
        }}
      >
        <View />
      </View>
    );
  };

  return (
    <View style={[styles.container, { width, height }]}>
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
