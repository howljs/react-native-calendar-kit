import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  type Theme,
} from '@react-navigation/native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  type FC,
  type PropsWithChildren,
} from 'react';
import { useColorScheme } from 'react-native';

type AppConfigs = {
  themeMode: 'light' | 'dark' | 'auto';
  startOfWeek: 1 | 6 | 7;
  showWeekNumber: boolean;
};

interface AppContextValue {
  configs: AppConfigs;
  updateConfigs: (props: Partial<AppConfigs>) => void;
}

const AppContext = React.createContext<AppContextValue | undefined>(undefined);

const AppProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [configs, setConfigs] = React.useState<AppConfigs>({
    themeMode: 'auto',
    startOfWeek: 1,
    showWeekNumber: true,
  });

  const colorScheme = useColorScheme();
  const themeValue = useMemo(() => {
    const darkTheme: Theme = {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        card: '#1A1B21',
        background: '#000',
        text: '#F1F0F7',
      },
    };
    if (configs.themeMode === 'auto') {
      return colorScheme === 'dark' ? darkTheme : DefaultTheme;
    }
    return configs.themeMode === 'dark' ? darkTheme : DefaultTheme;
  }, [colorScheme, configs.themeMode]);

  const _updateConfigs = useCallback((newConfigs: Partial<AppConfigs>) => {
    setConfigs((prev) => ({ ...prev, ...newConfigs }));
  }, []);

  useEffect(() => {}, []);

  const value = useMemo(() => {
    return {
      configs,
      updateConfigs: _updateConfigs,
    };
  }, [_updateConfigs, configs]);

  return (
    <AppContext.Provider value={value}>
      <ThemeProvider value={themeValue}>{children}</ThemeProvider>
    </AppContext.Provider>
  );
};

export default AppProvider;

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
