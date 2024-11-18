import { createContext, type MutableRefObject, useContext } from 'react';

interface BodyContextType {
  listWidth: number;
  listHeight: number;
  numberOfDays: number;
  visibleDateUnix: MutableRefObject<number>;
  hourWidth: number;
  totalSlots: number;
  slots: number[];
  columnWidth: number;
}

export const BodyContext = createContext<BodyContextType | undefined>(undefined);

export const useBody = () => {
  const context = useContext(BodyContext);
  if (!context) {
    throw new Error('useBody must be used within a BodyProvider');
  }
  return context;
};
