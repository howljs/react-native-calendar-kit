import React from 'react';
import CalendarKitInner from './CalendarKitInner';
import CalendarKitProvider from './context/CalendarKitProvider';
import type { CalendarKitHandle, CalendarKitProps } from './types';

const CalendarKit = (
  props: CalendarKitProps,
  ref?: React.ForwardedRef<CalendarKitHandle>
) => {
  const {
    onDateChanged,
    OutsideDateRangeComponent,
    locale,
    unavailableHours,
    holidays,
    sendTimelineBorderToBack,
    onPressEvent,
    events,
    onPressDayNumber,
    onLongPressEvent,
    showNowIndicator,
    ...globalProps
  } = props;

  const calendarProps = {
    onDateChanged,
    OutsideDateRangeComponent,
    locale,
    unavailableHours,
    holidays,
    sendTimelineBorderToBack,
    onPressEvent,
    events,
    onPressDayNumber,
    onLongPressEvent,
    showNowIndicator,
  };

  return (
    <CalendarKitProvider {...globalProps}>
      <CalendarKitInner {...calendarProps} ref={ref} />
    </CalendarKitProvider>
  );
};

export default React.forwardRef(CalendarKit);
