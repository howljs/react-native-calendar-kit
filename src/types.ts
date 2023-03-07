import type {
  GestureResponderEvent,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import type { TimeZone, timeZoneData } from './assets/timeZone';

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
    alternativeName: string;
    raw: string;
    countryName: string;
  }[];
  getZone: (zoneName: keyof typeof timeZoneData) => {
    name: string;
    alternativeName: string;
    raw: string;
    countryName: string;
  };
  getHour: () => number;
  getDate: () => string;
  goToHour: (hour: number, animated?: boolean) => void;
  forceUpdateNowIndicator: (customDate?: string) => void;
  /**
   * * scale: Change `timeIntervalHeight` by scale value
   * * height: Change `timeIntervalHeight` to height value
   * * props is `undefined`: Change `timeIntervalHeight` to initialTimeIntervalHeight
   */
  zoom: (props?: { scale?: number; height?: number }) => void;
}

export interface TimelineCalendarProps
  extends TimelineProps,
    TimelineProviderProps {}

export interface TimelineProps {
  /** Custom header component */
  renderDayBarItem?: (props: DayBarItemProps) => JSX.Element;
  /** Callback function will be called when day in header is pressed */
  onPressDayNum?: (date: string) => void;
  /** Callback function will be called when the create box is dropped */
  onDragCreateEnd?: (props: RangeTime) => void;
  /** Callback function will be called when time slots view is pressed */
  onPressBackground?: (date: string, event: GestureResponderEvent) => void;
  /** Callback function will be called when time slots view is long pressed */
  onLongPressBackground?: (date: string, event: GestureResponderEvent) => void;
  /** Callback function will be called when time slots view is pressed out */
  onPressOutBackground?: (date: string, event: GestureResponderEvent) => void;
  /** Callback function will be called when the event item is long pressed */
  onDateChanged?: (date: string) => void;
  /** Show loading bar */
  isLoading?: boolean;
  /** Set unavailable days
   *
   * Format of the item in the array: `YYYY-MM-DD`
   */
  holidays?: string[];
  /** Events will be displayed in the timeline view. events is a array of {@link EventItem}*/
  events?: EventItem[];
  /** Callback function will be called when the event item is pressed */
  onPressEvent?: (eventItem: PackedEvent) => void;
  /** Callback function will be called when the event item is long pressed */
  onLongPressEvent?: (eventItem: PackedEvent) => void;
  /** Custom component rendered inside an event */
  renderEventContent?: (
    event: PackedEvent,
    timeIntervalHeight: SharedValue<number>
  ) => JSX.Element;
  /** Custom component rendered inside an selected event */
  renderSelectedEventContent?: (
    event: PackedEvent,
    timeIntervalHeight: SharedValue<number>
  ) => JSX.Element;
  /** When selectedEvent is declared, edit mode will be enabled */
  selectedEvent?: PackedEvent;
  /** Callback function will be called when the selected event item is dropped*/
  onEndDragSelectedEvent?: (event: PackedEvent) => void;
  /** Custom Unavailable Item */
  renderCustomUnavailableItem?: (props: UnavailableItemProps) => JSX.Element;
  /** Custom style of day bar by date ([#Example](https://howljs.github.io/react-native-calendar-kit/docs/guides/custom-header#highlightdates)) */
  highlightDates?: HighlightDates;
  /** Callback function will be called when index changed */
  onChange?: (props: OnChangeProps) => void;

  /** Enable drag with selected event.
   *
   * Default: `true
   */
  editEventGestureEnabled?: boolean;

  /** Custom Component of the change height handle */
  EditIndicatorComponent?: JSX.Element;

  /** Custom line in the middle of the interval. */
  renderHalfLineCustom?: (width: number) => JSX.Element;

  /** Container style of the line in the middle of the interval. */
  halfLineContainerStyle?: ViewStyle;

  /** Callback function will be called when the time interval height is changed */
  onTimeIntervalHeightChange?: (height: number) => void;
}

export interface UnavailableItemProps {
  timeIntervalHeight: SharedValue<number>;
  hour: number;
  width: number;
}

export type CalendarViewMode = 'day' | 'week' | 'threeDays' | 'workWeek';

export interface TimelineProviderProps {
  /** Calendar view mode.
   *
   * * Default: `week`
   */
  viewMode?: CalendarViewMode;

  /** First day of the week.
   *
   ** Default: `1` (Monday)
   */
  firstDay?: number;

  /** Minimum display date.
   *
   ** Format: YYYY-MM-DD.
   ** Default: 2 year ago from today
   */
  minDate?: string;

  /** Maximum display date.
   *
   ** Format: YYYY-MM-DD.
   ** Default: 2 year later from today
   */
  maxDate?: string;

  /** Initial display date.
   *
   ** Format: YYYY-MM-DD.
   ** Default: today  */
  initialDate?: string;

  /** Day start time (in hours)
   *
   ** Default: `0`
   */
  start?: number;

  /** Day end time (in hours)
   *
   ** Default: `24`
   */
  end?: number;

  /** Width of hour column.
   *
   ** Default: `53`
   */
  hourWidth?: number;

  /** The interval of time slots in timeline. (in minutes)
   *
   ** Default: `60`
   */
  timeInterval?: number;

  /** Initial time interval height
   *
   ** Default: `60`
   */
  initialTimeIntervalHeight?: number;

  /** Minimum time interval height. If you don't specify it, it will automatically scale to fit the screen */
  minTimeIntervalHeight?: number;

  /** Maximum time interval height.
   *
   ** Default: `116`
   */
  maxTimeIntervalHeight?: number;

  /** Auto scroll header when scroll time slots view.
   *
   ** Default: `true`
   */
  syncedLists?: boolean;

  /** Theme of the calendar */
  theme?: ThemeProperties;

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

  /** Show a line in the middle of the interval.
   *
   ** Default: `true`
   */
  isShowHalfLine?: boolean;

  /** Enable drag and drop to create event */
  allowDragToCreate?: boolean;

  /** Enable pinch to scale height of the calendar */
  allowPinchToZoom?: boolean;

  /** Initial time interval (in minutes) when you drag to create event.
   *
   ** Default: `60`
   */
  dragCreateInterval?: number;

  /** Handle the navigation to next/previous time (in minutes) while dragging event to create/edit.
   *
   ** Default: `10`
   */
  dragStep?: number;

  /** Set unavailable hours of the calendar
   *
   ** All days in a week ([#Example](https://howljs.github.io/react-native-calendar-kit/docs/guides/unavailable-time#set-unavailable-hours-for-all-days-in-a-week))
   ** By week day. ([#Example](https://howljs.github.io/react-native-calendar-kit/docs/guides/unavailable-time#set-unavailable-hours-by-week-day))
   */
  unavailableHours?:
    | UnavailableHour[]
    | { [weekDay: string]: UnavailableHour[] };

  /** Show a line at current time.
   *
   ** Default: `true`
   * */
  showNowIndicator?: boolean;

  /** Spacing at the right edge of events.
   *
   ** Default: `1`
   */
  rightEdgeSpacing?: number;

  /** Spacing between overlapping events.
   *
   ** Default: `1`
   */
  overlapEventsSpacing?: number;

  /** Auto scroll to current time when mounted.
   *
   ** Default: `true`
   */
  scrollToNow?: boolean;

  /** Changing locale globally
   *
   ** Default: `en`
   *
   If you want to use a custom locale, please use it with `MomentConfig`

   Example:
   ```javascript
    import {MomentConfig} from '@howljs/calendar-kit';
    MomentConfig.updateLocale('ja', {
        weekdaysShort: '日_月_火_水_木_金_土'.split('_'),
    });
   ```
   */
  locale?: LocaleType;

  /** Show/Hide header component.
   *
   ** Default: `true`
   */
  isShowHeader?: boolean;

  /** Hour format.
   *
   ** Default: HH:mm
   */
  hourFormat?: string;

  /** How long the animation should last when the style of the event is changed.
   *
   ** Default: `250` */
  eventAnimatedDuration?: number;

  /**
   * Use Haptic Feedback when drag to create/edit.
   *
   * Only support **Bare React Native project**
   *
   **/
  useHaptic?: boolean;

  /** Use calendar in different time zones */
  timeZone?: TimeZone;

  /** Update indicator at specified intervals (in milliseconds).
   *
   ** Default: `1000`
   */
  nowIndicatorInterval?: number;

  /**
   * Handle the navigation time (in milliseconds) when navigating to previous/next page while dragging
   *
   ** Default: **1000**
   */
  navigateDelay?: number;

  /** Width of calendar */
  calendarWidth?: number;
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
  tzOffset: string;
  currentDate: string;
}

export interface ThemeProperties {
  /** Border color of the calendar */
  cellBorderColor?: string;
  /** Background color of the calendar */
  backgroundColor?: string;
  /** Background color of the create box when dragging to create */
  dragCreateItemBackgroundColor?: string;
  /** The color of the loading bar */
  loadingBarColor?: string;
  /** Background color of unavailable hours */
  unavailableBackgroundColor?: string;
  /** Color of the change height handle */
  editIndicatorColor?: string;
  /** Color of the now indicator */
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
  minimumEventHeight?: number;

  allowFontScaling?: boolean;
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
  /** Unique ID for the event. */
  id: string;
  /** Start date of the event. (ISOString) */
  start: string;
  /** End date of the event. (ISOString) */
  end: string;
  /** Title of the event */
  title?: string;
  /** Background color of the event */
  color?: string;
  /** Container style of the event */
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

export type LocaleType = string;

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
