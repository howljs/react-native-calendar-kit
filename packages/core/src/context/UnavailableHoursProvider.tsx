import type { FC, PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect } from 'react';

import { parseDateTimeUTC } from '../dateUtils';
import useLazyRef from '../hooks/useLazyRef';
import { createStore, type Store } from '../store/storeBuilder';
import { useSelector } from '../store/useSelector';
import type { UnavailableHourProps } from '../types';
import { useCalendar } from './CalendarContext';
import { useDateChangedListener } from './VisibleDateProvider';

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
      const baseIndex = listRef?.getIndexByItem(date);
      if (baseIndex === undefined || baseIndex < 0) {
        return;
      }
      const numberOfDays = listRef?.numColumns ?? 7;
      const minIndex = baseIndex - numberOfDays * pagesPerSide;
      const maxIndex = baseIndex + numberOfDays * (pagesPerSide + 1);
      for (let i = minIndex; i < maxIndex; i += 1) {
        const item = listRef?.getItemByIndex(i);
        if (item === undefined) {
          continue;
        }
        const forceDate = parseDateTimeUTC(item);
        const weekDay = forceDate.weekday;
        const dateStr = forceDate.toFormat('yyyy-MM-dd');
        // Get unavailable hours either by specific date or by weekday
        const unavailableHoursByDate = originalData[dateStr] || originalData[weekDay];

        // If unavailable hours are found for this day, store them
        if (unavailableHoursByDate) {
          unavailableHours[item] = unavailableHoursByDate;
        }
      }

      unavailableHoursStore.setState({ unavailableHours });
    },
    [gridListRef, rawUnavailableHours, pagesPerSide, unavailableHoursStore]
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
