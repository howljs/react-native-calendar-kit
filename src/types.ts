import type {
  GestureResponderEvent,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import type { TimeZone } from './assets/timeZone';
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
  getZones: () => {
    name: string;
    offset: number;
    alternativeName: string;
    raw: string;
    countryName: string;
  }[];
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
  renderEventContent?: (
    event: PackedEvent,
    timeIntervalHeight: SharedValue<number>
  ) => JSX.Element;
  renderSelectedEventContent?: (
    event: PackedEvent,
    timeIntervalHeight: SharedValue<number>
  ) => JSX.Element;
  selectedEvent?: PackedEvent;
  onEndDragSelectedEvent?: (event: PackedEvent) => void;
  renderCustomUnavailableItem?: (props: UnavailableItemProps) => JSX.Element;
  highlightDates?: HighlightDates;
  /** Callback function will be called when index changed */
  onChange?: (props: OnChangeProps) => void;

  editEventGestureEnabled?: boolean;
}

export interface UnavailableItemProps {
  timeIntervalHeight: SharedValue<number>;
  hour: number;
  width: number;
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

  isShowHeader?: boolean;

  hourFormat?: string;

  eventAnimatedDuration?: number;

  /**
   * Use Haptic Feedback when drag to create/edit.
   *
   * Only support **Bare React Native project**
   *
   **/

  useHaptic?: boolean;

  timeZone?: TimeZone;
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
  timeZone?: TimeZone;
}

export interface ThemeProperties {
  cellBorderColor?: string;
  backgroundColor?: string;
  dragCreateItemBackgroundColor?: string;
  loadingBarColor?: string;
  unavailableBackgroundColor?: string;
  editIndicatorColor?: string;
  nowIndicatorColor?: string;

  // Hour Column
  hourText?: TextStyle;
  dragHourContainer?: ViewStyle;
  dragHourText?: TextStyle;

  //Header style
  dayName?: TextStyle;
  dayNumber?: TextStyle;
  dayNumberContainer?: ViewStyle;
  todayName?: TextStyle;
  todayNumber?: TextStyle;
  todayNumberContainer?: ViewStyle;
  saturdayName?: TextStyle;
  saturdayNumber?: TextStyle;
  saturdayNumberContainer?: ViewStyle;
  sundayName?: TextStyle;
  sundayNumber?: TextStyle;
  sundayNumberContainer?: ViewStyle;

  //Event
  eventTitle?: TextStyle;
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
  containerStyle?: StyleProp<ViewStyle>;
  [key: string]: any;
}

export interface PackedEvent extends EventItem {
  left: number;
  startHour: number;
  width: number;
  duration: number;
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

export interface OnChangeProps {
  date: string;
  index: number;
  length: number;
  prevIndex: number | null;
}
