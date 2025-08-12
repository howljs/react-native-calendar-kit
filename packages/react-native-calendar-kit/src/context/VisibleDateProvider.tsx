import type { ForwardRefRenderFunction, PropsWithChildren } from 'react';
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

interface VisibleDateProviderProps {
  initialStart: React.RefObject<number>;
}

const VisibleDateValueContext = React.createContext<number | undefined>(
  undefined
);

const VisibleDateActionsContext = React.createContext<
  ((date: number) => void) | undefined
>(undefined);

export interface VisibleDateProviderRef {
  updateVisibleDate: (date: number) => void;
}

const VisibleDateProvider: ForwardRefRenderFunction<
  VisibleDateProviderRef,
  PropsWithChildren<VisibleDateProviderProps>
> = ({ initialStart, children }, ref) => {
  const [visibleDateUnix, setVisibleDateUnix] = useState(initialStart.current);
  const [debouncedDateUnix, setDebouncedDateUnix] = React.useState(
    initialStart.current
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedDateUnix(visibleDateUnix);
    }, 150);
    return () => clearTimeout(timeoutId);
  }, [visibleDateUnix]);

  const updateVisibleDate = useCallback((date: number) => {
    setVisibleDateUnix(date);
  }, []);

  useImperativeHandle(ref, () => ({
    updateVisibleDate,
  }));

  return (
    <VisibleDateActionsContext.Provider value={updateVisibleDate}>
      <VisibleDateValueContext.Provider value={debouncedDateUnix}>
        {children}
      </VisibleDateValueContext.Provider>
    </VisibleDateActionsContext.Provider>
  );
};

export default forwardRef(VisibleDateProvider);

export const useDateChangedListener = () => {
  const context = useContext(VisibleDateValueContext);
  if (!context) {
    throw new Error(
      'useDateChangedListener must be used within a VisibleDateProvider'
    );
  }
  return context;
};

export const useNotifyDateChanged = () => {
  const context = useContext(VisibleDateActionsContext);
  if (context === undefined) {
    throw new Error(
      'useDateChangeActions must be used within a VisibleDateProvider'
    );
  }
  return context;
};
