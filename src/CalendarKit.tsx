import React, { forwardRef } from 'react';
import CalendarBody from './CalendarBody';
import CalendarContainer from './CalendarContainer';
import CalendarDayBar from './CalendarHeader';
import {
  CalendarBodyProps,
  CalendarHeaderProps,
  CalendarKitHandle,
  CalendarProviderProps,
} from './types';

type CalendarKitProps = CalendarProviderProps &
  CalendarBodyProps &
  CalendarHeaderProps;

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
  };

  return (
    <CalendarContainer {...rest} ref={ref}>
      <CalendarDayBar {...dayBarProps} />
      <CalendarBody {...bodyProps} />
    </CalendarContainer>
  );
};

export default forwardRef(CalendarKit);
