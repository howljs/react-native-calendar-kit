import React from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type { Size } from './LayoutProvider';
import type { CalendarViewMode } from '../types';

export interface DayBarContextProps {
  height: number;
  numberOfDays: number;
  columnWidthAnim: SharedValue<number>;
  calendarLayout: Size;
  viewMode: CalendarViewMode;
  hourWidth: number;
  minuteHeight: SharedValue<number>;
  dayBarHeight: SharedValue<number>;
  isRTL: boolean;
  scrollByDay: boolean;
  columns: number;
}

export const DayBarContext = React.createContext<
  DayBarContextProps | undefined
>(undefined);

export const useDayBar = () => {
  const context = React.useContext(DayBarContext);

  if (context === undefined) {
    throw new Error('DayBarContext is not available');
  }

  return context;
};
