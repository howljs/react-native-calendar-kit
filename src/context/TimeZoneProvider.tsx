import React, { useMemo, type PropsWithChildren } from 'react';

export interface TimeZoneContextProps {
  timeZone: string;
}

const TimeZoneContext = React.createContext<TimeZoneContextProps | undefined>(
  undefined
);

const TimeZoneProvider: React.FC<PropsWithChildren<{ timeZone: string }>> = ({
  children,
  timeZone,
}) => {
  const value = useMemo(() => ({ timeZone }), [timeZone]);

  return (
    <TimeZoneContext.Provider value={value}>
      {children}
    </TimeZoneContext.Provider>
  );
};

export default TimeZoneProvider;

export const useTimeZone = () => {
  const context = React.useContext(TimeZoneContext);

  if (context === undefined) {
    throw new Error('TimeZoneContext is not available');
  }

  return context;
};
