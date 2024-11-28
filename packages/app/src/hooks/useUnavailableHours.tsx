import { useSelector } from '@calendar-kit/core';
import { useCallback, useContext } from 'react';

import { useBody } from '../context/BodyContext';
import {
  UnavailableHoursContext,
  type UnavailableHoursStore,
} from '../context/UnavailableHoursProvider';
import type { UnavailableHourProps } from '../types';

export const useUnavailableHoursByDate = (dateUnix: number) => {
  const { gridListRef } = useBody();
  const unavailableHoursContext = useContext(UnavailableHoursContext);

  if (!unavailableHoursContext) {
    throw new Error('useRegionsByDate must be used within a UnavailableHoursProvider');
  }

  const selectUnavailableHoursByDate = useCallback(
    (state: UnavailableHoursStore) => {
      const index = gridListRef.current?.getIndexByItem(dateUnix);
      const numColumns = gridListRef.current?.numColumns;
      if (index === undefined || numColumns === undefined) {
        return undefined;
      }

      const unavailableHours: UnavailableHourProps[] = [];
      for (let i = 0; i < numColumns; i += 1) {
        const date = gridListRef.current?.getItemByIndex(index + i);
        if (!date) {
          continue;
        }
        const data = state.unavailableHours?.[date];
        if (data) {
          unavailableHours.push(...data.map((item) => ({ ...item, columnIndex: i })));
        }
      }
      return unavailableHours;
    },
    [dateUnix, gridListRef]
  );

  const state = useSelector(
    unavailableHoursContext.subscribe,
    unavailableHoursContext.getState,
    selectUnavailableHoursByDate
  );
  return state;
};
