---
sidebar_position: 1
---

# CalendarContainer

The `CalendarContainer` component is the main wrapper for the React Native Calendar Kit. It provides the necessary context and configuration for all child components, managing the overall state and behavior of the calendar.

## Props

The `CalendarContainer` component accepts the following props:

| Prop Name                    | Type     | Default          | Description                                                                    |
| ---------------------------- | -------- | ---------------- | ------------------------------------------------------------------------------ |
| `calendarWidth`              | number   | -                | Width of the calendar. If not provided, it uses the parent width.              |
| `theme`                      | object   | -                | Custom theme object for styling the calendar.                                  |
| `hourWidth`                  | number   | 60               | Width of the hour column.                                                      |
| `firstDay`                   | number   | 1                | First day of the week (0 for Sunday, 1 for Monday, etc.).                      |
| `minDate`                    | string   | 2 years ago      | Minimum selectable date.                                                       |
| `maxDate`                    | string   | 2 years from now | Maximum selectable date.                                                       |
| `initialDate`                | string   | Today            | Initial date to display.                                                       |
| `initialLocales`             | object   | -                | Initial locales for internationalization.                                      |
| `locale`                     | string   | en               | Locale string for date formatting.                                             |
| `isLoading`                  | boolean  | false            | Whether the calendar is in a loading state.                                    |
| `spaceFromTop`               | number   | 16               | Space from the top of the calendar.                                            |
| `spaceFromBottom`            | number   | 16               | Space from the bottom of the calendar.                                         |
| `start`                      | number   | 0                | Start hour of the calendar (in minutes).                                       |
| `end`                        | number   | 1440             | End hour of the calendar (in minutes).                                         |
| `timeInterval`               | number   | 60               | Time interval between slots (in minutes).                                      |
| `maxTimeIntervalHeight`      | number   | 124              | Maximum height of a time interval.                                             |
| `minTimeIntervalHeight`      | number   | 60               | Minimum height of a time interval.                                             |
| `allowPinchToZoom`           | boolean  | false            | Whether to allow pinch-to-zoom gesture.                                        |
| `initialTimeIntervalHeight`  | number   | 60               | Initial height of a time interval.                                             |
| `timeZone`                   | string   | -                | Time zone for the calendar.                                                    |
| `showWeekNumber`             | boolean  | false            | Whether to show week numbers.                                                  |
| `onChange`                   | function | -                | Callback when the visible range changes.                                       |
| `onDateChanged`              | function | -                | Callback when the selected date changes.                                       |
| `onPressBackground`          | function | -                | Callback when the background is pressed.                                       |
| `onPressDayNumber`           | function | -                | Callback when a day number is pressed.                                         |
| `onRefresh`                  | function | -                | Callback for pull-to-refresh action.                                           |
| `unavailableHours`           | array    | -                | Array of unavailable hours.                                                    |
| `highlightDates`             | object   | -                | Object defining dates to highlight.                                            |
| `events`                     | array    | -                | Array of event objects to display.                                             |
| `onPressEvent`               | function | -                | Callback when an event is pressed.                                             |
| `numberOfDays`               | number   | 7                | Number of days to display.                                                     |
| `scrollByDay`                | boolean  | -                | Whether to scroll by day or week.                                              |
| `scrollToNow`                | boolean  | true             | Whether to scroll to the current time on load.                                 |
| `useHaptic`                  | boolean  | false            | Whether to use haptic feedback.                                                |
| `dragStep`                   | number   | 15               | Step size for dragging events (in minutes).                                    |
| `allowDragToEdit`            | boolean  | false            | Whether to allow dragging to edit events.                                      |
| `onDragEventStart`           | function | -                | Callback when event dragging starts.                                           |
| `onDragEventEnd`             | function | -                | Callback when event dragging ends.                                             |
| `onLongPressEvent`           | function | -                | Callback for long press on an event.                                           |
| `selectedEvent`              | object   | -                | Currently selected event.                                                      |
| `pagesPerSide`               | number   | 2                | Number of pages to render on each side of the current page.                    |
| `hideWeekDays`               | array    | -                | Array of week days to hide (1-7 where 1 is Monday and 7 is Sunday).            |
| `allowDragToCreate`          | boolean  | false            | Whether to allow drag-to-create events.                                        |
| `defaultDuration`            | number   | 30               | Default duration for new events (in minutes).                                  |
| `onDragCreateEventStart`     | function | -                | Callback when drag-to-create starts.                                           |
| `onDragCreateEventEnd`       | function | -                | Callback when drag-to-create ends.                                             |
| `useAllDayEvent`             | boolean  | true             | Whether to use all-day events.                                                 |
| `rightEdgeSpacing`           | number   | 1                | Spacing from the right edge of events.                                         |
| `overlapEventsSpacing`       | number   | 1                | Spacing between overlapping events.                                            |
| `minRegularEventMinutes`     | number   | 1                | Minimum duration for regular events (in minutes).                              |
| `onLoad`                     | function | -                | Callback when the calendar finishes loading.                                   |
| `overlapType`                | string   | -                | Type of event overlap handling.                                                |
| `minStartDifference`         | number   | -                | Minimum difference between event start times for overlap.                      |
| `onLongPressBackground`      | function | -                | Callback for long press on the background.                                     |
| `resources`                  | array    | -                | Array of resources to display. Activates resources view mode.                  |
| `maxResourcesColumnsPerPage` | number   | false            | Maximum number of resources to display per column. The rest will be scrollable |
