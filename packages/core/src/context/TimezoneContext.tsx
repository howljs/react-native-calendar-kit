import { createContext, useContext } from 'react';

export interface TimezoneContextProps {
  timeZone: string;
}

export const TimezoneContext = createContext<TimezoneContextProps | undefined>(undefined);

export const useTimezone = () => {
  const context = useContext(TimezoneContext);

  if (context === undefined) {
    throw new Error('TimeZoneContext is not available');
  }

  return context;
};