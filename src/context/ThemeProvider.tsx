import merge from 'lodash/merge';
import React, {
  createContext,
  useContext,
  useEffect,
  type PropsWithChildren,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { DEFAULT_DARK_THEME, DEFAULT_THEME } from '../constants';
import useLazyRef from '../hooks/useLazyRef';
import { useSyncExternalStoreWithSelector } from '../hooks/useSyncExternalStoreWithSelector';
import { createStore, type Store } from '../storeBuilder';
import type { ThemeConfigs, DeepPartial } from '../types';

export const ThemeContext = createContext<Store<ThemeConfigs> | undefined>(
  undefined
);

interface ThemeProviderProps {
  theme?: DeepPartial<ThemeConfigs>;
  darkTheme?: DeepPartial<ThemeConfigs>;
  themeMode?: string;
}

const ThemeProvider: React.FC<PropsWithChildren<ThemeProviderProps>> = ({
  children,
  theme,
  themeMode,
  darkTheme,
}) => {
  const store = useLazyRef(() =>
    createStore(
      merge(
        {},
        themeMode === 'dark' ? DEFAULT_DARK_THEME : DEFAULT_THEME,
        themeMode === 'dark' ? darkTheme : theme
      )
    )
  ).current;

  useEffect(() => {
    const configs = merge(
      {},
      themeMode === 'dark' ? DEFAULT_DARK_THEME : DEFAULT_THEME,
      themeMode === 'dark' ? darkTheme : theme
    );
    store.setState(configs);
  }, [darkTheme, store, theme, themeMode]);

  return (
    <ThemeContext.Provider value={store}>
      <ThemedContainer children={children} />
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

const ThemedContainer: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const backgroundColor = useTheme((state) => state.colors.background);
  return (
    <View style={[styles.container, { backgroundColor }]}>{children}</View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1 } });

export const useTheme = <T extends unknown>(
  selector: (state: ThemeConfigs) => T
): T => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  const state = useSyncExternalStoreWithSelector(
    theme.subscribe,
    theme.getState,
    selector
  );
  return state;
};
