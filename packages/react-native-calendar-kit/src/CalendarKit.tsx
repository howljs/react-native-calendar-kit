import React, { forwardRef } from 'react';
import CalendarBody from './CalendarBody';
import CalendarContainer from './CalendarContainer';
import CalendarDayBar from './CalendarHeader';
import type {
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
    renderDraggableEvent,
    renderDraggingEvent,
    renderDraggingHour,
    renderExpandIcon,
    renderHeaderItem,
    NowIndicatorComponent,
    LeftAreaComponent,
    headerBottomHeight,
    collapsedItems,
    eventMaxMinutes,
    eventInitialMinutes,
    eventMinMinutes,
    ...rest
  } = props;

  const dayBarProps: CalendarHeaderProps = {
    dayBarHeight,
    renderHeaderItem,
    renderExpandIcon,
    renderEvent,
    LeftAreaComponent,
    headerBottomHeight,
    collapsedItems,
    eventMaxMinutes,
    eventInitialMinutes,
    eventMinMinutes,
  };

  const bodyProps: CalendarBodyProps = {
    hourFormat,
    renderHour,
    renderDraggingHour,
    showNowIndicator,
    renderCustomOutOfRange,
    renderCustomUnavailableHour,
    renderEvent,
    renderDraggableEvent,
    renderDraggingEvent,
    NowIndicatorComponent,
  };

  return (
    <CalendarContainer {...rest} ref={ref}>
      <CalendarDayBar {...dayBarProps} />
      <CalendarBody {...bodyProps} />
    </CalendarContainer>
  );
};

export default forwardRef(CalendarKit);
