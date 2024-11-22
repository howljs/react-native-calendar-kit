import merge from 'lodash.merge';
import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { DEFAULT_THEME } from '../constants';
import useLazyRef from '../hooks/useLazyRef';
import { createStore, type Store } from '../store/storeBuilder';
import { useSelector } from '../store/useSelector';
import type { DeepPartial, ThemeConfigs } from '../types';

export const ThemeContext = createContext<Store<ThemeConfigs> | undefined>(undefined);

interface ThemeProviderProps {
  theme?: DeepPartial<ThemeConfigs>;
}

const ThemeProvider: React.FC<PropsWithChildren<ThemeProviderProps>> = ({ children, theme }) => {
  const store = useLazyRef(() => createStore(merge({}, DEFAULT_THEME, theme))).current;

  useEffect(() => {
    const configs = merge({}, DEFAULT_THEME, theme);
    store.setState(configs);
  }, [store, theme]);

  return (
    <ThemeContext.Provider value={store}>
      <ThemedContainer children={children} />
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

const selectBackground = (state: ThemeConfigs) => state.colors.background;

const ThemedContainer: React.FC<PropsWithChildren<object>> = ({ children }) => {
  const backgroundColor = useTheme(selectBackground);
  return <View style={[styles.container, { backgroundColor }]}>{children}</View>;
};

const styles = StyleSheet.create({ container: { flex: 1 } });

export const useTheme = <T,>(selector: (state: ThemeConfigs) => T): T => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  const state = useSelector(theme.subscribe, theme.getState, selector);
  return state;
};
