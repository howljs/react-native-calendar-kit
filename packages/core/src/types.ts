import type { DateTime } from 'luxon';
import type { GestureResponderEvent, TextStyle, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

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

export interface UnavailableHourProps extends Record<string, any> {
  /** Start hour (in minutes) */
  start: number;

  /** Start hour (in minutes) */
  end: number;
  enableBackgroundInteraction?: boolean;
  backgroundColor?: string;
}

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

export interface SelectedEventType extends Omit<EventItem, 'id'> {
  id?: string;
  isDirty?: boolean;
}

export interface DraggingEventType extends Omit<EventItem, 'id'> {
  id?: string;
}

export interface SizeAnimation {
  width: SharedValue<number>;
  height: SharedValue<number>;
}

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export interface OutOfRangeProps extends SizeAnimation {}

export interface RenderHourProps {
  hourStr: string;
  minutes: number;
  style: TextStyle;
}

export interface LocaleConfigsProps {
  weekDayShort: string[];
  meridiem: { ante: string; post: string };
  more: string;
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
    eventIndex?: number;
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

export interface HighlightDateProps {
  dayName?: TextStyle;
  dayNumber?: TextStyle;
  dayNumberContainer?: ViewStyle;
  isTodayOverride?: boolean;
}

export interface OnEventResponse extends EventItem {
  localId: string;
  isDirty?: boolean;
}

export interface OnCreateEventResponse {
  start: DateTimeType;
  end: DateTimeType;
  resourceId?: string;
}

export interface PackedAllDayEvent extends EventItemInternal {
  _internal: EventItemInternal['_internal'] & {
    rowIndex: number;
    startIndex: number;
    columnSpan: number;
  };
}

export interface ActionsProviderProps {
  /** Callback when the date is changed (scrolling) */
  onChange?: (date: string) => void;
  /** Callback when the date is changed */
  onDateChanged?: (date: string) => void;
  /** Callback when the background is pressed */
  onPressBackground?: (props: DateOrDateTime, event: GestureResponderEvent) => void;

  /** Callback when the background is long pressed */
  onLongPressBackground?: (props: DateOrDateTime, event: GestureResponderEvent) => void;

  /** Callback when the day number is pressed */
  onPressDayNumber?: (date: string) => void;
  /** Enable pull to refresh */
  onRefresh?: (date: string) => void;

  /** Callback when the event is pressed */
  onPressEvent?: (event: PackedEvent) => void;

  /** Callback when the drag event is started */
  onDragEventStart?: (event: OnEventResponse) => void;

  /** Callback when the drag event is ended */
  onDragEventEnd?: (event: OnEventResponse) => Promise<void> | void;

  /** Callback when the event is long pressed */
  onLongPressEvent?: (event: PackedEvent) => void;

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
  draggingHourContainerStyle?: ViewStyle;
  draggingHourTextStyle?: TextStyle;

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

  progressBarStyle?: {
    height?: number;
    color?: string;
  };
}

export interface ResourceItem extends Record<string, any> {
  /** ID for the resource. */
  id: string;

  /** Title for the resource. */
  title: string;
}
