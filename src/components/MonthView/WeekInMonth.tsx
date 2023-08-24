import times from 'lodash/times';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { MONTH_COLUMNS, SECONDS_IN_DAY } from '../../constants';
import { CalendarKitTheme } from '../../types';

interface MonthDayProps {
  theme: CalendarKitTheme;
  isRTL: boolean;
  startDateOfMonth: number;
  week: number;
  todayPosition: { row: number; column: number };
}

const WeekInMonth = ({
  theme,
  isRTL,
  startDateOfMonth,
  week,
  todayPosition,
}: MonthDayProps) => {
  const startDateByWeek =
    startDateOfMonth + week * MONTH_COLUMNS * SECONDS_IN_DAY;

  const _renderDay = (index: number) => {
    const dayUnix = startDateByWeek + index * SECONDS_IN_DAY;
    const dayNumber = new Date(dayUnix * 1000).getDate();

    const isToday =
      todayPosition.row === week && todayPosition.column === index;
    const dayStyle: ViewStyle = {
      borderLeftWidth: index === 0 ? 1 : 0,
      borderRightWidth: 1,
    };
    if (isRTL) {
      dayStyle.borderRightWidth = index === 0 ? 1 : 0;
      dayStyle.borderLeftWidth = 1;
    }

    return (
      <View
        key={`day_${dayNumber}`}
        style={[
          styles.dayItem,
          { borderColor: theme.cellBorderColor },
          dayStyle,
        ]}
      >
        <View
          style={[
            styles.dayTextContainer,
            { backgroundColor: isToday ? theme.primaryColor : undefined },
          ]}
        >
          <Text
            style={[
              styles.dayText,
              { color: isToday ? theme.backgroundColor : undefined },
            ]}
          >
            {dayNumber}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.rowContainer,
        { borderColor: theme.cellBorderColor },
        isRTL ? styles.rowReverse : styles.row,
      ]}
    >
      {times(MONTH_COLUMNS, _renderDay)}
    </View>
  );
};

export default WeekInMonth;

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  rowReverse: { flexDirection: 'row-reverse' },
  rowContainer: { flex: 1, flexDirection: 'row', borderBottomWidth: 1 },
  dayItem: { flexGrow: 1 },
  borderRight: { borderRightWidth: 1 },
  dayTextContainer: {
    width: 18,
    height: 18,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginTop: 2,
  },
  dayText: { fontSize: 10, fontWeight: '500' },
});
