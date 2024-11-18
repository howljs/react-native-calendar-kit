import type { WeekdayNumbers } from 'luxon';
import { useEffect, useRef, useState } from 'react';

const useHideWeekDays = (inputHideWeekDays: WeekdayNumbers[] = []) => {
  const [hideWeekDays, setHideWeekDays] = useState(inputHideWeekDays);
  const hideWeekDaysRef = useRef(inputHideWeekDays);
  useEffect(() => {
    const hasChanged =
      inputHideWeekDays.length !== hideWeekDaysRef.current.length ||
      !inputHideWeekDays.every((value, index) => value === hideWeekDaysRef.current[index]);

    if (hasChanged) {
      hideWeekDaysRef.current = inputHideWeekDays;
      setHideWeekDays(inputHideWeekDays);
    }
  }, [inputHideWeekDays]);

  return hideWeekDays;
};

export default useHideWeekDays;
