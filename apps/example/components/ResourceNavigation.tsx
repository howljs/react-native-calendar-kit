import { View, Text, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { useCalendar, useMethods } from '@howljs/calendar-kit';

const ResourceNavigation = () => {
  const { hourWidth } = useCalendar();
  const methods = useMethods();
  return (
    <View style={[styles.container, { paddingLeft: hourWidth }]}>
      <Pressable
        style={styles.button}
        onPress={() => methods.goToPrevResource(true)}>
        <Text>Previous</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => methods.goToNextResource(true)}>
        <Text>Next</Text>
      </Pressable>
    </View>
  );
};

export default ResourceNavigation;

const styles = StyleSheet.create({
  container: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 32,
  },
});
