import React, {
  forwardRef,
  type ForwardRefExoticComponent,
  type PropsWithChildren,
  type RefAttributes,
} from 'react';
import CalendarProvider from './context/CalendarProvider';
import CalendarBody from './CalendarBody';
import CalendarDayBar from './CalendarDayBar';
import LayoutProvider from './context/LayoutProvider';
import type {
  CalendarBodyProps,
  CalendarKitHandle,
  CalendarProviderProps,
  CalendarDayBarProps,
} from './types';

type CalendarKitProps = CalendarProviderProps &
  CalendarBodyProps &
  CalendarDayBarProps;

type CalendarProviderType = ForwardRefExoticComponent<
  PropsWithChildren<CalendarProviderProps> & RefAttributes<CalendarKitHandle>
>;

const BaseCalendarKitWrapper = (Component: CalendarProviderType) => {
  return forwardRef<CalendarKitHandle, PropsWithChildren<CalendarKitProps>>(
    (props, ref) => {
      if (!props.children) {
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
          <LayoutProvider>
            <Component {...rest} ref={ref}>
              <CalendarDayBar {...dayBarProps} />
              <CalendarBody {...bodyProps} />
            </Component>
          </LayoutProvider>
        );
      }

      return (
        <LayoutProvider>
          <Component {...props} ref={ref} />
        </LayoutProvider>
      );
    }
  );
};

type CalendarKitType = React.ForwardRefExoticComponent<
  CalendarKitProps & React.RefAttributes<CalendarKitHandle>
> & {
  Provider: CalendarProviderType;
  DayBar: React.FC<CalendarDayBarProps>;
  Body: React.FC<CalendarBodyProps>;
};

const createCalendarKit = () => {
  const CalendarKitWrapper = BaseCalendarKitWrapper(CalendarProvider);
  const CalendarKit = CalendarKitWrapper as CalendarKitType;
  CalendarKit.displayName = 'CalendarKit';

  CalendarKit.Provider = CalendarKitWrapper;
  CalendarKit.Provider.displayName = 'CalendarKitProvider';

  CalendarKit.DayBar = CalendarDayBar;
  CalendarKit.DayBar.displayName = 'CalendarKitDayBar';

  CalendarKit.Body = CalendarBody;
  CalendarKit.Body.displayName = 'CalendarKitBody';
  return CalendarKit;
};

const CalendarKit = createCalendarKit();

export default CalendarKit;
