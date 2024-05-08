import { Stack } from 'expo-router';
import React from 'react';

const ModalLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="settings" options={{ headerTitle: 'Settings' }} />
    </Stack>
  );
};

export default ModalLayout;
