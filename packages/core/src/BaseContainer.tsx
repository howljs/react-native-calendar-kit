import React, { type MutableRefObject, useMemo } from 'react';

import ActionsProvider from './context/ActionsProvider';
import HighlightDatesProvider from './context/HighlightDatesProvider';
import LayoutProvider from './context/LayoutProvider';
import { LoadingContext } from './context/LoadingContext';
import LocaleProvider from './context/LocaleProvider';
import NowIndicatorProvider from './context/NowIndicatorProvider';
import ThemeProvider from './context/ThemeProvider';
import { TimezoneContext } from './context/TimezoneContext';
import VisibleDateProvider from './context/VisibleDateProvider';
import type {
  ActionsProviderProps,
  DeepPartial,
  HighlightDateProps,
  LocaleConfigsProps,
  ThemeConfigs,
} from './types';

interface BaseContainerProps extends ActionsProviderProps {
  children: React.ReactNode;
  calendarWidth?: number;
  initialLocales?: { [locale: string]: DeepPartial<LocaleConfigsProps> };
  locale?: string;
  timeZone?: string;
  isLoading?: boolean;
  initialStart?: MutableRefObject<number>;
  highlightDates?: Record<string, HighlightDateProps>;
  theme?: DeepPartial<ThemeConfigs>;
}

const BaseContainer = ({
  children,
  calendarWidth,
  initialLocales,
  locale,
  timeZone = 'local',
  isLoading = false,
  initialStart,
  highlightDates,
  theme,
  ...actionsProps
}: BaseContainerProps) => {
  const timezoneValue = useMemo(() => ({ timeZone }), [timeZone]);
  const loadingValue = useMemo(() => ({ isLoading }), [isLoading]);

  return (
    <LayoutProvider calendarWidth={calendarWidth}>
      <LocaleProvider initialLocales={initialLocales} locale={locale}>
        <TimezoneContext.Provider value={timezoneValue}>
          <LoadingContext.Provider value={loadingValue}>
            <ActionsProvider {...actionsProps}>
              <VisibleDateProvider initialStart={initialStart}>
                <HighlightDatesProvider highlightDates={highlightDates}>
                  <NowIndicatorProvider>
                    <ThemeProvider theme={theme}>{children}</ThemeProvider>
                  </NowIndicatorProvider>
                </HighlightDatesProvider>
              </VisibleDateProvider>
            </ActionsProvider>
          </LoadingContext.Provider>
        </TimezoneContext.Provider>
      </LocaleProvider>
    </LayoutProvider>
  );
};

export default BaseContainer;
