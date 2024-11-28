import type { FC, MutableRefObject, PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface VisibleDateProviderProps {
  initialStart?: MutableRefObject<number>;
}

const VisibleDateValueContext = createContext<number | undefined>(undefined);

const VisibleDateActionsContext = createContext<((date: number) => void) | undefined>(undefined);

const VisibleDateProvider: FC<PropsWithChildren<VisibleDateProviderProps>> = ({
  initialStart,
  children,
}) => {
  const initialStartValue = initialStart?.current;
  const [visibleDateUnix, setVisibleDateUnix] = useState(initialStartValue);
  const [debouncedDateUnix, setDebouncedDateUnix] = useState(initialStartValue);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedDateUnix(visibleDateUnix);
    }, 150);
    return () => clearTimeout(timeoutId);
  }, [visibleDateUnix]);

  const updateVisibleDate = useCallback((date: number) => {
    setVisibleDateUnix(date);
  }, []);

  return (
    <VisibleDateActionsContext.Provider value={updateVisibleDate}>
      <VisibleDateValueContext.Provider value={debouncedDateUnix}>
        {children}
      </VisibleDateValueContext.Provider>
    </VisibleDateActionsContext.Provider>
  );
};

export default VisibleDateProvider;

export const useDateChangedListener = () => {
  const context = useContext(VisibleDateValueContext);
  if (!context) {
    throw new Error('useDateChangedListener must be used within a VisibleDateProvider');
  }
  return context;
};

export const useNotifyDateChanged = () => {
  const context = useContext(VisibleDateActionsContext);
  if (context === undefined) {
    throw new Error('useDateChangeActions must be used within a VisibleDateProvider');
  }
  return context;
};
