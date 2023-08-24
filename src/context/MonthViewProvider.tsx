import React, { createContext, useContext, useMemo, useRef } from 'react';
import { useCalendarKit } from './CalendarKitProvider';
import { useScrollController } from './ScrollControllerProvider';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { RecyclerListHandle } from '../components/Common/RecyclerList';

export interface MonthViewContextValue {
  initialOffset: number;
  monthRef: React.RefObject<RecyclerListHandle>;
  monthAnimatedRef: React.RefObject<Animated.ScrollView>;
}

export const MonthViewContext = createContext<
  MonthViewContextValue | undefined
>(undefined);

const MonthViewProvider: React.FC = ({ children }) => {
  const { calendarSize } = useCalendarKit();
  const { scrollPositions } = useScrollController();
  const monthRef = useRef<RecyclerListHandle>(null);
  const monthAnimatedRef = useAnimatedRef<Animated.ScrollView>();
  const scrollPosition = scrollPositions.current.month;
  const initialOffset = scrollPosition.index * calendarSize.width;

  const value = useMemo(
    () => ({ initialOffset, monthRef, monthAnimatedRef }),
    [initialOffset, monthAnimatedRef]
  );

  return (
    <MonthViewContext.Provider value={value}>
      {children}
    </MonthViewContext.Provider>
  );
};

export default MonthViewProvider;

export const useMonthView = () => {
  const value = useContext(MonthViewContext);
  if (!value) {
    throw new Error(
      'useMonthView must be called from within MonthViewProvider!'
    );
  }
  return value;
};
