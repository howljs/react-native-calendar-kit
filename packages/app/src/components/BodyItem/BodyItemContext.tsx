import { createContext, useContext } from 'react';

interface BodyItemContextType {
  item: number;
  index: number;
}

export const BodyContainerContext = createContext<BodyItemContextType | undefined>(undefined);

export const useBodyContainer = () => {
  const context = useContext(BodyContainerContext);
  if (context === undefined) {
    throw new Error('useBodyItem must be used within a BodyItemContext');
  }
  return context;
};

export const BodyColumnContext = createContext<BodyItemContextType | undefined>(undefined);

export const useBodyColumn = () => {
  const context = useContext(BodyColumnContext);
  if (context === undefined) {
    throw new Error('useBodyColumn must be used within a BodyColumnContext');
  }
  return context;
};
