import {
  createStore,
  parseDateTimeUTC,
  type Store,
  useDateChangedListener,
  useLazyRef,
  useSelector,
} from '@calendar-kit/core';
import type { FC, PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect } from 'react';

import { MILLISECONDS_IN_DAY } from '../constants';
import type { UnavailableHourProps } from '../types';
import { useCalendar } from './CalendarContext';

export type UnavailableHoursStore = {
  unavailableHours?: Record<string, UnavailableHourProps[]>;
};

export const UnavailableHoursContext = createContext<Store<UnavailableHoursStore> | undefined>(
  undefined
);

const UnavailableHoursProvider: FC<
  PropsWithChildren<{
    unavailableHours?: Record<string, UnavailableHourProps[]> | UnavailableHourProps[];
  }>
> = ({ children, unavailableHours: rawUnavailableHours }) => {
  const { gridListRef, pagesPerSide } = useCalendar();
  const unavailableHoursStore = useLazyRef(() =>
    createStore<UnavailableHoursStore>({
      unavailableHours: {},
    })
  ).current;
  const currentDate = useDateChangedListener();

  const notifyDataChanged = useCallback(
    (date: number) => {
      let originalData: Record<string, UnavailableHourProps[]> = {};
      if (Array.isArray(rawUnavailableHours)) {
        originalData = {
          '1': rawUnavailableHours,
          '2': rawUnavailableHours,
          '3': rawUnavailableHours,
          '4': rawUnavailableHours,
          '5': rawUnavailableHours,
          '6': rawUnavailableHours,
          '7': rawUnavailableHours,
        };
      } else {
        originalData = rawUnavailableHours ?? {};
      }

      const unavailableHours: Record<string, UnavailableHourProps[]> = {};

      const listRef = gridListRef.current;
      if (!listRef) {
        return;
      }
      const numberOfDays = listRef.numColumns;
      const daysBefore = numberOfDays * pagesPerSide;
      const daysAfter = numberOfDays * (pagesPerSide + 1);
      const minUnix = date - daysBefore * MILLISECONDS_IN_DAY;
      const maxUnix = date + daysAfter * MILLISECONDS_IN_DAY;
      const visibleDates = listRef.getVisibleDates(minUnix, maxUnix);
      for (const curDate of visibleDates) {
        const forceDate = parseDateTimeUTC(curDate);
        const weekDay = forceDate.weekday;
        const dateStr = forceDate.toFormat('yyyy-MM-dd');
        // Get unavailable hours either by specific date or by weekday
        const unavailableHoursByDate = originalData[dateStr] || originalData[weekDay];

        // If unavailable hours are found for this day, store them
        if (unavailableHoursByDate) {
          unavailableHours[curDate] = unavailableHoursByDate;
        }
      }

      unavailableHoursStore.setState({ unavailableHours });
    },
    [rawUnavailableHours, gridListRef, pagesPerSide, unavailableHoursStore]
  );

  useEffect(() => {
    notifyDataChanged(currentDate);
  }, [currentDate, notifyDataChanged]);

  return (
    <UnavailableHoursContext.Provider value={unavailableHoursStore}>
      {children}
    </UnavailableHoursContext.Provider>
  );
};

export default UnavailableHoursProvider;

const selector = (state: UnavailableHoursStore) => state.unavailableHours || {};

export const useUnavailableHours = () => {
  const unavailableHoursContext = useContext(UnavailableHoursContext);

  if (!unavailableHoursContext) {
    throw new Error('useRegionsByDate must be used within a UnavailableHoursProvider');
  }

  const state = useSelector(
    unavailableHoursContext.subscribe,
    unavailableHoursContext.getState,
    selector
  );
  return state;
};
