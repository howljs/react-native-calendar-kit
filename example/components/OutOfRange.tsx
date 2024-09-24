import { OutOfRangeProps } from '@howljs/calendar-kit';
import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

const OutOfRange: FC<OutOfRangeProps> = ({}) => {
  return <View style={styles.container} />;
};

export default OutOfRange;

const styles = StyleSheet.create({
  container: { width: '100%', height: '100%', backgroundColor: '#ccc' },
});
