import type { CalendarProviderProps } from '@calendar-kit/core';
import React, { forwardRef } from 'react';

import CalendarBody from './CalendarBody';
import CalendarContainer from './CalendarContainer';
import CalendarDayBar from './CalendarHeader';
import type {
  CalendarBodyProps,
  CalendarHeaderProps,
  CalendarKitHandle,
  PackedAllDayEvent,
  SizeAnimation,
} from './types';

interface CalendarKitProps
  extends CalendarProviderProps,
    CalendarBodyProps,
    Omit<CalendarHeaderProps, 'renderEvent'> {
  renderAllDayEvent?: (
    event: PackedAllDayEvent,
    size: SizeAnimation
  ) => React.ReactNode;
}

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
    renderAllDayEvent,
    ...rest
  } = props;

  const dayBarProps: CalendarHeaderProps = {
    dayBarHeight,
    renderHeaderItem,
    renderExpandIcon,
    renderEvent: renderAllDayEvent,
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
