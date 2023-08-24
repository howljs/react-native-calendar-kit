import React from 'react';
import { useCalendarKit } from '../context/CalendarKitProvider';
import DayViewProvider from '../context/DayViewProvider';
import MonthViewProvider from '../context/MonthViewProvider';
import MultipleDayViewProvider from '../context/MultipleDayViewProvider';
import { CalendarInnerProps, CalendarKitHandle } from '../types';
import DayView from './DayView';
import MonthView from './MonthView';
import MultipleDayView from './MultipleDayView';

const CalendarViewMode = (
  props: Omit<CalendarInnerProps, 'events' | 'showNowIndicator'>,
  ref?: React.ForwardedRef<CalendarKitHandle>
) => {
  const { viewMode } = useCalendarKit();
  const {
    OutsideDateRangeComponent,
    onPressEvent,
    onLongPressEvent,
    ...otherProps
  } = props;

  if (viewMode === 'month') {
    return (
      <MonthViewProvider>
        <MonthView {...otherProps} ref={ref} />
      </MonthViewProvider>
    );
  }

  if (viewMode === 'day') {
    return (
      <DayViewProvider>
        <DayView
          {...otherProps}
          {...{ onPressEvent }}
          {...{ onLongPressEvent }}
          ref={ref}
        />
      </DayViewProvider>
    );
  }

  return (
    <MultipleDayViewProvider>
      <MultipleDayView
        {...{ OutsideDateRangeComponent }}
        {...{ onPressEvent }}
        {...{ onLongPressEvent }}
        {...otherProps}
        ref={ref}
      />
    </MultipleDayViewProvider>
  );
};

export default React.forwardRef(CalendarViewMode);
