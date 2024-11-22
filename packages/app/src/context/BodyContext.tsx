import type { CalendarData, CalendarList, DraggingMode } from '@calendar-kit/core';
import React, { type MutableRefObject } from 'react';
import type { GestureResponderEvent } from 'react-native';
import type { AnimatedRef, SharedValue } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

import type {
  OutOfRangeProps,
  PackedEvent,
  RenderHourProps,
  SizeAnimation,
  UnavailableHourProps,
} from '../types';

export interface BodyContextProps {
  offsetY: SharedValue<number>;
  minuteHeight: Readonly<SharedValue<number>>;
  maxTimelineHeight: number;
  maxTimeIntervalHeight: number;
  minTimeIntervalHeight: number;
  timeIntervalHeight: SharedValue<number>;
  columnWidthAnim: SharedValue<number>;
  allowPinchToZoom: boolean;
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
  columns: number;
  calendarData: CalendarData;
  renderHour?: (props: RenderHourProps) => React.ReactNode;
  renderCustomOutOfRange?: (props: OutOfRangeProps) => React.ReactNode;
  renderCustomUnavailableHour?: (
    props: UnavailableHourProps & {
      width: SharedValue<number>;
      height: SharedValue<number>;
    }
  ) => React.ReactNode;
  renderEvent?: (event: PackedEvent, size: SizeAnimation) => React.ReactNode;
  renderCustomHorizontalLine?: (props: { index: number; borderColor: string }) => React.ReactNode;
  startOffset: SharedValue<number>;
  rightEdgeSpacing: number;
  overlapEventsSpacing: number;
  visibleDateUnixAnim: SharedValue<number>;
  NowIndicatorComponent?: React.ReactElement | null;
  verticalListRef: AnimatedRef<Animated.ScrollView>;
  gridListRef: AnimatedRef<CalendarList>;
  visibleDateUnix: MutableRefObject<number>;
  onLongPressBackground: (newProps: { dateTime: string }, event: GestureResponderEvent) => void;
  onPressBackground: (newProps: { dateTime: string }, event: GestureResponderEvent) => void;
  bodyStartX: MutableRefObject<number>;
  onPressEvent: (event: PackedEvent) => void;
  onLongPressEvent: (event: PackedEvent) => void;
  onPressDraggableEvent: (event: { eventIndex: number; type: DraggingMode }) => void;
  reduceBrightnessOfPastEvents: boolean;
  draggingId: SharedValue<string | undefined>;
}

export const BodyContext = React.createContext<BodyContextProps | undefined>(undefined);

export const useBody = () => {
  const context = React.useContext(BodyContext);

  if (context === undefined) {
    throw new Error('BodyContext is not available');
  }

  return context;
};
