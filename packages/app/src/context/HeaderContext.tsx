import React from 'react';
import type { SharedValue } from 'react-native-reanimated';

export interface HeaderContextProps {
  dayBarHeight: number;
  numberOfDays: number;
  columnWidthAnim: SharedValue<number>;
  hourWidth: number;
  columnWidth: number;
}

export const HeaderContext = React.createContext<HeaderContextProps | undefined>(undefined);

export const useHeader = () => {
  const context = React.useContext(HeaderContext);

  if (context === undefined) {
    throw new Error('DayBarContext is not available');
  }

  return context;
};
