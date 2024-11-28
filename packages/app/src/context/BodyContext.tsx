import type { CalendarList } from '@calendar-kit/core';
import React, { createContext, type MutableRefObject, useContext } from 'react';
import type { GestureResponderEvent } from 'react-native';
import type { AnimatedRef, SharedValue } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

import type { DraggableEventProps } from '../components/BodyItem/DraggableEvent';
import type { DraggingEventProps } from '../components/DraggingEvent';
import type {
  OutOfRangeProps,
  PackedEvent,
  RenderHourProps,
  SizeAnimation,
  UnavailableHourProps,
} from '../types';
import type { DraggingMode } from './DragProvider';

export interface BodyContextProps {
  minuteHeight: Readonly<SharedValue<number>>;
  maxTimelineHeight: number;
  timeIntervalHeight: SharedValue<number>;
  columnWidthAnim: SharedValue<number>;
  spaceFromTop: number;
  spaceFromBottom: number;
  hours: { slot: number; time: string }[];
  hourFormat: string;
  timelineHeight: Readonly<SharedValue<number>>;
  totalSlots: number;
  numberOfDays: number;
  hourWidth: number;
  start: number;
  end: number;
  timeInterval: number;
  showNowIndicator: boolean;
  columnWidth: number;
  rightEdgeSpacing: number;
  overlapEventsSpacing: number;
  visibleDateUnixAnim: SharedValue<number>;
  NowIndicatorComponent?: React.ReactElement | null;
  verticalListRef: AnimatedRef<Animated.ScrollView>;
  gridListRef: AnimatedRef<CalendarList>;
  visibleDateUnix: MutableRefObject<number>;
  onLongPressBackground: (event: GestureResponderEvent) => void;
  onPressBackground: (event: GestureResponderEvent) => void;
  onPressEvent: (event: PackedEvent) => void;
  onLongPressEvent: (event: PackedEvent) => void;
  onPressDraggableEvent: (event: { eventIndex: number; type: DraggingMode }) => void;
  reduceBrightnessOfPastEvents: boolean;
  draggingId: SharedValue<string | undefined>;
  isShowHalfHourLine?: boolean;

  /** Custom hour text
   *
   * Note: Please use `useCallback` to memoize the function
   */
  renderHour?: (props: RenderHourProps) => React.ReactElement | null;

  /** Custom dragging hour text
   *
   * Note: Please use `useCallback` to memoize the function
   */
  renderDraggingHour?: (props: RenderHourProps) => React.ReactElement | null;
  renderCustomOutOfRange?: (props: OutOfRangeProps) => React.ReactElement | null;
  renderCustomUnavailableHour?: (
    props: UnavailableHourProps & {
      width: SharedValue<number>;
      height: SharedValue<number>;
    }
  ) => React.ReactElement | null;
  renderCustomHorizontalLine?: (props: {
    index: number;
    borderColor: string;
    isHalf: boolean;
  }) => React.ReactElement | null;
  renderEvent?: (event: PackedEvent, size: SizeAnimation) => React.ReactElement | null;
  renderDraggableEvent?: (props: DraggableEventProps) => React.ReactElement | null;
  renderDraggingEvent?: (props: DraggingEventProps) => React.ReactElement | null;
  renderCustomVerticalLine?: (props: {
    index: number;
    borderColor: string;
  }) => React.ReactElement | null;

  outOfRangeData: {
    diffMin: number;
    diffMax: number;
    minUnix: number;
    maxUnix: number;
  };
  scrollByDay: boolean;
}

export const BodyContext = createContext<BodyContextProps | undefined>(undefined);

export const useBody = () => {
  const context = useContext(BodyContext);

  if (context === undefined) {
    throw new Error('BodyContext is not available');
  }

  return context;
};

interface BodyItemContextType {
  item: number;
  index: number;
}

export const BodyItemContainerContext = createContext<BodyItemContextType | undefined>(undefined);

export const useBodyItemContainer = () => {
  const context = useContext(BodyItemContainerContext);
  if (context === undefined) {
    throw new Error('useBodyItem must be used within a BodyItemContext');
  }
  return context;
};

export const BodyItemContext = createContext<BodyItemContextType | undefined>(undefined);

export const useBodyItem = () => {
  const context = useContext(BodyItemContext);
  if (context === undefined) {
    throw new Error('useBodyColumn must be used within a BodyColumnContext');
  }
  return context;
};
