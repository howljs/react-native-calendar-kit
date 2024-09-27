import React, { useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import useLatestCallback from '../hooks/useLatestCallback';
import type { ActionsProviderProps } from '../types';

const ActionContext = React.createContext<ActionsProviderProps | undefined>(
  undefined
);

const ActionsProvider: React.FC<PropsWithChildren<ActionsProviderProps>> = ({
  children,
  ...props
}) => {
  const onDateChanged = useLatestCallback(props.onDateChanged);
  const onChange = useLatestCallback(props.onChange);
  const onPressBackground = useLatestCallback(props.onPressBackground);
  const onPressDayNumber = useLatestCallback(props.onPressDayNumber);
  const onRefresh = useLatestCallback(props.onRefresh);
  const onPressEvent = useLatestCallback(props.onPressEvent);
  const onDragEventStart = useLatestCallback(props.onDragEventStart);
  const onDragEventEnd = useLatestCallback(props.onDragEventEnd);
  const onLongPressEvent = useLatestCallback(props.onLongPressEvent);
  const onLongPressBackground = useLatestCallback(props.onLongPressBackground);
  const onDragSelectedEventStart = useLatestCallback(
    props.onDragSelectedEventStart
  );
  const onDragSelectedEventEnd = useLatestCallback(
    props.onDragSelectedEventEnd
  );
  const onDragCreateEventStart = useLatestCallback(
    props.onDragCreateEventStart
  );
  const onDragCreateEventEnd = useLatestCallback(props.onDragCreateEventEnd);
  const onLoad = useLatestCallback(props.onLoad);

  const value = useMemo(
    () => ({
      onDateChanged,
      onChange,
      onPressBackground,
      onPressDayNumber,
      onRefresh,
      onPressEvent,
      onLongPressEvent,
      onDragEventStart,
      onDragEventEnd,
      onDragSelectedEventStart,
      onDragSelectedEventEnd,
      onLongPressBackground,
      onDragCreateEventStart,
      onDragCreateEventEnd,
      onLoad,
    }),
    [
      onChange,
      onDateChanged,
      onPressBackground,
      onPressDayNumber,
      onPressEvent,
      onRefresh,
      onLongPressEvent,
      onDragEventStart,
      onDragEventEnd,
      onDragSelectedEventStart,
      onDragSelectedEventEnd,
      onLongPressBackground,
      onDragCreateEventStart,
      onDragCreateEventEnd,
      onLoad,
    ]
  );

  return (
    <ActionContext.Provider value={value}>{children}</ActionContext.Provider>
  );
};

export default ActionsProvider;

export const useActions = () => {
  const context = React.useContext(ActionContext);

  if (context === undefined) {
    throw new Error('ActionsContext is not available');
  }

  return context;
};
