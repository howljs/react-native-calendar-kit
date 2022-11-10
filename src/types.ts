import type { GestureResponderEvent } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import type { LOCALES } from './constants';

export interface TimelineCalendarHandle {
  goToDate: (props?: {
    date?: string;
    hourScroll?: boolean;
    animatedDate?: boolean;
    animatedHour?: boolean;
  }) => void;
  goToNextPage: (animated?: boolean) => void;
  goToPrevPage: (animated?: boolean) => void;
}

export interface TimelineCalendarProps
  extends TimelineProps,
    TimelineProviderProps {}

export interface TimelineProps {
  renderDayBarItem?: (props: DayBarItemProps) => JSX.Element;
  onPressDayNum?: (date: string) => void;
  onDragCreateEnd?: (props: RangeTime) => void;
  onPressBackground?: (date: string, event: GestureResponderEvent) => void;
  onLongPressBackground?: (date: string, event: GestureResponderEvent) => void;
  onPressOutBackground?: (date: string, event: GestureResponderEvent) => void;
  onDateChanged?: (date: string) => void;
  isLoading?: boolean;
  holidays?: string[];
  events?: EventItem[];
  onPressEvent?: (eventItem: PackedEvent) => void;
  onLongPressEvent?: (eventItem: PackedEvent) => void;
  renderEventContent?: (event: PackedEvent) => void;
  selectedEvent?: PackedEvent;
  onEndDragSelectedEvent?: (event: PackedEvent) => void;
  renderCustomUnavailableItem?: (props: UnavailableItemProps) => JSX.Element;
  highlightDates?: HighlightDates;
}

export interface UnavailableItemProps {
  timeIntervalHeight: SharedValue<number>;
  hour: number;
}

export type CalendarViewMode = 'day' | 'week' | 'threeDays' | 'workWeek';

export interface TimelineProviderProps {
  /** Calendar view mode. Default is **week** */
  viewMode?: CalendarViewMode;

  /** First day of the week. Default is **1** (Monday) */
  firstDay?: number;

  /** Minimum display date. Default is 2 year ago */
  minDate?: string;

  /** Maximum display date. Default is 2 year later */
  maxDate?: string;

  /** Initial display date. Default is today  */
  initialDate?: string;

  /** Day start time */
  start?: number;

  /** Day end time */
  end?: number;

  /** Width of hour column */
  hourWidth?: number;

  /** The interval of time slots in timeline. Default: **60** (1 hour) */
  timeInterval?: number;

  /** Initial time interval height  */
  initialTimeIntervalHeight?: number;

  /** Min time interval height  */
  minTimeIntervalHeight?: number;

  /** Max time interval height  */
  maxTimeIntervalHeight?: number;

  syncedLists?: boolean;

  theme?: ThemeProperties;

  spaceFromTop?: number;

  spaceFromBottom?: number;

  isShowHalfLine?: boolean;

  allowDragToCreate?: boolean;

  allowPinchToZoom?: boolean;

  dragCreateInterval?: number;

  dragStep?: number;

  unavailableHours?:
    | UnavailableHour[]
    | { [weekDay: string]: UnavailableHour[] };

  showNowIndicator?: boolean;

  rightEdgeSpacing?: number;

  overlapEventsSpacing?: number;

  scrollToNow?: boolean;

  locale?: LocaleType;
}

export interface DayBarItemProps {
  width: number;
  startDate: string;
  columnWidth: number;
  viewMode: CalendarViewMode;
  hourWidth: number;
  onPressDayNum?: (date: string) => void;
  theme: ThemeProperties;
  locale: LocaleType;
  highlightDates?: HighlightDates;
}

export interface ThemeProperties {
  cellBorderColor?: string;
  backgroundColor?: string;
  dragHourColor?: string;
  dragHourBorderColor?: string;
  dragHourBackgroundColor?: string;
  dragCreateItemBackgroundColor?: string;
  loadingBarColor?: string;
  unavailableBackgroundColor?: string;
  editIndicatorColor?: string;
  nowIndicatorColor?: string;

  //Header style
  dayNameColor?: string;
  dayNumberColor?: string;
  dayNumberBackgroundColor?: string;
  todayNameColor?: string;
  todayNumberColor?: string;
  todayNumberBackgroundColor?: string;
  saturdayNameColor?: string;
  saturdayNumberColor?: string;
  saturdayNumberBackgroundColor?: string;
  sundayNameColor?: string;
  sundayNumberColor?: string;
  sundayNumberBackgroundColor?: string;
}

export interface RangeTime {
  start: string;
  end: string;
}

export interface UnavailableHour {
  start: number;
  end: number;
}

export type UnavailableHoursStyle = Record<
  string,
  {
    top: number;
    height: number;
  }[]
>;

export interface EventItem {
  id: string;
  start: string;
  end: string;
  title?: string;
  color?: string;
  [key: string]: any;
}

export interface PackedEvent extends EventItem {
  left: number;
  top: number;
  width: number;
  height: number;
  leftByIndex?: number;
}

export type LocaleType = keyof typeof LOCALES;

export type HighlightDates = {
  [date: string]: {
    dayNumberColor?: string;
    dayNumberBackgroundColor?: string;
    dayNameColor?: string;
  };
};
