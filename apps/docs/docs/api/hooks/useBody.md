---
sidebar_position: 3
---

# useBody

The `useBody` hook provides access to the body-related context within the React Native Calendar Kit. It allows you to interact with and customize the main body section of the calendar.

## Usage

```tsx
import { useBody } from '@howljs/calendar-kit';

function MyComponent() {
    const bodyContext = useBody();
    // Use bodyContext here
}
```

## Return Value

The `useBody` hook returns an object with the following properties:

- `renderHour` (function): Function to render custom hour components.
- `offsetY` (`SharedValue<number>`): Animated value for vertical offset.
- `minuteHeight` (`SharedValue<number>`): Animated value for the height of one minute.
- `maxTimelineHeight` (number): Maximum height of the timeline.
- `maxTimeIntervalHeight` (number): Maximum height of time intervals.
- `minTimeIntervalHeight` (number): Minimum height of time intervals.
- `timeIntervalHeight` (`SharedValue<number>`): Animated value for the height of time intervals.
- `allowPinchToZoom` (boolean): Whether pinch-to-zoom is allowed.
- `spaceFromTop` (number): Space from the top of the calendar body.
- `spaceFromBottom` (number): Space from the bottom of the calendar body.
- `timelineHeight` (`SharedValue<number>`): Animated value for the height of the timeline.
- `hours` (`Array<{ slot: number; time: string }>`): Array of hour objects.
- `hourFormat` (string): Format for displaying hours.
- `totalSlots` (number): Total number of time slots.
- `numberOfDays` (number): Number of days displayed.
- `hourWidth` (number): Width of the hour column.
- `start` (number): Start time of the calendar (in minutes from midnight).
- `end` (number): End time of the calendar (in minutes from midnight).
- `timeInterval` (number): Time interval between slots (in minutes).
- `showNowIndicator` (boolean): Whether to show the "now" indicator.
- `showTimeColumnRightLine` (boolean): Whether to show the vertical right bar next to hours.
- `columnWidth` (number): Width of each day column.
- `calendarLayout` (object): Contains `width` and `height` of the calendar layout.
- `isRTL` (boolean): Whether the calendar is in right-to-left mode.
- `columns` (number): Number of columns in the calendar view.
- `calendarData` (object): Contains calendar-related data.
- `renderCustomOutOfRange` (function): Function to render custom out-of-range components.
- `renderCustomUnavailableHour` (function): Function to render custom unavailable hour components.
- `renderEvent` (function): Function to render custom event components.
- `startOffset` (`SharedValue<number>`): Animated value for the start offset.
- `rightEdgeSpacing` (number): Spacing at the right edge of events.
- `overlapEventsSpacing` (number): Spacing between overlapping events.
- `visibleDateUnixAnim` (`SharedValue<number>`): Animated value for the visible date Unix timestamp.
- `NowIndicatorComponent` (React.ReactElement | null): Custom component for the "now" indicator.
- `allowDragToCreate` (boolean): Whether drag-to-create events is allowed.
- `allowDragToEdit` (boolean): Whether drag-to-edit events is allowed.

## Example

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useBody } from '@howljs/calendar-kit';

function BodyInfo() {
    const { hourFormat, start, end, showNowIndicator } = useBody();

    return (
    <View>
        <Text>Hour format: {hourFormat}</Text>
        <Text>Start time: {start} minutes</Text>
        <Text>End time: {end} minutes</Text>
        <Text>Show now indicator: {showNowIndicator ? 'Yes' : 'No'}</Text>
    </View>
    );
}

export default BodyInfo;
```


This example demonstrates how to use the `useBody` hook to access and display some of the body-related information of the calendar.
