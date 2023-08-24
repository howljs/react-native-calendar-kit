import React from 'react';
import { View } from 'react-native';
import CalendarViewMode from './components/CalendarViewMode';
import { useCalendarKit } from './context/CalendarKitProvider';
import EventsControllerProvider from './context/EventsProvider';
import ScrollControllerProvider from './context/ScrollControllerProvider';
import type { CalendarInnerProps, CalendarKitHandle } from './types';
import NowIndicatorProvider from './context/NowIndicatorProvider';

const CalendarKitInner = (
  props: CalendarInnerProps,
  ref?: React.ForwardedRef<CalendarKitHandle>
) => {
  const { events, showNowIndicator, ...otherProps } = props;
  const { calendarSize } = useCalendarKit();

  if (calendarSize.width === 0) {
    return <View />;
  }

  return (
    <ScrollControllerProvider>
      <EventsControllerProvider events={events}>
        <NowIndicatorProvider showNowIndicator={showNowIndicator}>
          <CalendarViewMode {...otherProps} ref={ref} />
        </NowIndicatorProvider>
      </EventsControllerProvider>
    </ScrollControllerProvider>
  );
};

export default React.forwardRef(CalendarKitInner);
