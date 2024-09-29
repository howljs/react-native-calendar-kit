import React from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type { DataByMode } from '../utils/utils';
import type { Size } from './LayoutProvider';

export interface HeaderContextProps {
  dayBarHeight: number;
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
  columnWidth: number;
  useAllDayEvent: boolean;
  isShowExpandButton: SharedValue<boolean>;
  headerBottomHeight: number;
  collapsedItems: number;
  rightEdgeSpacing: number;
  overlapEventsSpacing: number;
}

export const HeaderContext = React.createContext<
  HeaderContextProps | undefined
>(undefined);

export const useHeader = () => {
  const context = React.useContext(HeaderContext);

  if (context === undefined) {
    throw new Error('DayBarContext is not available');
  }

  return context;
};
