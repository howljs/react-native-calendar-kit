import type { WeekdayNumbers } from 'luxon';
import type { FC, PropsWithChildren } from 'react';
import React from 'react';
import type { AnimatedRef, SharedValue } from 'react-native-reanimated';
import type Animated from 'react-native-reanimated';
import type HapticService from '../service/HapticService';
import type { DataByMode } from '../utils/utils';
import { CalendarListRef } from '../service/CalendarList';
import { LinkedScrollGroup } from '../hooks/useLinkedScrollGroup';

export interface CalendarContextProps {
  calendarData: DataByMode;
  calendarLayout: { width: number; height: number };
  visibleDateUnix: React.RefObject<number>;
  hourWidth: number;
  numberOfDays: number;
  verticalListRef: AnimatedRef<Animated.ScrollView>;
  dayBarListRef: AnimatedRef<Animated.ScrollView>;
  gridListRef: AnimatedRef<Animated.ScrollView>;
  firstDay: WeekdayNumbers;
  offsetY: SharedValue<number>;
  minuteHeight: Readonly<SharedValue<number>>;
  maxTimelineHeight: number;
  maxTimeIntervalHeight: number;
  minTimeIntervalHeight: number;
  timeIntervalHeight: SharedValue<number>;
  allowPinchToZoom: boolean;
  spaceFromTop: number;
  spaceFromBottom: number;
  slots: number[];
  timelineHeight: Readonly<SharedValue<number>>;
  totalSlots: number;
  start: number;
  end: number;
  timeInterval: number;
  scrollVisibleHeight: React.RefObject<number>;
  offsetX: SharedValue<number>;
  showWeekNumber: boolean;
  calendarGridWidth: number;
  columnWidth: number;
  scrollByDay: boolean;
  initialOffset: number;
  isRTL: boolean;
  snapToInterval?: number;
  columns: number;
  triggerDateChanged: React.RefObject<number | undefined>;
  visibleDateUnixAnim: SharedValue<number>;
  visibleWeeks: SharedValue<number[]>;
  calendarListRef: React.RefObject<CalendarListRef | null>;
  startOffset: Readonly<SharedValue<number>>;
  scrollVisibleHeightAnim: SharedValue<number>;
  pagesPerSide: number;
  rightEdgeSpacing: number;
  overlapEventsSpacing: number;
  hideWeekDays: WeekdayNumbers[];
  useAllDayEvent: boolean;
  hapticService: HapticService;
  allowDragToCreate: boolean;
  allowDragToEdit: boolean;
  dragToCreateMode: 'duration' | 'date-time';
  allowHorizontalSwipe: boolean;
  enableResourceScroll: boolean;
  resourcePerPage: number;
  resourcePagingEnabled: boolean;
  linkedScrollGroup: LinkedScrollGroup;
}

export const CalendarContext = React.createContext<
  CalendarContextProps | undefined
>(undefined);

const CalendarProvider: FC<
  PropsWithChildren<{ value: CalendarContextProps }>
> = ({ value, children }) => {
  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export default CalendarProvider;

export const useCalendar = () => {
  const context = React.useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
