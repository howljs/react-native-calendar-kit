import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import weekDay from 'dayjs/plugin/weekday';
import React, { forwardRef } from 'react';
import { Timeline } from './components';
import TimelineProvider from './context/TimelineProvider';
import type { TimelineCalendarHandle, TimelineCalendarProps } from './types';

dayjs.extend(weekDay);
dayjs.extend(customParseFormat);

const TimelineCalendar: React.ForwardRefRenderFunction<
  TimelineCalendarHandle,
  TimelineCalendarProps
> = (
  {
    renderDayBarItem,
    dayBarItemHeight,
    onPressDayNum,
    onDragCreateEnd,
    onLongPressBackground,
    onPressBackground,
    onPressOutBackground,
    onDateChanged,
    isLoading,
    holidays,
    events,
    onLongPressEvent,
    onPressEvent,
    renderEventContent,
    selectedEvent,
    onEndDragSelectedEvent,
    renderCustomUnavailableItem,
    highlightDates,
    onChange,
    editEventGestureEnabled,
    renderSelectedEventContent,
    EditIndicatorComponent,
    renderHalfLineCustom,
    halfLineContainerStyle,
    ...timelineProviderProps
  },
  ref
) => {
  const timelineProps = {
    renderDayBarItem,
    dayBarItemHeight,
    onPressDayNum,
    onDragCreateEnd,
    onLongPressBackground,
    onPressBackground,
    onPressOutBackground,
    onDateChanged,
    isLoading,
    holidays,
    events,
    onLongPressEvent,
    onPressEvent,
    renderEventContent,
    selectedEvent,
    onEndDragSelectedEvent,
    renderCustomUnavailableItem,
    highlightDates,
    onChange,
    editEventGestureEnabled,
    renderSelectedEventContent,
    EditIndicatorComponent,
    renderHalfLineCustom,
    halfLineContainerStyle,
  };

  return (
    <TimelineProvider {...timelineProviderProps}>
      <Timeline {...timelineProps} ref={ref} />
    </TimelineProvider>
  );
};

export default forwardRef(TimelineCalendar);
