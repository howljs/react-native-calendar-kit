---
sidebar_position: 2
---

# useHeader

The `useHeader` hook provides access to the header-related context within the React Native Calendar Kit. It allows you to interact with and customize the calendar's header section.

## Usage

```tsx
import { useHeader } from '@howljs/calendar-kit';

function MyComponent() {
    const headerContext = useHeader();
    // Use headerContext here
}
```

## Return Value

The `useHeader` hook returns an object with the following properties:

- `dayBarHeight` (number): The height of the day bar in the header.
- `numberOfDays` (number): The number of days displayed in the calendar view.
- `calendarLayout` (object): Contains `width` and `height` of the calendar layout.
- `hourWidth` (number): The width of the hour column.
- `minuteHeight` (`Animated.SharedValue<number>`): An animated value representing the height of one minute in the calendar.
- `isRTL` (boolean): Indicates if the calendar is in right-to-left mode.
- `scrollByDay` (boolean): Indicates if the calendar scrolls by day.
- `columns` (number): The number of columns in the calendar view.
- `calendarData` (object): Contains calendar-related data.
- `eventHeight` (`Animated.SharedValue<number>`): An animated value representing the height of events.
- `isExpanded` (`Animated.SharedValue<boolean>`): An animated value indicating if the header is expanded.
- `allDayEventsHeight` (`Animated.SharedValue<number>`): An animated value representing the height of all-day events.
- `columnWidth` (number): The width of each day column.
- `useAllDayEvent` (boolean): Indicates if all-day events are being used.
- `isShowExpandButton` (`Animated.SharedValue<boolean>`): An animated value indicating if the expand button should be shown.
- `collapsedItems` (number): The number of items to show when the header is collapsed.
- `headerBottomHeight` (number): The height of the bottom section of the header.
- `rightEdgeSpacing` (number): The spacing at the right edge of the calendar.
- `overlapEventsSpacing` (number): The spacing between overlapping events.
- `firstDay` (number): The first day of the week (0 for Sunday, 1 for Monday, etc.).

## Example

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useHeader } from '@howljs/calendar-kit';

function HeaderInfo() {
    const { numberOfDays, dayBarHeight, isRTL } = useHeader();

    return (
    <View>
        <Text>Number of days: {numberOfDays}</Text>
        <Text>Day bar height: {dayBarHeight}</Text>
        <Text>RTL mode: {isRTL ? 'Yes' : 'No'}</Text>
    </View>
    );
}

export default HeaderInfo;
```

This example demonstrates how to use the `useHeader` hook to access and display some of the header-related information.
