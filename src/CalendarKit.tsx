import React, { forwardRef } from 'react';
import CalendarBody from './CalendarBody';
import CalendarContainer from './CalendarContainer';
import CalendarDayBar from './CalendarDayBar';
import {
  CalendarBodyProps,
  CalendarDayBarProps,
  CalendarKitHandle,
  CalendarProviderProps,
} from './types';

type CalendarKitProps = CalendarProviderProps &
  CalendarBodyProps &
  CalendarDayBarProps;

const CalendarKit: React.ForwardRefRenderFunction<
  CalendarKitHandle,
  CalendarKitProps
> = (props, ref) => {
  const {
    hourFormat,
    renderHour,
    showNowIndicator,
    dayBarHeight,
    renderCustomOutOfRange,
    renderCustomUnavailableHour,
    renderEvent,
    rightEdgeSpacing,
    overlapEventsSpacing,
    ...rest
  } = props;

  const dayBarProps = {
    dayBarHeight,
  };

  const bodyProps = {
    hourFormat,
    renderHour,
    showNowIndicator,
    renderCustomOutOfRange,
    renderCustomUnavailableHour,
    renderEvent,
    rightEdgeSpacing,
    overlapEventsSpacing,
  };

  return (
    <CalendarContainer {...rest} ref={ref}>
      <CalendarDayBar {...dayBarProps} />
      <CalendarBody {...bodyProps} />
    </CalendarContainer>
  );
};

export default forwardRef(CalendarKit);
