import type { WeekdayNumbers } from 'luxon';
import React from 'react';
import type { View } from 'react-native';
import type Animated from 'react-native-reanimated';
import type { AnimatedRef, SharedValue } from 'react-native-reanimated';

import type { CalendarList } from '../CalendarList';
import type { ScrollType } from '../constants';
import type HapticService from '../service/HapticService';
import type { CalendarData } from '../utils';

export interface CalendarContextProps {
  calendarData: CalendarData;
  dateList: number[];
  visibleDateUnix: React.MutableRefObject<number>;
  hourWidth: number;
  numberOfDays: number;
  verticalListRef: AnimatedRef<Animated.ScrollView>;
  headerListRef: AnimatedRef<CalendarList>;
  gridListRef: AnimatedRef<CalendarList>;
  columnWidthAnim: SharedValue<number>;
  firstDay: WeekdayNumbers;
  scrollType: SharedValue<ScrollType>;
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
  scrollVisibleHeight: React.MutableRefObject<number>;
  offsetX: SharedValue<number>;
  isTriggerMomentum: React.MutableRefObject<boolean>;
  showWeekNumber: boolean;
  calendarGridWidth: number;
  columnWidth: number;
  scrollByDay: boolean;
  snapToOffsets?: number[];
  columns: number;
  triggerDateChanged: React.MutableRefObject<number | undefined>;
  visibleDateUnixAnim: SharedValue<number>;
  visibleWeeks: SharedValue<number[]>;
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
  manualHorizontalScroll: boolean;
  reduceBrightnessOfPastEvents: boolean;
  bodyContainerRef?: React.MutableRefObject<View | null>;
  headerContainerRef?: React.MutableRefObject<View | null>;
}

export const CalendarContext = React.createContext<CalendarContextProps | undefined>(undefined);

export const useCalendar = () => {
  const context = React.useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
