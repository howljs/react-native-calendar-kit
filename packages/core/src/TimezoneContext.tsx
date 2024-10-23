import React from 'react';

export interface TimezoneContextProps {
  timeZone: string;
}

export const TimezoneContext = React.createContext<
  TimezoneContextProps | undefined
>(undefined);

export const useTimezone = () => {
  const context = React.useContext(TimezoneContext);

  if (context === undefined) {
    throw new Error('TimeZoneContext is not available');
  }

  return context;
};
