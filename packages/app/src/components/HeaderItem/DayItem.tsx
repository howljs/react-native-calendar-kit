import {
  parseDateTimeUTC,
  useActions,
  useHighlightDates,
  useLocale,
  useNowIndicator,
  useTheme,
} from '@calendar-kit/core';
import { memo, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import type { ThemeConfigs } from '../../types';
import Text from '../Text';
import { useHeaderColumn } from './HeaderItemContext';

const selectDayItemTheme = (state: ThemeConfigs) => ({
  colors: state.colors,
  weekDayText: state.dayName,
  dayNumContainer: state.dayNumberContainer,
  dayNumText: state.dayNumber,
  todayName: state.todayName || { color: state.colors.text },
  todayNumberContainer: state.todayNumberContainer || {
    backgroundColor: state.colors.primary,
  },
  todayNumber: state.todayNumber || { color: state.colors.onPrimary },
  dayContainer: state.dayContainer,
});

const DayItem = () => {
  const { item } = useHeaderColumn();
  const { weekDayShort } = useLocale();
  const { currentDateUnix } = useNowIndicator();
  const { onPressDayNumber } = useActions();
  const highlightDates = useHighlightDates(item);

  const date = useMemo(() => parseDateTimeUTC(item), [item]);

  const {
    colors,
    weekDayText,
    dayNumContainer,
    dayNumText,
    todayName,
    todayNumberContainer,
    todayNumber,
    dayContainer,
  } = useTheme(selectDayItemTheme);

  const isToday = item === currentDateUnix;

  const customStyle = useMemo(() => {
    let container = isToday ? todayNumberContainer : dayNumContainer;
    let dayText = isToday ? todayName : weekDayText;
    let numText = isToday ? todayNumber : dayNumText;

    if (highlightDates) {
      const isOverride = isToday && highlightDates.isTodayOverride;
      if ((highlightDates && !isToday) || isOverride) {
        container = highlightDates?.dayNumberContainer ?? container;
        dayText = highlightDates?.dayName ?? dayText;
        numText = highlightDates?.dayNumber ?? numText;
      }
    }

    return { container, dayText, numText };
  }, [
    highlightDates,
    dayNumContainer,
    dayNumText,
    isToday,
    todayName,
    todayNumber,
    todayNumberContainer,
    weekDayText,
  ]);

  const _onDayPress = () => {
    onPressDayNumber?.(date.toISO());
  };

  return (
    <TouchableOpacity activeOpacity={0.6} disabled={!onPressDayNumber} onPress={_onDayPress}>
      <View style={[styles.dayContainer, dayContainer]}>
        <Text style={[styles.weekDayText, { color: colors.text }, customStyle.dayText]}>
          {weekDayShort[date.weekday % 7]}
        </Text>

        <View style={[styles.dayNumContainer, customStyle.container]}>
          <Text style={[styles.dayNumText, { color: colors.text }, customStyle.numText]}>
            {date.day}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(DayItem);

const styles = StyleSheet.create({
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  dayNumText: { fontSize: 16, fontWeight: '500' },
  weekDayText: { fontSize: 12, color: '#5F6267', marginBottom: 2 },
});
