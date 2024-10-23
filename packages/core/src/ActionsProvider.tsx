import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';

import type { ActionsProviderProps } from './types';
import { useLatestCallback } from './useLatestCallback';

export const ActionsContext = React.createContext<
  ActionsProviderProps | undefined
>(undefined);

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
    <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>
  );
};

export default ActionsProvider;

export const useActions = () => {
  const context = React.useContext(ActionsContext);

  if (context === undefined) {
    throw new Error('ActionsContext is not available');
  }

  return context;
};
