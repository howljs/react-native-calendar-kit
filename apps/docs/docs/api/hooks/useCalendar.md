---
sidebar_position: 1
---

# useCalendar

The `useCalendar` hook provides access to the main calendar context within the React Native Calendar Kit. It allows you to interact with and customize various aspects of the calendar.

## Usage

```tsx
import { useCalendar } from '@howljs/calendar-kit';

function MyComponent() {
  const calendarContext = useCalendar();
  // Use calendarContext here
}
```

## Return Value

The `useCalendar` hook returns an object with numerous properties and functions. Here are some of the key ones:

- `calendarLayout` (object): Contains `width` and `height` of the calendar layout.
- `hourWidth` (number): The width of the hour column.
- `calendarData` (object): Contains calendar-related data.
- `numberOfDays` (number): The number of days displayed in the calendar view.
- `visibleDateUnix` (`SharedValue<number>`): The Unix timestamp of the currently visible date.
- `verticalListRef` (RefObject): Reference to the vertical list component.
- `dayBarListRef` (RefObject): Reference to the day bar list component.
- `gridListRef` (RefObject): Reference to the grid list component.
- `columnWidthAnim` (`SharedValue<number>`): Animated value for column width.
- `firstDay` (number): The first day of the week (0 for Sunday, 1 for Monday, etc.).
- `offsetY` (`SharedValue<number>`): Animated value for vertical offset.
- `minuteHeight` (`SharedValue<number>`): Animated value for the height of one minute.
- `timeIntervalHeight` (`SharedValue<number>`): Animated value for the height of time intervals.
- `allowPinchToZoom` (boolean): Whether pinch-to-zoom is allowed.
- `spaceFromTop` (number): Space from the top of the calendar.
- `spaceFromBottom` (number): Space from the bottom of the calendar.
- `timelineHeight` (`SharedValue<number>`): Animated value for the height of the timeline.
- `slots` (number[]): Array of time slots.
- `start` (number): Start time of the calendar (in minutes from midnight).
- `end` (number): End time of the calendar (in minutes from midnight).
- `timeInterval` (number): Time interval between slots (in minutes).
- `scrollVisibleHeight` (`RefObject<number>`): Reference to the visible scroll height.
- `showWeekNumber` (boolean): Whether to show week numbers.
- `calendarGridWidth` (number): Width of the calendar grid.
- `columnWidth` (number): Width of each column.
- `scrollByDay` (boolean): Whether to scroll by day.
- `scrollByResource` (boolean): Whether to scroll by resource (always false for non-resources mode).
- `initialOffset` (number): Initial scroll offset.
- `isRTL` (boolean): Whether the calendar is in right-to-left mode.
- `snapToInterval` (number | undefined): Interval for snapping while scrolling.
- `columns` (number): Number of columns in the calendar view.
- `visibleDateUnixAnim` (`SharedValue<number>`): Animated value for the visible date Unix timestamp.
- `startOffset` (`SharedValue<number>`): Animated value for the start offset.
- `scrollVisibleHeightAnim` (`SharedValue<number>`): Animated value for the visible scroll height.
- `pagesPerSide` (number): Number of pages to render on each side of the current page.
- `hideWeekDays` (number[]): Array of week days to hide.
- `visibleWeeks` (`SharedValue<number[]`>): Animated value for visible weeks.
- `useAllDayEvent` (boolean): Whether to use all-day events.
- `hapticService` (HapticService): Service for haptic feedback.
- `rightEdgeSpacing` (number): Spacing at the right edge of events.
- `overlapEventsSpacing` (number): Spacing between overlapping events.
- `allowDragToCreate` (boolean): Whether drag-to-create events is allowed.
- `allowDragToEdit` (boolean): Whether drag-to-edit events is allowed.

## Example

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useCalendar } from '@howljs/calendar-kit';

function CalendarInfo() {
  const { numberOfDays, firstDay, allowPinchToZoom } = useCalendar();

  return (
    <View>
      <Text>Number of days: {numberOfDays}</Text>
      <Text>First day of week: {firstDay}</Text>
      <Text>Pinch to zoom: {allowPinchToZoom ? 'Enabled' : 'Disabled'}</Text>
    </View>
  );
}

export default CalendarInfo;
```

This example demonstrates how to use the `useCalendar` hook to access and display some of the calendar-related information.
