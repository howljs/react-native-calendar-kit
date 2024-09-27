import type { FC, PropsWithChildren } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { MILLISECONDS_IN_DAY } from '../constants';
import useLazyRef from '../hooks/useLazyRef';
import { useSyncExternalStoreWithSelector } from '../hooks/useSyncExternalStoreWithSelector';
import type { Store } from '../storeBuilder';
import { createStore } from '../storeBuilder';
import type { UnavailableHourProps } from '../types';
import { forceUpdateZone } from '../utils/dateUtils';
import { useDateChangedListener } from './VisibleDateProvider';

type UnavailableHoursStore = {
  unavailableHours?: Record<string, UnavailableHourProps[]>;
};

export const UnavailableHoursContext = createContext<
  Store<UnavailableHoursStore> | undefined
>(undefined);

const UnavailableHoursProvider: FC<
  PropsWithChildren<{
    unavailableHours?:
      | Record<string, UnavailableHourProps[]>
      | UnavailableHourProps[];
    timeZone: string;
    pagesPerSide: number;
  }>
> = ({ children, unavailableHours = {}, timeZone, pagesPerSide }) => {
  const unavailableHoursStore = useLazyRef(() =>
    createStore<UnavailableHoursStore>({
      unavailableHours: {},
    })
  ).current;
  const currentDate = useDateChangedListener();

  const notifyDataChanged = useCallback(
    (date: number, offset: number = 7) => {
      let originalData: Record<string, UnavailableHourProps[]> = {};
      if (Array.isArray(unavailableHours)) {
        originalData = {
          '1': unavailableHours,
          '2': unavailableHours,
          '3': unavailableHours,
          '4': unavailableHours,
          '5': unavailableHours,
          '6': unavailableHours,
          '7': unavailableHours,
        };
      } else {
        originalData = unavailableHours;
      }

      const data: Record<string, UnavailableHourProps[]> = {};
      const minUnix = date - MILLISECONDS_IN_DAY * (offset * pagesPerSide);
      const maxUnix =
        date + MILLISECONDS_IN_DAY * (offset * (pagesPerSide + 1));
      for (let i = minUnix; i < maxUnix; i += MILLISECONDS_IN_DAY) {
        const dateObj = forceUpdateZone(i, timeZone);
        const weekDay = dateObj.weekday;
        const dateStr = dateObj.toFormat('yyyy-MM-dd');
        const unavailableHoursByDate =
          originalData[dateStr] || originalData[weekDay];
        if (unavailableHoursByDate) {
          data[i] = unavailableHoursByDate;
        }
      }
      unavailableHoursStore.setState({ unavailableHours: data });
    },
    [unavailableHours, pagesPerSide, unavailableHoursStore, timeZone]
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
    throw new Error(
      'useRegionsByDate must be used within a UnavailableHoursProvider'
    );
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
    throw new Error(
      'useRegionsByDate must be used within a UnavailableHoursProvider'
    );
  }

  const selectUnavailableHoursByDate = useCallback(
    (state: UnavailableHoursStore) => {
      return state.unavailableHours
        ? state.unavailableHours[dateUnix]
        : undefined;
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
