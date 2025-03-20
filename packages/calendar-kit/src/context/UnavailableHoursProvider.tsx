import type { FC, PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect } from 'react';

import useLazyRef from '../hooks/useLazyRef';
import { useSyncExternalStoreWithSelector } from '../hooks/useSyncExternalStoreWithSelector';
import type { Store } from '../storeBuilder';
import { createStore } from '../storeBuilder';
import type { UnavailableHourProps } from '../types';
import { forceUpdateZone, parseDateTime } from '../utils/dateUtils';
import { useDateChangedListener } from './VisibleDateProvider';

type UnavailableHoursStore = {
  unavailableHours?: Record<string, UnavailableHourProps[]>;
};

export const UnavailableHoursContext = createContext<Store<UnavailableHoursStore> | undefined>(
  undefined
);

const UnavailableHoursProvider: FC<
  PropsWithChildren<{
    unavailableHours?: Record<string, UnavailableHourProps[]> | UnavailableHourProps[];
    timeZone: string;
    pagesPerSide: number;
  }>
> = ({ children, unavailableHours, timeZone, pagesPerSide }) => {
  const unavailableHoursStore = useLazyRef(() =>
    createStore<UnavailableHoursStore>({
      unavailableHours: {},
    })
  ).current;
  const currentDate = useDateChangedListener();

  const notifyDataChanged = useCallback(
    (date: number, offset: number = 7) => {
      const _unavailableHours = unavailableHours ?? {};
      let originalData: Record<string, UnavailableHourProps[]> = {};
      if (Array.isArray(_unavailableHours)) {
        originalData = {
          '1': _unavailableHours,
          '2': _unavailableHours,
          '3': _unavailableHours,
          '4': _unavailableHours,
          '5': _unavailableHours,
          '6': _unavailableHours,
          '7': _unavailableHours,
        };
      } else {
        originalData = _unavailableHours;
      }

      const data: Record<string, UnavailableHourProps[]> = {};
      // Iterate over the date range
      let startDateTime = parseDateTime(date).minus({
        days: offset * pagesPerSide,
      });
      const endDateTime = parseDateTime(date).plus({
        days: offset * (pagesPerSide + 1),
      });

      while (startDateTime <= endDateTime) {
        const forceDate = forceUpdateZone(startDateTime, timeZone);
        const dateUnix = forceDate.toMillis();
        const weekDay = forceDate.weekday;
        const dateStr = forceDate.toFormat('yyyy-MM-dd');

        // Get unavailable hours either by specific date or by weekday
        const unavailableHoursByDate = originalData[dateStr] || originalData[weekDay];

        // If unavailable hours are found for this day, store them
        if (unavailableHoursByDate) {
          data[dateUnix] = unavailableHoursByDate;
        }

        // Move to the next day
        startDateTime = startDateTime.plus({ days: 1 });
      }

      unavailableHoursStore.setState({ unavailableHours: data });
    },
    [unavailableHours, pagesPerSide, timeZone, unavailableHoursStore]
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

  const state = useSyncExternalStoreWithSelector(
    unavailableHoursContext.subscribe,
    unavailableHoursContext.getState,
    selector
  );
  return state;
};

export const useUnavailableHoursByDate = (dateUnix: number) => {
  const unavailableHoursContext = useContext(UnavailableHoursContext);

  if (!unavailableHoursContext) {
    throw new Error('useRegionsByDate must be used within a UnavailableHoursProvider');
  }

  const selectUnavailableHoursByDate = useCallback(
    (state: UnavailableHoursStore) => {
      return state.unavailableHours ? state.unavailableHours[dateUnix] : undefined;
    },
    [dateUnix]
  );

  const state = useSyncExternalStoreWithSelector(
    unavailableHoursContext.subscribe,
    unavailableHoursContext.getState,
    selectUnavailableHoursByDate
  );
  return state;
};
