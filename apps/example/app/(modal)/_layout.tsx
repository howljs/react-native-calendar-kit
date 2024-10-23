import { Stack } from 'expo-router';

const ModalLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="settings" options={{ headerTitle: 'Settings' }} />
    </Stack>
  );
};

export default ModalLayout;
