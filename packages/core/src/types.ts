import { DateTime, type WeekdayNumbers } from 'luxon';
import type { GestureResponderEvent, TextStyle, ViewStyle } from 'react-native';

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type DataByMode = {
  count: number;
  minDateUnix: number;
  maxDateUnix: number;
  originalMinDateUnix: number;
  originalMaxDateUnix: number;
  visibleDates: Record<
    string,
    { index: number; unix: number; weekday: WeekdayNumbers }
  >;
  visibleDatesArray: number[];
  diffMinDays: number;
  diffMaxDays: number;
};

export interface ThemeConfigs {
  colors: {
    /** Default color */
    primary: string;
    /** Default color on primary color */
    onPrimary: string;
    /** Default background color */
    background: string;
    /** Default color on background color */
    onBackground: string;
    /** Default border color */
    border: string;
    /** Default text color */
    text: string;

    /**
     * Default surface color (e.g: week number background color, unavailable
     * hour background color)
     */
    surface: string;

    /** Default color on surface color */
    onSurface: string;
  };
  /** Default text style */
  textStyle?: TextStyle;

  // Hour column
  hourBackgroundColor?: string;
  hourTextStyle?: TextStyle;

  // Day bar
  headerBackgroundColor?: string;
  headerContainer?: ViewStyle;
  dayBarContainer?: ViewStyle;

  dayContainer?: ViewStyle;
  dayName?: TextStyle;
  dayNumber?: TextStyle;
  dayNumberContainer?: ViewStyle;
  todayName?: TextStyle;
  todayNumber?: TextStyle;
  todayNumberContainer?: ViewStyle;

  allDayEventsContainer?: ViewStyle;
  headerBottomContainer?: ViewStyle;
  countContainer?: ViewStyle;
  countText?: TextStyle;

  singleDayContainer?: ViewStyle;
  singleDayEventsContainer?: ViewStyle;

  // Week number
  weekNumber?: TextStyle;
  weekNumberContainer?: ViewStyle;

  /** Default color: `colors.primary` */
  nowIndicatorColor?: string;

  /** Default background color: `colors.surface` */
  outOfRangeBackgroundColor?: string;

  /** Default background color: `colors.surface` */
  unavailableHourBackgroundColor?: string;

  /** Default container style of the event */
  eventContainerStyle?: ViewStyle;

  /** Default style of the event */
  eventTitleStyle?: TextStyle;
}

export interface LocaleConfigsProps {
  weekDayShort: string[];
  meridiem: { ante: string; post: string };
  more: string;
}

/**
 * Type of date
 *
 * - Date
 * - String: ISOString or 'YYYY-MM-DD'
 * - Number: Unix timestamps in milliseconds
 */
export type DateType = Date | number | string | DateTime;

export type DateOnlyType = {
  date: string;
  dateTime?: never;
  timeZone?: never;
  resourceId?: string;
};
export type DateTimeType = {
  dateTime: string;
  timeZone?: string;
  date?: never;
  resourceId?: string;
};

export type DateOrDateTime = DateOnlyType | DateTimeType;

export interface EventItem extends Record<string, any> {
  /** ID for the event. */
  id: string;

  /**
   * Start date of the event
   *
   * Need to provide either `dateTime` or `date`
   *
   * DateTime: ISOString (e.g. '2024-05-01T00:00:00.000Z') - Not all day event
   *
   * TimeZone: Timezone of the event (e.g. 'Asia/Tokyo') - Not all day event
   *
   * Date: 'YYYY-MM-DD' (e.g. '2024-05-01') - All day event
   */
  start: DateOrDateTime;

  /**
   * End date of the event
   *
   * Need to provide either `dateTime` or `date`
   *
   * DateTime: ISOString (e.g. '2024-05-01T00:00:00.000Z') - Not all day event
   *
   * TimeZone: Timezone of the event (e.g. 'Asia/Tokyo') - Not all day event
   *
   * Date: 'YYYY-MM-DD' (e.g. '2024-05-01') - All day event
   */
  end: DateOrDateTime;

  /** Title of the event */
  title?: string;

  /** Background color of the event */
  color?: string;

  /** Recurrence rule for the event. */
  recurrence?: string;

  /** Unique ID for the recurring event. */
  recurringEventId?: string;

  /** Dates to exclude from the recurring event. */
  excludeDates?: string[];

  /** Original start time of the event. */
  originalStartTime?: DateOrDateTime;

  /** Original recurring event. */
  originalRecurringEvent?: EventItem;

  /** Key for the event, use for drag/drop event, automatically generated */
  localId?: string;

  /** Whether the event is the first occurrence of the recurring event. */
  isFirstOccurrence?: boolean;

  /** Resource ID for the event. */
  resourceId?: string;
}

export interface EventItemInternal extends EventItem {
  localId: string;
  _internal: {
    startUnix: number;
    endUnix: number;
    duration: number;
    startMinutes?: number;
    weekStart?: number;
    resourceIndex?: number;
  };
}

export interface NoOverlapEvent extends EventItemInternal {
  _internal: EventItemInternal['_internal'] & {
    index?: number;
  };
}

export interface OverlapEvent extends EventItemInternal {
  _internal: EventItemInternal['_internal'] & {
    container?: OverlapEvent;
    row?: OverlapEvent;
    rows?: OverlapEvent[];
    leaves?: OverlapEvent[];
    _width?: number;
    width?: number;
    xOffset?: number;
  };
}

export interface PackedEvent extends EventItemInternal {
  _internal: EventItemInternal['_internal'] & {
    total?: number;
    columnSpan?: number;
    widthPercentage?: number;
    xOffsetPercentage?: number;
    index?: number;
  };
}

export interface PackedAllDayEvent extends EventItemInternal {
  _internal: EventItemInternal['_internal'] & {
    rowIndex: number;
    startIndex: number;
    columnSpan: number;
  };
}

export interface ResourceItem extends Record<string, any> {
  /** ID for the resource. */
  id: string;

  /** Title for the resource. */
  title: string;
}

export interface HighlightDateProps {
  dayName?: TextStyle;
  dayNumber?: TextStyle;
  dayNumberContainer?: ViewStyle;
  isTodayOverride?: boolean;
}

export interface UnavailableHourProps extends Record<string, any> {
  /** Start hour (in minutes) */
  start: number;

  /** Start hour (in minutes) */
  end: number;
  enableBackgroundInteraction?: boolean;
  backgroundColor?: string;
}

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
  resourceId?: string;
}

export interface ActionsProviderProps {
  /** Callback when the date is changed (scrolling) */
  onChange?: (date: string) => void;
  /** Callback when the date is changed */
  onDateChanged?: (date: string) => void;
  /** Callback when the background is pressed */
  onPressBackground?: (
    props: DateOrDateTime,
    event: GestureResponderEvent
  ) => void;

  /** Callback when the background is long pressed */
  onLongPressBackground?: (
    props: DateOrDateTime,
    event: GestureResponderEvent
  ) => void;

  /** Callback when the day number is pressed */
  onPressDayNumber?: (date: string) => void;
  /** Enable pull to refresh */
  onRefresh?: (date: string) => void;

  /** Callback when the event is pressed */
  onPressEvent?: (event: OnEventResponse) => void;

  /** Callback when the drag event is started */
  onDragEventStart?: (event: OnEventResponse) => void;

  /** Callback when the drag event is ended */
  onDragEventEnd?: (event: OnEventResponse) => Promise<void> | void;

  /** Callback when the event is long pressed */
  onLongPressEvent?: (event: OnEventResponse) => void;

  /** Callback when the selected event is dragged */
  onDragSelectedEventStart?: (event: SelectedEventType) => void;

  /** Callback when the selected event is dragged */
  onDragSelectedEventEnd?: (event: SelectedEventType) => Promise<void> | void;

  /** Callback when the drag create event is started */
  onDragCreateEventStart?: (event: OnCreateEventResponse) => void;

  /** Callback when the drag create event is ended */
  onDragCreateEventEnd?: (event: OnCreateEventResponse) => Promise<void> | void;

  /** Callback when the calendar is loaded */
  onLoad?: () => void;

  /**
   * Use all day event
   *
   * Default: `true`
   */
  useAllDayEvent?: boolean;

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

  /**
   * Minimum minutes to calculate height of regular event
   *
   * Default is `1`
   */
  minRegularEventMinutes?: number;
}

export interface HapticService {
  isHapticFeedbackEnabled: boolean;
  useExpoHaptics: boolean;
  setEnabled(isEnabled: boolean): void;
  impact(): any;
  selection(): any;
}

export interface CalendarProviderProps extends ActionsProviderProps {
  /** Calendar width */
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
   * Default: `numberOfDays < 7 ? true : false`
   */
  scrollByDay?: boolean;

  /**
   * First day of the week. (1 - Monday ... 7 - Sunday)
   *
   * - Default: `1` (Monday)
   */
  firstDay?: WeekdayNumbers;

  /** Hide week days */
  hideWeekDays?: WeekdayNumbers[];

  /**
   * Minimum display date.
   *
   * - Default: 2 year ago from today
   */
  minDate?: DateType;

  /**
   * Maximum display date.
   *
   * - Default: 2 year later from today
   */
  maxDate?: DateType;

  /**
   * Initial display date.
   *
   * - Default: today
   */
  initialDate?: DateType;

  /** Hour width */
  hourWidth?: number;

  /** Theme of calendar */
  theme?: DeepPartial<ThemeConfigs>;

  /**
   * Calendar Localization
   *
   * Default:
   * ```
   *     {
   *       en: { weekDayShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_') },
   *     }
   * ```
   * You can add more locales as needed, example usage:
   * ```
   *     const initialLocales = {
   *       ja: {
   *         weekDayShort: '日_月_火_水_木_金_土'.split('_'),
   *       },
   *       vi: {
   *         weekDayShort: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
   *       },
   *     };
   *
   *     <CalendarKit initialLocales={initialLocales} locale="ja" />
   * ```
   */
  initialLocales?: { [locale: string]: DeepPartial<LocaleConfigsProps> };

  /**
   * Current locale
   *
   * - Default: `en`
   */
  locale?: string;

  /**
   * Space between header view and time slots view.
   *
   * - Default: `16`
   */
  spaceFromTop?: number;

  /**
   * Space below time slots view.
   *
   * - Default: `16`
   */
  spaceFromBottom?: number;

  /**
   * Calendar start time (in minutes)
   *
   * - Default: `0`
   */
  start?: number;

  /**
   * Calendar end time (in minutes)
   *
   * - Default: `1440` (24 hours)
   */
  end?: number;

  /**
   * The interval of time slots in timeline. (in minutes)
   *
   * - Default: `60`
   */
  timeInterval?: number;

  /**
   * Initial time interval height
   *
   * - Default: `60`
   */
  timeIntervalHeight?: number;

  /**
   * Maximum time interval height.
   *
   * - Default: `116`
   */
  maxTimeIntervalHeight?: number;

  /**
   * Initial time interval height
   *
   * - Default: `60`
   */
  initialTimeIntervalHeight?: number;

  /**
   * Minimum time interval height.
   *
   * - Default: `60`
   */
  minTimeIntervalHeight?: number;

  /** Enable pinch to scale height of the calendar */
  allowPinchToZoom?: boolean;

  /** Custom time zone */
  timeZone?: string;

  /** Show week number */
  showWeekNumber?: boolean;

  /** Show loading progress */
  isLoading?: boolean;

  /** RTL mode */
  // isRTL?: boolean;

  /**
   * Unavailable hours
   *
   * Example:
   *
   * All days:
   *
   * ```ts
   * [
   *   { start: 0, end: 8 },
   *   { start: 12, end: 24 },
   * ]
   * ```
   *
   * Specific day:
   *
   * ```ts
   * {
   *   "2024-04-26": [
   *     { start: 0, end: 8 },
   *     { start: 12, end: 24 }
   *   ],
   *   // Day of week (1 - Monday ... 7 - Sunday)
   *   "7": [{ start: 0, end: 24 }]
   * }
   * ```
   */
  unavailableHours?:
    | Record<string, UnavailableHourProps[]>
    | UnavailableHourProps[];

  /** Style for day bar item */
  highlightDates?: Record<string, HighlightDateProps>;

  /** Events list */
  events?: EventItem[];

  /**
   * Auto scroll to current time. Please set to `false` if you want custom
   * initial scroll behavior.
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

  /** Allow drag to edit event */
  allowDragToEdit?: boolean;

  /**
   * Drag step
   *
   * Default is `15` minutes
   */
  dragStep?: number;

  /** Selected event */
  selectedEvent?: SelectedEventType;

  /**
   * Specify the number of pages to render ahead and behind the current page.
   *
   * Default is `2`
   */
  pagesPerSide?: number;

  /** Allow drag to create event */
  allowDragToCreate?: boolean;

  /**
   * Default duration when creating event
   *
   * Default is `30` minutes
   */
  defaultDuration?: number;

  /**
   * Determines how events that overlap in time are displayed.
   *
   * - 'no-overlap': Events will be displayed side by side without overlapping.
   * - 'overlap': Events will be displayed on top of each other, potentially
   *   overlapping.
   *
   * Default is `no-overlap`
   */
  overlapType?: 'no-overlap' | 'overlap';

  /**
   * Minimum start time difference (in minutes) between overlapping events.
   * Events with start times closer than this value will be considered
   * overlapping. This affects how events are positioned and displayed when
   * using 'overlap' overlapType.
   *
   * Default is `30` minutes
   */
  minStartDifference?: number;

  /** Resource list */
  resources?: ResourceItem[];

  /**
   * Column width will be animated when the number of days changes.
   *
   * Default is `false`
   */
  animateColumnWidth?: boolean;
}

export type Size = {
  width: number;
  height: number;
};
