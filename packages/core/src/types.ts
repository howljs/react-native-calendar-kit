import type { DateTime } from 'luxon';
import type { GestureResponderEvent, TextStyle, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

export type DateOnlyType = {
  date: string;
  dateTime?: never;
  timeZone?: never;
};

export type DateType = Date | number | string | DateTime;

export type DateTimeType = {
  dateTime: string;
  timeZone?: string;
  date?: never;
};

export type DateOrDateTime = DateOnlyType | DateTimeType;

export interface SizeAnimation {
  width: SharedValue<number>;
  height: SharedValue<number>;
}

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export interface LocaleConfigsProps {
  weekDayShort: string[];
  meridiem: { ante: string; post: string };
  more: string;
}

export interface HighlightDateProps {
  dayName?: TextStyle;
  dayNumber?: TextStyle;
  dayNumberContainer?: ViewStyle;
  isTodayOverride?: boolean;
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
  onPressEvent?: (event: any) => void;

  /** Callback when the drag event is started */
  onDragEventStart?: (event: any) => void;

  /** Callback when the drag event is ended */
  onDragEventEnd?: (event: any) => Promise<void> | void;

  /** Callback when the event is long pressed */
  onLongPressEvent?: (event: any) => void;

  /** Callback when the selected event is dragged */
  onDragSelectedEventStart?: (event: any) => void;

  /** Callback when the selected event is dragged */
  onDragSelectedEventEnd?: (event: any) => Promise<void> | void;

  /** Callback when the drag create event is started */
  onDragCreateEventStart?: (event: any) => void;

  /** Callback when the drag create event is ended */
  onDragCreateEventEnd?: (event: any) => Promise<void> | void;

  /** Callback when the calendar is loaded */
  onLoad?: () => void;
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
