import times from 'lodash/times';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { MONTH_COLUMNS, MONTH_ROWS, SECONDS_IN_DAY } from '../../constants';
import { useCalendarKit } from '../../context/CalendarKitProvider';
import { useNowIndicator } from '../../context/NowIndicatorProvider';
import WeekDay from './WeekDay';
import WeekInMonth from './WeekInMonth';

interface MonthViewItemProps {
  item: number;
  weekDaysByLocale: string[];
}

const MonthViewItem = ({
  item: monthIndex,
  weekDaysByLocale,
}: MonthViewItemProps) => {
  const { theme, isRTL, firstDayOfWeek, pages } = useCalendarKit();

  const { currentDateStart } = useNowIndicator();

  const _renderWeekDay = (weekDay: string) => {
    return <WeekDay key={`weekDay_${weekDay}`} weekDay={weekDay} />;
  };

  const minDateUnix = pages.month.minDate;
  const defaultStart = new Date(minDateUnix * 1000);
  defaultStart.setMonth(defaultStart.getMonth() + monthIndex);
  defaultStart.setDate(1);
  const defaultStartUnix = Math.floor(defaultStart.getTime() / 1000);
  const fDow = (7 + firstDayOfWeek) % 7;
  const defaultWeekDay = defaultStart.getDay();
  const diffBefore = (defaultWeekDay + 7 - fDow) % 7;
  const startDateOfMonth = defaultStartUnix - diffBefore * 86400;

  const todayPosition = useMemo(() => {
    let row = -1,
      column = -1;
    const endDateUnix =
      startDateOfMonth + MONTH_COLUMNS * MONTH_ROWS * SECONDS_IN_DAY;
    if (currentDateStart < startDateOfMonth || currentDateStart > endDateUnix) {
      return { row, column };
    }

    const diffDays = Math.floor(
      (currentDateStart - startDateOfMonth) / SECONDS_IN_DAY
    );
    if (diffDays < MONTH_COLUMNS) {
      row = 0;
      column = diffDays;
    } else {
      row = Math.floor((diffDays - column - 1) / MONTH_COLUMNS);
      column = diffDays % MONTH_COLUMNS;
    }
    return { row, column };
  }, [startDateOfMonth, currentDateStart]);

  const _renderWeek = (index: number) => {
    return (
      <WeekInMonth
        key={`week_${index}`}
        startDateOfMonth={startDateOfMonth}
        week={index}
        theme={theme}
        isRTL={isRTL}
        todayPosition={todayPosition}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.weekDays,
          { borderColor: theme.cellBorderColor },
          isRTL ? styles.rowReverse : styles.row,
        ]}
      >
        {weekDaysByLocale.map(_renderWeekDay)}
      </View>
      <View style={styles.daysContainer}>{times(MONTH_ROWS, _renderWeek)}</View>
    </View>
  );
};

export default MonthViewItem;

const styles = StyleSheet.create({
  container: { flex: 1 },
  weekDays: { height: 20, flexDirection: 'row', borderBottomWidth: 1 },
  daysContainer: { flexGrow: 1 },
  row: { flexDirection: 'row' },
  rowReverse: { flexDirection: 'row-reverse' },
});
