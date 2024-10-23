import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerActions, useTheme } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import type { FC } from 'react';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  currentDate: SharedValue<string>;
  onPressToday?: () => void;
  onPressPrevious?: () => void;
  onPressNext?: () => void;
}

const Header: FC<HeaderProps> = ({
  currentDate,
  onPressToday,
  onPressPrevious,
  onPressNext,
}) => {
  const theme = useTheme();
  const { top: safeTop } = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const updateTitle = (date: string) => {
    const formatted = new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
    setTitle(formatted);
  };

  useAnimatedReaction(
    () => currentDate.value,
    (value) => {
      runOnJS(updateTitle)(value);
    },
    []
  );

  const _onPressMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View
      style={[
        styles.header,
        { paddingTop: safeTop + 16, backgroundColor: theme.colors.card },
      ]}>
      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.menuBtn}
        onPress={_onPressMenu}>
        <MaterialCommunityIcons
          name="menu"
          size={24}
          color={theme.colors.text}
        />
      </TouchableOpacity>
      <View style={styles.headerRightContent}>
        <View style={styles.navigation}>
          <TouchableOpacity hitSlop={8} onPress={onPressPrevious}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity hitSlop={8} onPress={onPressNext}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <TouchableOpacity
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          activeOpacity={0.6}
          onPress={onPressToday}>
          <MaterialCommunityIcons
            name="calendar"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    paddingHorizontal: 12,
  },
  menuBtn: { width: 40, alignItems: 'center' },
  headerRightContent: {
    flexDirection: 'row',
    flexGrow: 1,
    alignItems: 'center',
    flexShrink: 1,
  },
  headerTitle: { flexGrow: 1, flexShrink: 1, fontSize: 16, fontWeight: '500' },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 8,
  },
});
