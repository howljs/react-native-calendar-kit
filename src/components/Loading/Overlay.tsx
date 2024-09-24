import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLoading } from '../../context/LoadingContext';

const LoadingOverlay = () => {
  const isLoading = useLoading();

  if (!isLoading) {
    return null;
  }

  return <View style={[StyleSheet.absoluteFill, styles.container]} />;
};

export default LoadingOverlay;

const styles = StyleSheet.create({
  container: { backgroundColor: 'rgba(0, 0, 0, 0)' },
});
