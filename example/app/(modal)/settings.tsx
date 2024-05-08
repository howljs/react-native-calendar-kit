import React from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { useAppContext } from '../../context/AppProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

const themeModes = [
  { label: 'Auto', value: 'auto' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
] as const;

const days = [
  { label: 'Monday', value: 1 },
  { label: 'Saturday', value: 6 },
  { label: 'Sunday', value: 7 },
] as const;

const Settings = () => {
  const theme = useTheme();
  const { configs, updateConfigs } = useAppContext();

  const _renderSelect = (
    mode: {
      label: string;
      value: 'auto' | 'light' | 'dark';
    },
    index: number
  ) => {
    const isSelected = configs.themeMode === mode.value;
    const isLast = index === themeModes.length - 1;
    return (
      <React.Fragment key={mode.value}>
        <TouchableHighlight
          underlayColor={theme.colors.border}
          onPress={() => {
            updateConfigs({ themeMode: mode.value });
          }}
        >
          <View
            style={[
              styles.themeModeItem,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={[styles.themeModeLabel, { color: theme.colors.text }]}>
              {mode.label}
            </Text>
            {isSelected && (
              <MaterialCommunityIcons
                name="check"
                size={24}
                color={theme.colors.primary}
              />
            )}
          </View>
        </TouchableHighlight>
        {!isLast && (
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />
        )}
      </React.Fragment>
    );
  };

  const _renderDaySelect = (
    params: {
      label: string;
      value: 1 | 6 | 7;
    },
    index: number
  ) => {
    const isSelected = configs.startOfWeek === params.value;
    const isLast = index === themeModes.length - 1;
    return (
      <React.Fragment key={params.value}>
        <TouchableHighlight
          underlayColor={theme.colors.border}
          onPress={() => {
            updateConfigs({ startOfWeek: params.value });
          }}
        >
          <View
            style={[
              styles.themeModeItem,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={[styles.themeModeLabel, { color: theme.colors.text }]}>
              {params.label}
            </Text>
            {isSelected && (
              <MaterialCommunityIcons
                name="check"
                size={24}
                color={theme.colors.primary}
              />
            )}
          </View>
        </TouchableHighlight>
        {!isLast && (
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />
        )}
      </React.Fragment>
    );
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={[styles.heading, { color: theme.colors.text }]}>
          Theme Mode
        </Text>
        <View style={styles.card}>{themeModes.map(_renderSelect)}</View>
      </View>
      <View>
        <Text style={[styles.heading, { color: theme.colors.text }]}>
          Start of the week
        </Text>
        <View style={styles.card}>{days.map(_renderDaySelect)}</View>
      </View>
      <View style={[styles.toggleCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.toggleTitle, { color: theme.colors.text }]}>
          Show week number
        </Text>
        <Switch
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.primary,
          }}
          value={configs.showWeekNumber}
          onValueChange={(value) => {
            updateConfigs({ showWeekNumber: value });
          }}
        />
      </View>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 24, paddingHorizontal: 16, gap: 16 },
  heading: {
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 16,
  },
  card: { borderRadius: 10, overflow: 'hidden' },
  themeModeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
  },
  divider: { height: 1 },
  themeModeLabel: { fontWeight: '500' },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 10,
  },
  toggleTitle: {
    fontWeight: '500',
  },
});
