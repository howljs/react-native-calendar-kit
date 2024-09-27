import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeProvider';
import { getWeekNumberOfYear } from '../utils/dateUtils';
import Text from './Text';
import { useTimezone } from '../context/TimeZoneProvider';

interface WeekNumberProps {
  date: SharedValue<number>;
}

const WeekNumber = ({ date }: WeekNumberProps) => {
  const { timeZone } = useTimezone();
  const theme = useTheme(
    useCallback(
      (state) => ({
        weekNumberBackgroundColor: state.colors.surface,
        weekNumber: state.weekNumber,
        weekNumberContainer: state.weekNumberContainer,
      }),
      []
    )
  );

  const [value, setValue] = useState<string | number>('');

  const _getWeekNumber = (newValue: number) => {
    setValue(getWeekNumberOfYear(newValue, timeZone));
  };

  useAnimatedReaction(
    () => date.value,
    (newValue, prevValue) => {
      if (newValue !== prevValue) {
        runOnJS(_getWeekNumber)(newValue);
      }
    },
    []
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.weekNumberBackgroundColor },
        theme.weekNumberContainer,
      ]}>
      <Text style={[styles.text, theme.weekNumber]}>{value}</Text>
    </View>
  );
};

export default WeekNumber;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#DADADA',
    marginHorizontal: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  text: { fontSize: 12, textAlign: 'center' },
});
