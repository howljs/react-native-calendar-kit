import * as React from 'react';

import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { Calendar } from './screens';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="DayView"
        onPress={() => {
          props.navigation.navigate('Calendar', { viewMode: 'day' });
        }}
      />
      <DrawerItem
        label="3-days"
        onPress={() => {
          props.navigation.navigate('Calendar', { viewMode: 'threeDays' });
        }}
      />
      <DrawerItem
        label="Week"
        onPress={() => {
          props.navigation.navigate('Calendar', { viewMode: 'week' });
        }}
      />
      <DrawerItem
        label="Work Week"
        onPress={() => {
          props.navigation.navigate('Calendar', { viewMode: 'workWeek' });
        }}
      />
    </DrawerContentScrollView>
  );
}

export default function App() {
  const _renderDrawerContent = (props: DrawerContentComponentProps) => (
    <CustomDrawerContent {...props} />
  );

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Calendar"
        useLegacyImplementation
        drawerContent={_renderDrawerContent}
        screenOptions={{ drawerType: 'front' }}
      >
        <Drawer.Screen
          name="Calendar"
          component={Calendar}
          options={{ title: 'Calendar', headerTitleAllowFontScaling: false }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
