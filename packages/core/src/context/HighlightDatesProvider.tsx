import type { FC, PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect } from 'react';

import { parseDateTimeUTC } from '../dateUtils';
import useLazyRef from '../hooks/useLazyRef';
import { createStore, type Store } from '../store/storeBuilder';
import { useSelector } from '../store/useSelector';
import type { HighlightDateProps } from '../types';

export type HighlightDatesStore = {
  highlightDates?: Record<string, HighlightDateProps>;
};

export const HighlightDatesContext = createContext<Store<HighlightDatesStore> | undefined>(
  undefined
);

const HighlightDatesProvider: FC<PropsWithChildren<HighlightDatesStore>> = ({
  children,
  highlightDates,
}) => {
  const highlightDatesStore = useLazyRef(() =>
    createStore<HighlightDatesStore>({
      highlightDates: undefined,
    })
  ).current;

  useEffect(() => {
    highlightDatesStore.setState({ highlightDates });
  }, [highlightDates, highlightDatesStore]);

  return (
    <HighlightDatesContext.Provider value={highlightDatesStore}>
      {children}
    </HighlightDatesContext.Provider>
  );
};

export default HighlightDatesProvider;

export const useHighlightDates = (date: number) => {
  const highlightDatesContext = useContext(HighlightDatesContext);

  const selectorByDate = useCallback(
    (state: HighlightDatesStore) => {
      let data: HighlightDateProps | undefined;

      if (!state.highlightDates) {
        return data;
      }

      const dateObj = parseDateTimeUTC(date);
      const weekDay = dateObj.weekday;
      const dateStr = dateObj.toFormat('yyyy-MM-dd');
      const highlightDatesWeekDay = state.highlightDates[weekDay];
      if (highlightDatesWeekDay) {
        data = highlightDatesWeekDay;
      }
      const highlightDatesByDate = state.highlightDates[dateStr];
      if (highlightDatesByDate) {
        data = highlightDatesByDate;
      }

      return data;
    },
    [date]
  );

  if (!highlightDatesContext) {
    throw new Error('useRegionsByDate must be used within a HighlightDatesProvider');
  }

  const state = useSelector(
    highlightDatesContext.subscribe,
    highlightDatesContext.getState,
    selectorByDate
  );
  return state;
};
