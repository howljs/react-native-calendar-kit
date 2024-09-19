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
  eventHeight: Readonly<SharedValue<number>>;
  isRTL: boolean;
  scrollByDay: boolean;
  columns: number;
  calendarData: DataByMode;
  isExpanded: SharedValue<boolean>;
  allDayEventsHeight: Readonly<SharedValue<number>>;
  isShowExpandButton: SharedValue<boolean>;
  columnWidth: number;
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
