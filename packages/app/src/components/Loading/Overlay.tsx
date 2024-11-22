import { useLoading } from '@calendar-kit/core';
import { StyleSheet, View } from 'react-native';

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
