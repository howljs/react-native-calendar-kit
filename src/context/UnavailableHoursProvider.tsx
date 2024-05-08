import React, {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { useSyncExternalStoreWithSelector } from '../hooks/useSyncExternalStoreWithSelector';
import { Store, createStore } from '../storeBuilder';
import { UnavailableHourProps } from '../types';
import { parseDateTime } from '../utils/dateUtils';
import { MILLISECONDS_IN_DAY } from '../constants';

type UnavailableHoursStore = {
  unavailableHours?:
    | Record<string, UnavailableHourProps[]>
    | UnavailableHourProps[];
};

export const UnavailableHoursContext = createContext<
  Store<UnavailableHoursStore> | undefined
>(undefined);

const unavailableHoursStore = createStore<UnavailableHoursStore>({
  unavailableHours: [],
});

const UnavailableHoursProvider: FC<
  PropsWithChildren<UnavailableHoursStore>
> = ({ children, unavailableHours = [] }) => {
  useEffect(() => {
    unavailableHoursStore.setState({ unavailableHours });
  }, [unavailableHours]);

  return (
    <UnavailableHoursContext.Provider value={unavailableHoursStore}>
      {children}
    </UnavailableHoursContext.Provider>
  );
};

export default UnavailableHoursProvider;

export type UnavailableHoursSelector = UnavailableHourProps & {
  date: number;
};

export const useUnavailableHours = (date: number, numberOfDays: number) => {
  const unavailableHoursContext = useContext(UnavailableHoursContext);

  const selectorByDate = useCallback(
    (state: UnavailableHoursStore) => {
      let data: UnavailableHoursSelector[] = [];
      if (!state.unavailableHours) {
        return { data };
      }

      for (let i = 0; i < numberOfDays; i++) {
        const dateUnix = date + i * MILLISECONDS_IN_DAY;
        if (Array.isArray(state.unavailableHours)) {
          for (let j = 0; j < state.unavailableHours.length; j++) {
            const unavailableHour = state.unavailableHours[j]!;
            data.push({ ...unavailableHour, date: dateUnix });
          }
        } else {
          const dateObj = parseDateTime(dateUnix);
          const weekDay = dateObj.weekday;
          const dateStr = dateObj.toFormat('yyyy-MM-dd');
          const unavailableHoursWeekDay = state.unavailableHours[weekDay];
          if (unavailableHoursWeekDay) {
            for (let j = 0; j < unavailableHoursWeekDay.length; j++) {
              const unavailableHour = unavailableHoursWeekDay[j]!;
              data.push({ ...unavailableHour, date: dateUnix });
            }
          }

          const unavailableHoursByDate = state.unavailableHours[dateStr];
          if (unavailableHoursByDate) {
            for (let j = 0; j < unavailableHoursByDate.length; j++) {
              const unavailableHour = unavailableHoursByDate[j]!;
              data.push({ ...unavailableHour, date: dateUnix });
            }
          }
        }
      }

      return { data };
    },
    [date, numberOfDays]
  );

  if (!unavailableHoursContext) {
    throw new Error(
      'useRegionsByDate must be used within a UnavailableHoursProvider'
    );
  }

  const state = useSyncExternalStoreWithSelector(
    unavailableHoursContext.subscribe,
    unavailableHoursContext.getState,
    selectorByDate
  );
  return state;
};
