import React, { useMemo } from 'react';
import type { PropsWithChildren } from 'react';

export interface TimezoneContextProps {
  timeZone: string;
}

const TimezoneContext = React.createContext<TimezoneContextProps | undefined>(
  undefined
);

const TimezoneProvider: React.FC<PropsWithChildren<{ timeZone: string }>> = ({
  children,
  timeZone,
}) => {
  const value = useMemo(() => ({ timeZone }), [timeZone]);

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
};

export default TimezoneProvider;

export const useTimezone = () => {
  const context = React.useContext(TimezoneContext);

  if (context === undefined) {
    throw new Error('TimeZoneContext is not available');
  }

  return context;
};
