import React, { useMemo, type PropsWithChildren } from 'react';

export interface TimezoneContextProps {
  timezone: string;
}

const TimezoneContext = React.createContext<TimezoneContextProps | undefined>(
  undefined
);

const TimezoneProvider: React.FC<PropsWithChildren<{ timezone: string }>> = ({
  children,
  timezone,
}) => {
  const value = useMemo(() => ({ timezone }), [timezone]);

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
