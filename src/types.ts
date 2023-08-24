import { ViewStyle } from 'react-native';

export type CalendarViewMode =
  | 'day'
  | 'threeDays'
  | 'week'
  | 'workWeek'
  | 'month';

export type FirstDayOfWeek = 'monday' | 'saturday' | 'sunday';

export interface CalendarProviderProps {
  viewMode?: CalendarViewMode;
  theme?: Partial<CalendarKitTheme>;
  containerStyle?: ViewStyle;
  dayBarHeight?: number;
  hourWidth?: number;
  isRTL?: boolean;

  // Hours
  start?: number;
  end?: number;
  timeInterval?: number;
  hourFormat?: string;

  firstDay?: FirstDayOfWeek;
  minDate?: string;
  maxDate?: string;
  initialDate?: string;

  delayLongPressToCreate?: number;
  timeZone?: string;

  /**
   * Specify how many items in advance you want views to be rendered.
   * Increasing this value can help reduce blanks (if any). However,
   * keeping this as low as possible should be the intent.
   * Higher values also increase re-render compute
   *
   * Default: 2
   */
  renderAheadItem?: number;

  initialLocales?: { [locale: string]: LocaleConfigs };

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

  useAllDayFilter?: boolean;

  allDayEventHeight?: number;

  initialTimeIntervalHeight?: number;
}

export interface CalendarInnerProps {
  onDateChanged?: (date: string) => void;
  onChange?: (date: string) => void;
  locale?: string;
  OutsideDateRangeComponent?: React.ReactElement;
  /**
   * Unavailable hours
   *
   * Support:
   * ```
   * {"2023-08-10": [{start: 0, end:24}], "3": [{start: 0, end: 8}]}
   * ```
   * or
   * ```
   * [{start: 0, end:24}]
   * ```
   */
  unavailableHours?: UnavailableHour[] | { [key: string]: UnavailableHour[] };

  /**
   * Unavailable hours
   *
   * Support:
   * ```
   * {"2023-08-10": {backgroundColor: 'red'}, "2023-08-11": {backgroundColor: 'blue'}}
   * ```
   * or
   * ```
   * ["2023-08-10", "2023-08-11"]
   * ```
   */
  holidays?: string[] | { [date: string]: SpecialRegionProps };

  sendTimelineBorderToBack?: boolean;

  events?: EventItem[];

  /** Callback function will be called when the event item is pressed */
  onPressEvent?: (event: EventItem) => void;

  onLongPressEvent?: (event: EventItem) => void;

  onPressDayNumber?: (date: string) => void;

  autoUpdateNowIndicator?: boolean;

  showNowIndicator?: boolean;
}

export interface EventItem extends Record<string, any> {
  /** Unique ID for the event. */
  id: string;
  /** Start date of the event. (Date or ISOString) */
  start: Date | string;
  /** End date of the event. (Date or ISOString)*/
  end: Date | string;
  /** Title of the event */
  title?: string;
  /** Background color of the event */
  color?: string;

  recurrenceRule?: string;

  /** (Date or ISOString) */
  recurrenceExDates?: Array<Date | string>;
}

export interface PackedEvent {
  event: EventItem;
  index: number;
  total: number;
  columnSpan: number;
}

export interface CalendarKitHandle {
  goToDate: (props?: {
    date?: Date;
    animatedDate?: boolean;
    hourScroll?: boolean;
    animatedHour?: boolean;
  }) => void;
  goToHour: (hour: number, animated?: boolean) => void;
  goToNextPage: (animated?: boolean) => void;
  goToPrevPage: (animated?: boolean) => void;
  notifyDataChanged: () => void;
  syncDate: (date: string) => void;
}

export interface CalendarKitProps
  extends CalendarProviderProps,
    CalendarInnerProps {}

export interface CalendarKitTheme {
  primaryColor: string;
  supportPrimaryColor: string;
  backgroundColor: string;
  cellBorderColor: string;

  hourColumn: { backgroundColor: string };
  dayBar: {
    backgroundColor: string;
  };

  unavailableBackgroundColor: string;

  nowIndicatorColor: string;
}

export type HourItemType = { text: string; hourNumber: number };

export type DateData = {
  data: number[];
  index: number;
  extraColumns: number;
  minDate: number;
  maxDate: number;
};

export type PagesType = {
  day: DateData;
  week: DateData;
  threeDays: DateData;
  workWeek: DateData;
  month: DateData;
};

export interface UnavailableHour extends SpecialRegionProps {
  start: number;
  end: number;
}

export interface SpecialRegionProps {
  backgroundColor?: string;
  CustomContentComponent?: React.ReactElement;
}

export interface LocaleConfigs {
  weekDayShort: string[];
}
