import type { DateTime, WeekdayNumbers } from 'luxon';
import type {
  GestureResponderEvent,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { SharedValue } from 'react-native-reanimated';

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export interface ThemeConfigs {
  colors: {
    primary: string;
    onPrimary: string;
    background: string;
    onBackground: string;
    surface: string;
    border: string;
    text: string;
  };
  textStyle?: TextStyle;

  // Hour column
  hourBackgroundColor?: string;
  hourTextStyle?: TextStyle;

  // Day bar
  dayBarBackgroundColor?: string;
  todayName?: TextStyle;
  todayNumber?: TextStyle;
  todayNumberContainer?: ViewStyle;
  dayName?: TextStyle;
  dayNumber?: TextStyle;
  dayNumberContainer?: ViewStyle;

  // Week number
  weekNumber?: TextStyle;
  weekNumberContainer?: ViewStyle;

  nowIndicatorColor?: string;

  outOfRangeBackgroundColor?: string;

  weekNumberBackgroundColor?: string;

  unavailableHourBackgroundColor?: string;
}

export type GoToDateOptions = {
  date?: DateType;
  animatedDate?: boolean;
  hourScroll?: boolean;
  animatedHour?: boolean;
};

export interface CalendarKitHandle {
  goToDate: (props?: GoToDateOptions) => void;
  goToHour: (hour: number, animated?: boolean) => void;
  goToNextPage: (animated?: boolean, forceScrollByDay?: boolean) => void;
  goToPrevPage: (animated?: boolean, forceScrollByDay?: boolean) => void;
  /**
   * * scale: Change `timeIntervalHeight` by scale value
   * * height: Change `timeIntervalHeight` to height value
   * * props is `undefined`: Change `timeIntervalHeight` to initialTimeIntervalHeight
   */
  zoom: (props?: { scale?: number; height?: number }) => void;
  setVisibleDate: (date: string) => void;
  getDateByOffset: (position: { x: number; y: number }) => string | null;
  getEventByOffset: (position: { x: number; y: number }) => EventItem | null;
  /**
   *
   * @param duration Minutes
   */
  getSizeByDuration: (duration: number) => { width: number; height: number };
}

/**
 * Type of date
 ** Date
 ** string: ISOString or 'YYYY-MM-DD'
 ** number: Unix timestamps in milliseconds
 */
export type DateType = Date | number | string | DateTime;

export type DateOnlyType = { date: string; dateTime?: never; timeZone?: never };
export type DateTimeType = {
  dateTime: string;
  timeZone?: string;
  date?: never;
};

export type DateOrDateTime = DateOnlyType | DateTimeType;

export interface OnEventResponse extends EventItem {
  localId: string;
}

export interface SelectedEventType extends Omit<EventItem, 'id'> {
  id?: string;
}

export interface DraggingEventType extends Omit<EventItem, 'id'> {
  id?: string;
}

export interface OnCreateEventResponse {
  start: DateTimeType;
  end: DateTimeType;
}

export interface ActionsProviderProps {
  /**
   * Callback when the date is changed (scrolling)
   */
  onChange?: (date: string) => void;
  /**
   * Callback when the date is changed
   */
  onDateChanged?: (date: string) => void;
  /**
   * Callback when the background is pressed
   */
  onPressBackground?: (
    props: DateOrDateTime,
    event: GestureResponderEvent
  ) => void;

  /**
   * Callback when the background is long pressed
   */
  onLongPressBackground?: (
    props: DateOrDateTime,
    event: GestureResponderEvent
  ) => void;

  /**
   * Callback when the day number is pressed
   */
  onPressDayNumber?: (date: string) => void;
  /**
   * Enable pull to refresh
   */
  onRefresh?: (date: string) => void;

  /**
   * Callback when the event is pressed
   */
  onPressEvent?: (event: OnEventResponse) => void;

  /**
   * Callback when the drag event is started
   */
  onDragEventStart?: (event: OnEventResponse) => void;

  /**
   * Callback when the drag event is ended
   */
  onDragEventEnd?: (event: OnEventResponse) => Promise<void> | void;

  /**
   * Callback when the event is long pressed
   */
  onLongPressEvent?: (event: OnEventResponse) => void;

  /**
   * Callback when the selected event is dragged
   */
  onDragSelectedEventStart?: (event: SelectedEventType) => void;

  /**
   * Callback when the selected event is dragged
   */
  onDragSelectedEventEnd?: (event: SelectedEventType) => Promise<void> | void;

  /**
   * Callback when the drag create event is started
   */
  onDragCreateEventStart?: (event: OnCreateEventResponse) => void;

  /**
   * Callback when the drag create event is ended
   */
  onDragCreateEventEnd?: (event: OnCreateEventResponse) => Promise<void> | void;

  /**
   * Use all day event
   *
   * Default: `false`
   */
  useAllDayEvent?: boolean;
}

export interface CalendarProviderProps extends ActionsProviderProps {
  /**
   * Calendar width
   */
  calendarWidth?: number;

  /**
   * Number of days to display
   *
   * Default: `7`
   */
  numberOfDays?: number;

  /**
   * Enable scroll by day
   *
   * Default: `false`
   */
  scrollByDay?: boolean;

  /** First day of the week. (1 - Monday ... 7 - Sunday)
   *
   ** Default: `1` (Monday)
   */
  firstDay?: WeekdayNumbers;

  /** Hide week days */
  hideWeekDays?: WeekdayNumbers[];

  /** Minimum display date.
   *
   ** Default: 2 year ago from today
   */
  minDate?: DateType;

  /** Maximum display date.
   *
   ** Default: 2 year later from today
   */
  maxDate?: DateType;

  /** Initial display date.
   *
   ** Default: today  */
  initialDate?: DateType;

  /**
   * Hour width
   */
  hourWidth?: number;

  /** Theme of calendar */
  theme?: DeepPartial<ThemeConfigs>;

  /**
   * Calendar Localization
   *
   * Default:
   * ```
   * {
   *   en: { weekDayShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_') },
   * }
   * ```
   *
   *
   * You can add more locales as needed, example usage:
   * ```
    const initialLocales = {
      ja: {
        weekDayShort: '日_月_火_水_木_金_土'.split('_'),
      },
      vi: {
        weekDayShort: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
      },
    };

    <CalendarKit initialLocales={initialLocales} locale="ja" />
   * ```
   */
  initialLocales?: { [locale: string]: LocaleConfigsProps };

  /** Current locale
   *
   ** Default: `en`
   */
  locale?: string;

  /** Space between header view and time slots view.
   *
   ** Default: `16`
   */
  spaceFromTop?: number;

  /** Space below time slots view.
   *
   ** Default: `16`
   */
  spaceFromBottom?: number;

  /** Calendar start time (in minutes)
   *
   ** Default: `0`
   */
  start?: number;

  /** Calendar end time (in minutes)
   *
   ** Default: `1440` (24 hours)
   */
  end?: number;

  /** The interval of time slots in timeline. (in minutes)
   *
   ** Default: `60`
   */
  timeInterval?: number;

  /** Initial time interval height
   *
   ** Default: `60`
   */
  timeIntervalHeight?: number;

  /** Maximum time interval height.
   *
   ** Default: `116`
   */
  maxTimeIntervalHeight?: number;

  /** Initial time interval height
   *
   ** Default: `60`
   */
  initialTimeIntervalHeight?: number;

  /** Minimum time interval height.
   *
   ** Default: `60`
   */
  minTimeIntervalHeight?: number;

  /** Enable pinch to scale height of the calendar */
  allowPinchToZoom?: boolean;

  /**
   * Custom time zone
   */
  timeZone?: string;

  /**
   * Show week number
   */
  showWeekNumber?: boolean;

  /**
   * Show loading progress
   */
  isLoading?: boolean;

  /**
   * RTL mode
   */
  // isRTL?: boolean;

  /**
   * Unavailable hours
   *
   * Example:
   *
   * All days
   * ```
   * [
   *   { start: 0, end: 8 },
   *   { start: 12, end: 24 },
   * ],
   * ```
   *
   * Specific day
   * ```
   * {
   *  '2024-04-26': [
   *   { start: 0, end: 8 },
   *   { start: 12, end: 24 },
   *  ],
   *  /// Day of week (1 - Monday ... 7 - Sunday)
   *  '7': [
   *   { start: 0, end: 24 },
   *  ],
   * }
   * ```
   *
   */
  unavailableHours?:
    | Record<string, UnavailableHourProps[]>
    | UnavailableHourProps[];

  /**
   * Style for day bar item
   */
  highlightDates?: Record<string, HighlightDateProps>;

  /**
   * Events list
   */
  events?: EventItem[];

  /**
   * Auto scroll to current time.
   * Please set to `false` if you want custom initial scroll behavior.
   *
   * Default: `true`
   */
  scrollToNow?: boolean;

  /**
   * Use haptic feedback
   *
   * Default is `false`
   */
  useHaptic?: boolean;

  /**
   * Allow drag to edit event
   */
  allowDragToEdit?: boolean;

  /**
   * Drag step
   *
   * Default is `15` minutes
   */
  dragStep?: number;

  /**
   * Selected event
   */
  selectedEvent?: SelectedEventType;

  /**
   * Specify the number of pages to render ahead and behind the current page.
   *
   * Default is `2`
   */
  pagesPerSide?: number;

  /**
   * Allow drag to create event
   */
  allowDragToCreate?: boolean;

  /**
   * Default duration when creating event
   *
   * Default is `30` minutes
   */
  defaultDuration?: number;
}

export interface EventItem extends Record<string, any> {
  /** ID for the event. */
  id: string;

  /** Start date of the event
   *
   * Need to provide either `dateTime` or `date`
   *
   * dateTime: ISOString (e.g. '2024-05-01T00:00:00.000Z') - Not all day event
   *
   * timeZone: Timezone of the event (e.g. 'Asia/Tokyo') - Not all day event
   *
   * date: 'YYYY-MM-DD' (e.g. '2024-05-01') - All day event
   */
  start: DateOrDateTime;

  /** End date of the event
   *
   * Need to provide either `dateTime` or `date`
   *
   * dateTime: ISOString (e.g. '2024-05-01T00:00:00.000Z') - Not all day event
   *
   * timeZone: Timezone of the event (e.g. 'Asia/Tokyo') - Not all day event
   *
   * date: 'YYYY-MM-DD' (e.g. '2024-05-01') - All day event
   */
  end: DateOrDateTime;

  /** Title of the event */
  title?: string;

  /** Background color of the event */
  color?: string;

  /** Text color of the event */
  titleColor?: string;

  /** Container style of the event */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Recurrence rule for the event.
   */
  recurrence?: string;

  /**
   * Unique ID for the recurring event.
   */
  recurringEventId?: string;

  /**
   * Dates to exclude from the recurring event.
   */
  excludeDates?: string[];

  /**
   * Original start time of the event.
   */
  originalStartTime?: DateOrDateTime;

  /**
   * Original recurring event.
   */
  originalRecurringEvent?: EventItem;

  /**
   * Key for the event, use for drag/drop event, automatically generated
   */
  localId?: string;

  /**
   * Whether the event is the first occurrence of the recurring event.
   */
  isFirstOccurrence?: boolean;
}

export interface HighlightDateProps {
  dayName?: TextStyle;
  dayNumber?: TextStyle;
  dayNumberContainer?: ViewStyle;
  isTodayOverride?: boolean;
}

export interface UnavailableHourProps extends Record<string, any> {
  /**
   * Start hour (in minutes)
   */
  start: number;

  /**
   * Start hour (in minutes)
   */
  end: number;
  enableBackgroundInteraction?: boolean;
  backgroundColor?: string;
}

export interface OutOfRangeProps extends SizeAnimation {}

export interface CalendarDayBarProps {
  /**
   * Day bar height
   *
   ** Default: `60`
   */
  dayBarHeight?: number;

  /**
   * Custom day bar item
   */
  renderDayBarItem?: (props: {
    index: number;
    startUnix: number;
    extra: Record<string, any>;
  }) => JSX.Element | null;
}

export interface CalendarBodyProps {
  /**
   * Custom hour text
   */
  hourFormat?: string;

  /**
   * Custom hour text
   */
  renderHour?: (props: RenderHourProps) => React.ReactNode;

  /**
   * Show now indicator
   */
  showNowIndicator?: boolean;

  /** Custom Out of Range item */
  renderCustomOutOfRange?: (props: OutOfRangeProps) => React.ReactNode;

  /** Custom Unavailable Item */
  renderCustomUnavailableHour?: (
    props: UnavailableHourProps & {
      width: SharedValue<number>;
      height: SharedValue<number>;
    }
  ) => React.ReactNode;

  /**
   * Custom event item
   */
  renderEvent?: (event: PackedEvent, size: SizeAnimation) => React.ReactNode;

  /**
   * Spacing at the right edge of events.
   *
   * Default is `1`
   */
  rightEdgeSpacing?: number;

  /**
   * Spacing between overlapping events.
   *
   * Default is 1
   */
  overlapEventsSpacing?: number;
}

export interface RenderHourProps {
  hour: string;
  minutes: number;
  style: TextStyle;
}

export interface LocaleConfigsProps {
  weekDayShort: string[];
  meridiem: { ante: string; post: string };
}

export interface EventItemInternal extends EventItem {
  localId: string;
  _internal: {
    startUnix: number;
    endUnix: number;
    duration: number;
    startMinutes?: number;
    index: number;
    weekStart?: number;
  };
}

export interface PackedEvent extends EventItemInternal {
  _internal: EventItemInternal['_internal'] & {
    total: number;
    columnSpan: number;
  };
}

export interface PackedAllDayEvent extends EventItemInternal {
  _internal: EventItemInternal['_internal'] & {
    rowIndex: number;
    startIndex: number;
    columnSpan: number;
  };
}

export interface SizeAnimation {
  width: SharedValue<number>;
  height: SharedValue<number>;
}
