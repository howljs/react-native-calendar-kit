import CalendarKit from './CalendarKit';
export default CalendarKit;

export { default as CalendarBody } from './CalendarBody';
export { default as CalendarContainer } from './CalendarContainer';
export { default as CalendarHeader } from './CalendarHeader';
export { default as DayItem } from './components/DayItem';
export { default as MultiDayBarItem } from './components/MultiDayBarItem';
export { default as ResourceHeaderItem } from './components/ResourceHeaderItem';
export { default as SingleDayBarItem } from './components/SingleDayBarItem';
export { useActions } from './context/ActionsProvider';
export { useBody } from './context/BodyContext';
export { useCalendar } from './context/CalendarProvider';

// Recommend: use useHeader instead. useDayBar will be removed soon.
export type { DraggableEventProps } from './components/DraggableEvent';
export { DraggableEvent } from './components/DraggableEvent';
export type { DraggingEventProps } from './components/DraggingEvent';
export { DraggingEvent } from './components/DraggingEvent';
export { useHeader as useDayBar } from './context/DayBarContext';
export { useHeader } from './context/DayBarContext';
export { useDragEvent, useDragEventActions } from './context/DragEventProvider';
export {
  useAllDayEvents,
  useAllDayEventsByDay,
  useEventCountsByWeek,
  useMonthEvents,
  useRegularEvents,
} from './context/EventsProvider';
export { useHighlightDates } from './context/HighlightDatesProvider';
export { useLayout } from './context/LayoutProvider';
export { useLoading } from './context/LoadingContext';
export { useLocale } from './context/LocaleProvider';
export { useNowIndicator } from './context/NowIndicatorProvider';
export { useTheme } from './context/ThemeProvider';
export { useUnavailableHours, useUnavailableHoursByDate } from './context/UnavailableHoursProvider';
export { useDateChangedListener, useNotifyDateChanged } from './context/VisibleDateProvider';
export * from './service/rrule';
export * from './types';
export * from './utils/dateUtils';
export type { WeekdayNumbers } from 'luxon';
