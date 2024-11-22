import type { CalendarList } from '@calendar-kit/core';
import React from 'react';
import type { AnimatedRef, SharedValue } from 'react-native-reanimated';

export interface HeaderContextProps {
  dayBarHeight: number;
  numberOfDays: number;
  columnWidthAnim: SharedValue<number>;
  hourWidth: number;
  scrollByDay: boolean;
  columns: number;
  columnWidth: number;
  headerListRef: AnimatedRef<CalendarList>;
}

export const HeaderContext = React.createContext<HeaderContextProps | undefined>(undefined);

export const useHeader = () => {
  const context = React.useContext(HeaderContext);

  if (context === undefined) {
    throw new Error('DayBarContext is not available');
  }

  return context;
};
