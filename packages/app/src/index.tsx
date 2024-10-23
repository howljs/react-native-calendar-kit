import CalendarKit from './CalendarKit';
export default CalendarKit;

export { default as CalendarBody } from './CalendarBody';
export { default as CalendarContainer } from './CalendarContainer';
export { default as CalendarHeader } from './CalendarHeader';
export { default as DayItem } from './components/DayItem';
export { default as MultiDayBarItem } from './components/MultiDayBarItem';
export { default as ResourceHeaderItem } from './components/ResourceHeaderItem';
export { default as SingleDayBarItem } from './components/SingleDayBarItem';
export { useBody } from './context/BodyContext';

// Core
export {
  RRuleGenerator,
  useActions,
  useAllDayEvents,
  useAllDayEventsByDay,
  useCalendar,
  useDateChangedListener,
  useDragEvent,
  useDragEventActions,
  useEventCountsByWeek,
  useHighlightDates,
  useLayout,
  useLoading,
  useLocale,
  useNotifyDateChanged,
  useNowIndicator,
  useRegularEvents,
  useTheme,
  useTimezone,
  useUnavailableHours,
  useUnavailableHoursByDate,
} from '@calendar-kit/core';

// Recommend: use useHeader instead. useDayBar will be removed soon.
export type { DraggableEventProps } from './components/DraggableEvent';
export { DraggableEvent } from './components/DraggableEvent';
export type { DraggingEventProps } from './components/DraggingEvent';
export { DraggingEvent } from './components/DraggingEvent';
export { useHeader as useDayBar, useHeader } from './context/DayBarContext';
export * from './types';
export * from './utils/dateUtils';
export type { WeekdayNumbers } from 'luxon';
