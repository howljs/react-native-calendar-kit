import type { DateTime } from 'luxon';
import type { TextStyle, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import type { DraggableEventProps } from './components/DraggableEvent';
import type { DraggingEventProps } from './components/DraggingEvent';

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

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

export type GoToDateOptions = {
  date?: DateType;
  animatedDate?: boolean;
  hourScroll?: boolean;
  animatedHour?: boolean;
};

export interface CalendarKitHandle {
  /**
   * Navigates to a specific date and optionally scrolls to a specific hour.
   */
  goToDate: (props?: GoToDateOptions) => void;
  /**
   * Scrolls to a specific hour.
   */
  goToHour: (hour: number, animated?: boolean) => void;
  /**
   * Navigates to the next page of the calendar.
   */
  goToNextPage: (animated?: boolean, forceScrollByDay?: boolean) => void;

  /**
   * Navigates to the previous page of the calendar.
   */
  goToPrevPage: (animated?: boolean, forceScrollByDay?: boolean) => void;
  /**
   * - Scale: Change `timeIntervalHeight` by scale value
   * - Height: Change `timeIntervalHeight` to height value
   * - Props is `undefined`: Change `timeIntervalHeight` to
   *   initialTimeIntervalHeight
   */
  zoom: (props?: { scale?: number; height?: number }) => void;

  /**
   * Set the visible date of the calendar.
   */
  setVisibleDate: (date: string) => void;
  getDateByOffset: (position: { x: number; y: number }) => string | null;
  getEventByOffset: (position: { x: number; y: number }) => EventItem | null;
  /** Duration in minutes */
  getSizeByDuration: (duration: number) => { width: number; height: number };
  /**
   * Get visible start date time
   */
  getVisibleStart: () => string;
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

export interface ResourceItem extends Record<string, any> {
  /** ID for the resource. */
  id: string;

  /** Title for the resource. */
  title: string;
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

export interface OutOfRangeProps extends SizeAnimation {}

export type HeaderItemProps = {
  index: number;
  startUnix: number;
  extra: Record<string, any>;
};

export interface CalendarHeaderProps {
  /**
   * Day bar height
   *
   * - Default: `60`
   */
  dayBarHeight?: number;

  /** Custom header item
   *
   * Note: Please use `useCallback` to memoize the function
   */
  renderHeaderItem?: (props: HeaderItemProps) => React.ReactElement | null;

  /** Custom expand icon
   *
   * Note: Please use `useCallback` to memoize the function
   */
  renderExpandIcon?: (props: {
    isExpanded: SharedValue<boolean>;
  }) => React.ReactElement | null;

  /** Custom event item
   *
   * Note: Please use `useCallback` to memoize the function
   */
  renderEvent?: (
    event: PackedAllDayEvent,
    size: SizeAnimation
  ) => React.ReactNode;

  /**
   * Custom day item
   *
   * Note: Please use `useCallback` to memoize the function
   */
  renderDayItem?: (date: { dateUnix: number }) => React.ReactNode;

  /** Custom left area (multiple days) */
  LeftAreaComponent?: React.ReactElement | null | undefined;

  /** Header bottom height */
  headerBottomHeight?: number;

  collapsedItems?: number;

  /**
   * Minimum minutes to calculate height of all day event (scale by
   * timeInterval)
   *
   * Default: `15`
   */
  eventMinMinutes?: number;

  /**
   * Maximum minutes to calculate height of all day event (scale by
   * timeInterval)
   *
   * Default: `30`
   */
  eventMaxMinutes?: number;

  /**
   * Initial minutes to calculate height of all day event (scale by
   * timeInterval)
   *
   * Default: `20`
   */
  eventInitialMinutes?: number;
}

export interface CalendarBodyProps {
  /** Custom hour text */
  hourFormat?: string;

  /** Custom hour text
   *
   * Note: Please use `useCallback` to memoize the function
   */
  renderHour?: (props: RenderHourProps) => React.ReactElement | null;

  /** Custom dragging hour text
   *
   * Note: Please use `useCallback` to memoize the function
   */
  renderDraggingHour?: (props: RenderHourProps) => React.ReactElement | null;

  /** Show now indicator */
  showNowIndicator?: boolean;

  /** Custom Out of Range item
   *
   * Note: Please use `useCallback` to memoize the function
   */
  renderCustomOutOfRange?: (
    props: OutOfRangeProps
  ) => React.ReactElement | null;

  /** Custom Unavailable Item
   *
   * Note: Please use `useCallback` to memoize the function
   */
  renderCustomUnavailableHour?: (
    props: UnavailableHourProps & {
      width: SharedValue<number>;
      height: SharedValue<number>;
    }
  ) => React.ReactElement | null;

  /** Custom event item
   *
   * Note: Please use `useCallback` to memoize the function
   */
  renderEvent?: (
    event: PackedEvent,
    size: SizeAnimation
  ) => React.ReactElement | null;

  /** Custom draggable event item
   *
   * Note: Please use `useCallback` to memoize the function
   */
  renderDraggableEvent?: (
    props: DraggableEventProps
  ) => React.ReactElement | null;

  /** Custom dragging event item
   *
   * Note: Please use `useCallback` to memoize the function
   */
  renderDraggingEvent?: (
    props: DraggingEventProps
  ) => React.ReactElement | null;

  /** Custom now indicator */
  NowIndicatorComponent?: React.ReactElement | null;
}

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

export interface SizeAnimation {
  width: SharedValue<number>;
  height: SharedValue<number>;
}
