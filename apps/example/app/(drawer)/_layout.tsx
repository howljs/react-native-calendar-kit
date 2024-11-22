import type { WeekdayNumbers } from '@calendar-kit/app';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import Drawer from 'expo-router/drawer';
import { StyleSheet, View } from 'react-native';

import { useAppContext } from '../../context/AppProvider';

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const theme = useTheme();
  const { updateConfigs } = useAppContext();
  const router = useRouter();

  const _onPressItem = (numberOfDays: number, hideWeekDays: WeekdayNumbers[] = []) => {
    updateConfigs({
      numberOfDays,
      hideWeekDays,
    });
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem label="Day" onPress={() => _onPressItem(1)} />
      <DrawerItem label="3 Days" onPress={() => _onPressItem(3)} />
      <DrawerItem label="4 Days" onPress={() => _onPressItem(4)} />
      <DrawerItem label="Week" onPress={() => _onPressItem(7)} />
      <DrawerItem label="Work week" onPress={() => _onPressItem(5, [6, 7])} />
      <DrawerItem label="Resources" onPress={() => _onPressItem(1)} />
      <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
      <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
      <DrawerItem
        label="Settings"
        onPress={() => {
          router.push('/settings');
        }}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  line: {
    height: 1,
  },
});

const DrawerLayout = () => {
  const _renderDrawer = (props: DrawerContentComponentProps) => <CustomDrawerContent {...props} />;

  return (
    <Drawer screenOptions={{ drawerType: 'front' }} drawerContent={_renderDrawer}>
      <Drawer.Screen
        name="index"
        options={{ headerShown: false }}
        initialParams={{ viewMode: '3 Days', numberOfDays: 3 }}
      />
    </Drawer>
  );
};

export default DrawerLayout;

export const getNavOptions = () => ({ title: 'Home' });
