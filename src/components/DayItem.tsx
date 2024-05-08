import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useActions } from '../context/ActionsProvider';
import { useHighlightDates } from '../context/HighlightDatesProvider';
import { useLocale } from '../context/LocaleProvider';
import { useNowIndicator } from '../context/NowIndicatorProvider';
import { useTheme } from '../context/ThemeProvider';
import { ThemeConfigs } from '../types';
import { dateTimeToISOString, parseDateTime } from '../utils/dateUtils';
import Text from './Text';

interface DayItemProps {
  dateUnix: number;
  height: number;
}

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
});

const DayItem: React.FC<DayItemProps> = ({ dateUnix, height }) => {
  const { weekDayShort } = useLocale();
  const { currentDateUnix } = useNowIndicator();
  const { onPressDayNumber } = useActions();
  const highlightDates = useHighlightDates(dateUnix);

  const date = useMemo(() => parseDateTime(dateUnix), [dateUnix]);

  const {
    colors,
    weekDayText,
    dayNumContainer,
    dayNumText,
    todayName,
    todayNumberContainer,
    todayNumber,
  } = useTheme(selectDayItemTheme);

  const isToday = dateUnix === currentDateUnix;

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
    const dateStr = dateTimeToISOString(date);
    onPressDayNumber?.(dateStr);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      disabled={!onPressDayNumber}
      onPress={_onDayPress}
    >
      <View style={[styles.dayContainer, { height }]}>
        <Text
          style={[
            styles.weekDayText,
            { color: colors.text },
            customStyle.dayText,
          ]}
        >
          {weekDayShort[date.weekday % 7]}
        </Text>

        <View style={[styles.dayNumContainer, customStyle.container]}>
          <Text
            style={[
              styles.dayNumText,
              { color: colors.text },
              customStyle.numText,
            ]}
          >
            {date.day}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default DayItem;

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
  },
  dayNumText: { fontSize: 16, fontWeight: '500' },
  weekDayText: { fontSize: 12, color: '#5F6267', marginBottom: 2 },
});
