import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import type { NavigationProp } from '@react-navigation/native';
import {
  DrawerActions,
  useNavigation,
  useTheme,
} from '@react-navigation/native';
import { useRouter } from 'expo-router';
import Drawer from 'expo-router/drawer';
import { StyleSheet, View } from 'react-native';

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation<NavigationProp<any>>();

  const _onPressItem = (viewMode: string, numberOfDays: number) => {
    router.setParams({ viewMode, numberOfDays: numberOfDays.toString() });
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem label="Day" onPress={() => _onPressItem('day', 1)} />
      <DrawerItem label="3 Days" onPress={() => _onPressItem('week', 3)} />
      <DrawerItem label="4 Days" onPress={() => _onPressItem('week', 4)} />
      <DrawerItem label="Week" onPress={() => _onPressItem('week', 7)} />
      <DrawerItem label="Work week" onPress={() => _onPressItem('week', 5)} />
      <DrawerItem
        label="Resources"
        onPress={() => _onPressItem('resources', 1)}
      />
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
  const _renderDrawer = (props: DrawerContentComponentProps) => (
    <CustomDrawerContent {...props} />
  );

  return (
    <Drawer
      screenOptions={{ drawerType: 'front' }}
      drawerContent={_renderDrawer}>
      <Drawer.Screen
        name="index"
        options={{ headerShown: false }}
        initialParams={{ viewMode: 'week', numberOfDays: 7 }}
      />
    </Drawer>
  );
};

export default DrawerLayout;

export const getNavOptions = () => ({ title: 'Home' });
