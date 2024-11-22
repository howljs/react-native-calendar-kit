import { createContext, useContext } from 'react';

import type { PackedAllDayEvent } from '../../types';

interface HeaderItemContextProps {
  item: number;
  index: number;
}

export const HeaderItemContext = createContext<HeaderItemContextProps | undefined>(undefined);

export const useHeaderItem = () => {
  const context = useContext(HeaderItemContext);
  if (!context) {
    throw new Error('useHeaderItemContext must be used within a HeaderItemContext');
  }
  return context;
};

export const HeaderColumnContext = createContext<HeaderItemContextProps | undefined>(undefined);

export const useHeaderColumn = () => {
  const context = useContext(HeaderColumnContext);
  if (!context) {
    throw new Error('useHeaderColumn must be used within a HeaderColumnContext');
  }
  return context;
};

export const HeaderEventsContext = createContext<
  | {
      packedAllDayEvents: Record<string, PackedAllDayEvent[]>;
    }
  | undefined
>(undefined);

export const useHeaderEvents = () => {
  const context = useContext(HeaderEventsContext);
  if (!context) {
    throw new Error('useHeaderEvents must be used within a HeaderEventsContext');
  }
  return context;
};
