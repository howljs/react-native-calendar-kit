import merge from 'lodash.merge';
import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';

import { DEFAULT_LOCALES } from './constants';
import type { DeepPartial, LocaleConfigsProps } from './types';
import { useLazyRef } from './useLazyRef';

const LocaleContext = React.createContext<LocaleConfigsProps | undefined>(
  undefined
);

interface LocaleProviderProps {
  initialLocales?: { [locale: string]: DeepPartial<LocaleConfigsProps> };
  locale?: string;
}

const LocaleProvider: React.FC<PropsWithChildren<LocaleProviderProps>> = ({
  initialLocales,
  locale = 'en',
  children,
}) => {
  const locales = useLazyRef(() => merge({}, DEFAULT_LOCALES, initialLocales));
  const localeConfig = useMemo(
    () => locales.current[locale] || locales.current.en,
    [locale, locales]
  );

  return (
    <LocaleContext.Provider value={localeConfig}>
      {children}
    </LocaleContext.Provider>
  );
};

export default LocaleProvider;

export const useLocale = () => {
  const locale = React.useContext(LocaleContext);
  if (!locale) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return locale;
};
