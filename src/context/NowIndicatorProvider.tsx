import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AppState,
  AppStateStatus,
  NativeEventSubscription,
} from 'react-native';
import {
  SharedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SECONDS_IN_DAY } from '../constants';
import { unixTimeWithZone } from '../utils/dateUtils';
import { useCalendarKit } from './CalendarKitProvider';

export interface NowIndicatorContext {
  currentDateStart: number;
  currentUnixTime: SharedValue<number>;
  showNowIndicator: boolean;
}

const NowIndicatorContext = createContext<NowIndicatorContext | undefined>(
  undefined
);

interface NowIndicatorProviderProps {
  showNowIndicator?: boolean;
}

const NowIndicatorProvider: React.FC<NowIndicatorProviderProps> = ({
  children,
  showNowIndicator = true,
}) => {
  const { timeZone } = useCalendarKit();
  const initialCurrentTime = useRef(unixTimeWithZone(timeZone));

  const [currentDateStart, setCurrentDateStart] = useState(() => {
    const current = new Date(initialCurrentTime.current);
    current.setHours(0, 0, 0, 0);
    return current.getTime() / 1000;
  });

  const currentUnixTime = useSharedValue(initialCurrentTime.current);
  const timerRef = useRef<NodeJS.Timer>();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const appStateListener = useRef<NativeEventSubscription>();

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const updateTime = useCallback(() => {
    stopTimer();

    const nextSeconds = 60 - new Date().getSeconds();
    const newUnixTime = unixTimeWithZone(timeZone);

    setCurrentDateStart((prevStart) => {
      const diffSeconds = newUnixTime - prevStart;
      const isSameDay = diffSeconds > 0 && diffSeconds < SECONDS_IN_DAY;

      if (isSameDay) {
        return prevStart;
      }

      const diffDay = Math.floor(diffSeconds / SECONDS_IN_DAY);
      return prevStart + diffDay * SECONDS_IN_DAY;
    });

    currentUnixTime.value = withTiming(newUnixTime);
    timerRef.current = setTimeout(updateTime, nextSeconds * 1000);
  }, [currentUnixTime, stopTimer, timeZone]);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        updateTime();
      } else {
        stopTimer();
      }
      appState.current = nextAppState;
    },
    [stopTimer, updateTime]
  );

  useEffect(() => {
    if (showNowIndicator) {
      updateTime();
      appStateListener.current = AppState.addEventListener(
        'change',
        handleAppStateChange
      );
    } else {
      stopTimer();
      appStateListener.current?.remove();
    }

    return () => {
      stopTimer();
      appStateListener.current?.remove();
    };
  }, [showNowIndicator, handleAppStateChange, stopTimer, updateTime]);

  const value = useMemo(
    () => ({ currentDateStart, currentUnixTime, showNowIndicator }),
    [currentDateStart, currentUnixTime, showNowIndicator]
  );

  return (
    <NowIndicatorContext.Provider value={value}>
      {children}
    </NowIndicatorContext.Provider>
  );
};

export default NowIndicatorProvider;

export const useNowIndicator = () => {
  const value = useContext(NowIndicatorContext);
  if (!value) {
    throw new Error(
      'useNowIndicator must be called from within NowIndicatorContext!'
    );
  }
  return value;
};
