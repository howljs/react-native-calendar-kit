import React from 'react';
import type { SharedValue } from 'react-native-reanimated';
import { DataByMode } from '../utils/utils';
import type { Size } from './LayoutProvider';

export interface DayBarContextProps {
  height: number;
  numberOfDays: number;
  columnWidthAnim: SharedValue<number>;
  calendarLayout: Size;
  hourWidth: number;
  minuteHeight: SharedValue<number>;
  dayBarHeight: SharedValue<number>;
  isRTL: boolean;
  scrollByDay: boolean;
  columns: number;
  calendarData: DataByMode;
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
