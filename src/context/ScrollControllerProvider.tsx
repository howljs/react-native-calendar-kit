import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { SECONDS_IN_DAY } from '../constants';
import { CalendarViewMode } from '../types';
import { parseUnixToDateStr } from '../utils/dateUtils';
import { useCalendarKit } from './CalendarKitProvider';

export interface ScrollControllerValue {
  scrollPositions: React.MutableRefObject<
    Record<CalendarViewMode, { index: number; extraColumns: number }>
  >;
  syncPositionByDate: (date: string) => void;
}

const ScrollController = createContext<ScrollControllerValue | undefined>(
  undefined
);

const ScrollControllerProvider: React.FC = ({ children }) => {
  const { pages, firstDayOfWeek, visibleStartUnix } = useCalendarKit();

  const scrollPositions = useRef({
    day: {
      index: pages.day.index,
      extraColumns: pages.day.extraColumns,
    },
    week: { index: pages.week.index, extraColumns: pages.week.extraColumns },
    workWeek: {
      index: pages.workWeek.index,
      extraColumns: pages.workWeek.extraColumns,
    },
    threeDays: {
      index: pages.threeDays.index,
      extraColumns: pages.threeDays.extraColumns,
    },
    month: { index: pages.month.index, extraColumns: pages.month.extraColumns },
  });

  const syncPositionByDate = useCallback(
    (date: string) => {
      const dateObject = new Date(date);
      dateObject.setHours(0, 0, 0, 0);
      const dateUnix = dateObject.getTime() / 1000;
      const diffDays = (dateUnix - pages.day.minDate) / SECONDS_IN_DAY;
      scrollPositions.current.day = {
        index: Math.max(diffDays, 0),
        extraColumns: 0,
      };

      const threeDayIndex = Math.floor(
        (dateUnix - pages.threeDays.minDate) / SECONDS_IN_DAY / 3
      );
      let extraColumns = 0;
      const dateByIndex = pages.threeDays.data[threeDayIndex];
      if (dateByIndex) {
        extraColumns = (dateUnix - dateByIndex) / SECONDS_IN_DAY;
      }
      scrollPositions.current.threeDays = {
        index: Math.max(threeDayIndex, 0),
        extraColumns: extraColumns,
      };

      const weekMinDate = pages.week.minDate;
      const workWeekMinDate = pages.workWeek.minDate;
      const extraIndex = workWeekMinDate > weekMinDate ? 1 : 0;
      const currentWeekDay = dateObject.getDay();
      const fDow = (7 + firstDayOfWeek) % 7;
      const diffBefore = (currentWeekDay + 7 - fDow) % 7;
      const startOfWeek = dateUnix - diffBefore * SECONDS_IN_DAY;
      const weekIndex = Math.floor(
        (startOfWeek - weekMinDate) / SECONDS_IN_DAY / 7
      );
      scrollPositions.current.week = {
        index: weekIndex,
        extraColumns: 0,
      };
      scrollPositions.current.workWeek = {
        index: weekIndex - extraIndex,
        extraColumns: 0,
      };
    },
    [
      firstDayOfWeek,
      pages.day.minDate,
      pages.threeDays.data,
      pages.threeDays.minDate,
      pages.week.minDate,
      pages.workWeek.minDate,
      scrollPositions,
    ]
  );

  useAnimatedReaction(
    () => visibleStartUnix.value,
    (next, prev) => {
      if (prev !== null && prev !== next) {
        const dateStr = parseUnixToDateStr(next);
        runOnJS(syncPositionByDate)(dateStr);
      }
    }
  );

  const value = useMemo(
    () => ({ scrollPositions, syncPositionByDate }),
    [syncPositionByDate]
  );

  return (
    <ScrollController.Provider value={value}>
      {children}
    </ScrollController.Provider>
  );
};

export default ScrollControllerProvider;

export const useScrollController = () => {
  const value = useContext(ScrollController);
  if (!value) {
    throw new Error(
      'useCalendarKit must be called from within ScrollControllerProvider!'
    );
  }
  return value;
};
