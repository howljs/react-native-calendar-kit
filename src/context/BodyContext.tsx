import React from 'react';
import { GestureResponderEvent } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import type {
  CalendarViewMode,
  OutOfRangeProps,
  PackedEvent,
  RenderHourProps,
  SizeAnimation,
  UnavailableHourProps,
} from '../types';
import { DataByMode } from '../utils/utils';
import type { Size } from './LayoutProvider';

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
  hours: number[];
  hourFormat: string;
  timelineHeight: Readonly<SharedValue<number>>;
  totalSlots: number;
  numberOfDays: number;
  viewMode: CalendarViewMode;
  hourWidth: number;
  calendarLayout: Size;
  start: number;
  end: number;
  timeInterval: number;
  showNowIndicator: boolean;
  columnWidth: number;
  isRTL: boolean;
  columns: number;
  calendarData: DataByMode;
  renderHour?: (props: RenderHourProps) => React.ReactNode;
  renderCustomOutOfRange?: (props: OutOfRangeProps) => React.ReactNode;
  renderCustomUnavailableHour?: (
    props: UnavailableHourProps & {
      width: SharedValue<number>;
      height: SharedValue<number>;
    }
  ) => React.ReactNode;
  renderEvent?: (event: PackedEvent, size: SizeAnimation) => React.ReactNode;
  onLongPressBackground?: (event: GestureResponderEvent) => void;
  startOffset: SharedValue<number>;
  rightEdgeSpacing: number;
  overlapEventsSpacing: number;
}

export const BodyContext = React.createContext<BodyContextProps | undefined>(
  undefined
);

export const useBody = () => {
  const context = React.useContext(BodyContext);

  if (context === undefined) {
    throw new Error('BodyContext is not available');
  }

  return context;
};
