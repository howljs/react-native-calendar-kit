import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeProvider';

const DragDot = ({ type }: { type: 'top' | 'bottom' }) => {
  const primaryColor = useTheme(
    useCallback((state) => state.colors.primary, [])
  );
  return (
    <View
      style={[
        styles.container,
        {
          top: type === 'top' ? -12 : undefined,
          bottom: type === 'bottom' ? -12 : undefined,
          left: type === 'top' ? -12 : undefined,
          right: type === 'bottom' ? -12 : undefined,
        },
      ]}
    >
      <View style={styles.dotBackground}>
        <View
          style={[
            styles.dotBackgroundOverlay,
            {
              position: undefined,
              backgroundColor: primaryColor,
            },
          ]}
        />
      </View>
      <View style={[styles.dotInner, { backgroundColor: primaryColor }]} />
    </View>
  );
};

export default DragDot;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotBackground: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  dotBackgroundOverlay: {
    width: 18,
    height: 18,
    borderRadius: 12,
    backgroundColor: '#FFF',
    opacity: 0.3,
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
});
