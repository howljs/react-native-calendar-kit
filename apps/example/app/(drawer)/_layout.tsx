import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import Drawer from 'expo-router/drawer';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type CalendarViewModeConfig = {
  numberOfDays: number;
  resourcesAmount?: number;
  maxResourcesColumnsPerPage?: number;
};

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const theme = useTheme();
  const router = useRouter();

  const _onPressItem = (viewMode: string, config: CalendarViewModeConfig) => {
    router.setParams({
      maxResourcesColumnsPerPage: undefined,
      viewMode,
      ...config,
    });
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Day"
        onPress={() => _onPressItem('day', { numberOfDays: 1 })}
      />
      <DrawerItem
        label="3 Days"
        onPress={() => _onPressItem('week', { numberOfDays: 3 })}
      />
      <DrawerItem
        label="4 Days"
        onPress={() => _onPressItem('week', { numberOfDays: 4 })}
      />
      <DrawerItem
        label="Week"
        onPress={() => _onPressItem('week', { numberOfDays: 7 })}
      />
      <DrawerItem
        label="Work week"
        onPress={() => _onPressItem('week', { numberOfDays: 5 })}
      />
      <DrawerItem
        label="Resources"
        onPress={() =>
          _onPressItem('resources', {
            resourcesAmount: 9,
            numberOfDays: 1,
          })
        }
      />
      <DrawerItem
        label="Resources (Scrollable Columns)"
        onPress={() =>
          _onPressItem('resources', {
            resourcesAmount: 18,
            numberOfDays: 1,
            maxResourcesColumnsPerPage: 4,
          })
        }
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
