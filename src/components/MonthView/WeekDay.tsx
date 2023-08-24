import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface WeekDayProps {
  weekDay: string;
}

const WeekDay = ({ weekDay }: WeekDayProps) => {
  return (
    <View style={styles.weekDayItem}>
      <Text style={styles.weekDayText}>{weekDay}</Text>
    </View>
  );
};

export default WeekDay;

const styles = StyleSheet.create({
  weekDayItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  weekDayText: { fontSize: 12 },
});
