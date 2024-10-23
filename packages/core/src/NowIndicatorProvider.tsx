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
import type { AppStateStatus, NativeEventSubscription } from 'react-native';
import { AppState } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import { MILLISECONDS_IN_DAY } from './constants';
import { forceUpdateZone } from './dateUtils';
import { useTimezone } from './TimezoneContext';
import { useLazyRef } from './useLazyRef';

export interface NowIndicatorContextProps {
  currentDateUnix: number;
  currentTime: SharedValue<number>;
}

export const NowIndicatorContext = createContext<
  NowIndicatorContextProps | undefined
>(undefined);

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
  const { timeZone } = useTimezone();
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
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
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
