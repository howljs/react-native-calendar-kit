---
sidebar_position: 10
---
# Available methods

React Native Calendar Kit provides several methods that you can use to programmatically control the calendar. These methods are accessible through a ref attached to the CalendarKit component.

## Accessing Methods

To use these methods, first create a ref and attach it to the CalendarKit component:

```tsx
import React, { useRef } from 'react';
import { CalendarKit } from '@howljs/calendar-kit';

function MyCalendar() {
  const calendarRef = useRef(null);

  return <CalendarKit ref={calendarRef} />;
}
```

Now you can call methods on `calendarRef.current`.

## Available Methods

### goToDate

Navigates to a specific date and optionally scrolls to a specific hour.

Parameters:
- `options`: An object with the following properties:
  - `date` (optional): The date to navigate to (string in ISO format, Date object, or number as Unix timestamp). Default is `current date`.
  - `animatedDate` (optional): Whether to animate the date change (boolean, default: true)
  - `hourScroll` (optional): Whether to scroll to the hour of the specified date (boolean, default: false)
  - `animatedHour` (optional): Whether to animate the hour scroll (boolean, default: true)

Example:

```tsx
calendarRef.current?.goToDate({
  date: new Date().toISOString(),
  animatedDate: true,
  hourScroll: true,
  animatedHour: true
});
```

### goToHour

Scrolls to a specific hour.

Parameters:
- `hour`: The hour to scroll to (number, 0-23)
- `animated` (optional): Whether to animate the scroll (boolean, default: true)

Example:

```tsx
calendarRef.current?.goToHour(14, false); // Scroll to 2 PM without animation
```

### goToNextPage

Navigates to the next page of the calendar.

Parameters:
- `animated` (optional): Whether to animate the transition (boolean, default: true)
- `forceScrollByDay` (optional): Force scroll by day even if the calendar is in week view (boolean, default: false)

Example:

```tsx
calendarRef.current?.goToNextPage(true);
```

### goToPrevPage

Navigates to the previous page of the calendar.

Parameters:
- `animated` (optional): Whether to animate the transition (boolean, default: true)
- `forceScrollByDay` (optional): Force scroll by day even if the calendar is in week view (boolean, default: false)

Example:

```tsx
calendarRef.current?.goToPrevPage(true, false);
```

### zoom

Zooms the calendar in or out.

Parameters:
- `options` (optional): An object with one of the following properties:
  - `scale`: The scale factor to zoom by
  - `height`: The new height for time intervals

Example:

```tsx
calendarRef.current?.zoom({ scale: 1.5 }); // Zoom in by 1.5x
calendarRef.current?.zoom({ height: 80 }); // Set time interval height to 80
```

### setVisibleDate

Sets the visible date of the calendar.

Parameters:
- `date`: The date to set as visible (string in ISO format, Date object, or number as Unix timestamp)

Example:
```tsx
calendarRef.current?.setVisibleDate('2024-03-15');
```

This method is useful when you want to change mode from week to day, default in week view the visible date is the first day of the week, so when you change to day view, the calendar will scroll to the first day of the week, use this method before changing the mode to day view to set the correct visible date.

Example: Press day number on week view to change to day view, if you want to scroll to the date of the pressed day number, you can use this method.

```tsx
const _onPressDayNumber = (date: string) => {
  calendarRef.current?.setVisibleDate(date);
  setNumberOfDays(1);
};
```


### getDateByOffset

Gets the date at a specific offset in the calendar.

Parameters:
- `position`: An object with `x` and `y` coordinates

Returns: A string representing the date at the given offset, or null if not found.

Example:

```tsx
const date = calendarRef.current?.getDateByOffset({ x: 100, y: 200 });
```

### getEventByOffset

Gets the event at a specific offset in the calendar.

Parameters:
- `position`: An object with `x` and `y` coordinates

Returns: An event object at the given offset, or null if not found.

Example:

```tsx
const event = calendarRef.current?.getEventByOffset({ x: 100, y: 200 });
```

### getSizeByDuration

Gets the size (width and height) for an event of a specific duration.

Parameters:
- `duration`: The duration of the event in minutes

Returns: An object with `width` and `height` properties.

Example:

```tsx
const size = calendarRef.current?.getSizeByDuration(60); // Size for a 1-hour event
```

### getVisibleStart

Gets the start date and time of the currently visible calendar area.

Returns: A string representing the start date and time of the visible area.

Example:

```tsx
const visibleStart = calendarRef.current?.getVisibleStart();
```
