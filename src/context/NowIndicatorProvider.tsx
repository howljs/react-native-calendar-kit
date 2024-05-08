import { DateTime } from 'luxon';
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
  type AppStateStatus,
  type NativeEventSubscription,
} from 'react-native';
import {
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { MILLISECONDS_IN_DAY } from '../constants';
import useLazyRef from '../hooks/useLazyRef';
import { forceUpdateZone } from '../utils/dateUtils';
import { useTimeZone } from './TimeZoneProvider';

export interface NowIndicatorContext {
  currentDateUnix: number;
  currentTime: SharedValue<number>;
}

const NowIndicatorContext = createContext<NowIndicatorContext | undefined>(
  undefined
);

const getCurrentDatetime = (timeZone?: string) => {
  const now = forceUpdateZone(DateTime.now().setZone(timeZone));
  const dateInMs = now.startOf('day').toMillis();

  return {
    date: dateInMs,
    time: now.hour * 60 + now.minute,
  };
};

interface NowIndicatorProviderProps {
  children?: React.ReactNode;
}

const NowIndicatorProvider = ({ children }: NowIndicatorProviderProps) => {
  const { timeZone } = useTimeZone();
  const nowRef = useLazyRef(() => getCurrentDatetime(timeZone));

  const [currentDateUnix, setCurrentDateUnix] = useState(nowRef.current.date);
  const currentTime = useSharedValue(nowRef.current.time);
  const timerRef = useRef<NodeJS.Timeout>();
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

    const current = getCurrentDatetime(timeZone);
    setCurrentDateUnix((prev) => {
      const diffMsSeconds = current.date - prev;
      const isSameDay =
        diffMsSeconds >= 0 && diffMsSeconds < MILLISECONDS_IN_DAY;

      if (isSameDay) {
        return prev;
      }
      return current.date;
    });
    currentTime.value = withTiming(current.time);
    const nextSeconds = 60 - DateTime.now().second;
    timerRef.current = setTimeout(updateTime, nextSeconds * 1000);
  }, [currentTime, stopTimer, timeZone]);

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
    updateTime();
    appStateListener.current = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      stopTimer();
      appStateListener.current?.remove();
    };
  }, [handleAppStateChange, stopTimer, updateTime]);

  const value = useMemo(
    () => ({
      currentTime,
      currentDateUnix,
    }),
    [currentDateUnix, currentTime]
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
