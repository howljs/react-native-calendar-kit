---
sidebar_position: 10
---

# Theme

React Native Calendar Kit allows you to customize the appearance of the calendar using a theme prop. This prop accepts an object that defines various style properties for different parts of the calendar.

## Usage

To apply a custom theme, pass a `theme` prop to the `CalendarContainer` component:

```tsx
import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  DeepPartial,
  ThemeConfigs,
} from '@howljs/calendar-kit';
import React from 'react';

const customTheme: DeepPartial<ThemeConfigs> = {
  // Your custom theme properties here
};

const Calendar = () => {
  return (
    <CalendarContainer theme={customTheme}>
      <CalendarHeader />
      <CalendarBody />
    </CalendarContainer>
  );
};

export default Calendar;

```

## Theme Properties

The theme object can include the following properties:

### Colors

- `colors`: An object containing color definitions:
  - `primary`: Primary color (default color for various elements)
  - `onPrimary`: Color for elements on top of the primary color
  - `background`: Background color
  - `onBackground`: Color for elements on top of the background
  - `border`: Border color
  - `text`: Default text color
  - `surface`: Surface color (e.g., week number background, unavailable hour background)
  - `onSurface`: Color for elements on top of the surface color

### Text Styles

- `textStyle`: Default text style (applies to all text unless overridden)

### Hour Column

- `hourBackgroundColor`: Background color for the hour column
- `hourTextStyle`: Text style for hours in the hour column

### Day Bar

- `headerBackgroundColor`: Background color for the header
- `headerContainer`: Style for the header container
- `dayBarContainer`: Style for the day bar container

### Day Item

- `dayContainer`: Style for each day container
- `dayName`: Text style for day names
- `dayNumber`: Text style for day numbers
- `dayNumberContainer`: Style for the day number container
- `todayName`: Text style for today's day name
- `todayNumber`: Text style for today's day number
- `todayNumberContainer`: Style for today's day number container

### All-Day Events

- `allDayEventsContainer`: Style for the all-day events container
- `headerBottomContainer`: Style for the bottom part of the header
- `countContainer`: Style for the event count container
- `countText`: Text style for the event count

### Single Day View

- `singleDayContainer`: Style for the single day view container
- `singleDayEventsContainer`: Style for the events container in single day view

### Week Number

- `weekNumber`: Text style for week numbers
- `weekNumberContainer`: Style for the week number container

### Now Indicator

- `nowIndicatorColor`: Color for the "now" indicator line

### Out of Range and Unavailable Hours

- `outOfRangeBackgroundColor`: Background color for out-of-range dates
- `unavailableHourBackgroundColor`: Background color for unavailable hours

### Events

- `eventContainerStyle`: Default container style for events
- `eventTitleStyle`: Default text style for event titles

## Example

Here's an example of a custom theme:

```tsx
const customTheme = {
    colors: {
      primary: '#3498db',
      onPrimary: '#ffffff',
      background: '#f5f5f5',
      onBackground: '#333333',
      border: '#e0e0e0',
      text: '#333333',
      surface: '#ffffff',
      onSurface: '#666666',
    },
    textStyle: {
      fontFamily: 'Roboto',
    },
    hourTextStyle: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    dayName: {
      fontSize: 14,
      color: '#666666',
    },
    dayNumber: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    todayNumberContainer: {
      backgroundColor: '#3498db',
    },
    todayNumber: {
      color: '#ffffff',
    },
    eventContainerStyle: {
      borderRadius: 4,
    },
    eventTitleStyle: {
      fontSize: 12,
      fontWeight: 'bold',
    },
};

function MyCalendar() {
    return <CalendarKit theme={customTheme} />;
}
```

This example demonstrates how to create a custom theme that changes various aspects of the calendar's appearance, including colors, fonts, and styles for different components.

