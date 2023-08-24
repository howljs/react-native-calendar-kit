import React, { useImperativeHandle, useMemo } from 'react';
import { MONTH_COLUMNS } from '../../constants';
import { useCalendarKit } from '../../context/CalendarKitProvider';
import { useMonthView } from '../../context/MonthViewProvider';
import { useNowIndicator } from '../../context/NowIndicatorProvider';
import {
  CalendarInnerProps,
  CalendarKitHandle,
  LocaleConfigs,
} from '../../types';
import RecyclerList, { RecyclerItem } from '../Common/RecyclerList';
import MonthViewItem from './MonthViewItem';

const MonthView = (
  { locale = 'en' }: CalendarInnerProps,
  ref?: React.ForwardedRef<CalendarKitHandle>
) => {
  const {
    pages,
    calendarSize,
    isRTL,
    theme,
    firstDayOfWeek,
    renderAheadItem,
    locales,
  } = useCalendarKit();
  const { currentDateStart } = useNowIndicator();

  const { initialOffset, monthAnimatedRef, monthRef } = useMonthView();

  useImperativeHandle(
    ref,
    () => ({
      goToDate: () => {},
      goToHour: () => {},
      goToNextPage: () => {},
      goToPrevPage: () => {},
      notifyDataChanged: () => {},
      syncDate: () => {},
    }),
    []
  );

  const weekDaysByLocale = useMemo(
    () =>
      Array.from({ length: MONTH_COLUMNS }, (_, index) => {
        const localeConfigs =
          locales.current[locale] || (locales.current.en as LocaleConfigs);
        const dayIndex = (index + firstDayOfWeek) % 7;
        return localeConfigs.weekDayShort[dayIndex] as string;
      }),
    [locales, locale, firstDayOfWeek]
  );

  const _renderItem = ({ item }: RecyclerItem) => (
    <MonthViewItem item={item} weekDaysByLocale={weekDaysByLocale} />
  );

  const extraData = useMemo(
    () => ({ isRTL, calendarSize, theme, weekDaysByLocale, currentDateStart }),
    [isRTL, calendarSize, theme, weekDaysByLocale, currentDateStart]
  );

  return (
    <RecyclerList
      data={pages.month.data}
      initialOffset={initialOffset}
      renderItem={_renderItem}
      listSize={calendarSize}
      inverted={isRTL}
      extraData={extraData}
      bounces={false}
      renderAheadItem={renderAheadItem}
      ref={monthRef}
      animatedRef={monthAnimatedRef}
    />
  );
};

export default React.forwardRef(MonthView);
