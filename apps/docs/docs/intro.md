---
sidebar_position: 1
---
import Calendar from '../src/examples/Calendar';

# Introduction

## Overview

React Native Calendar Kit is a powerful and flexible calendar component for React Native applications. It provides a customizable and feature-rich calendar view with support for various functionalities.

<Calendar numberOfDays={7} allowDragToCreate />

> Note: This is a trial version with basic functionality of the library, not yet fully optimized for the web.

## Features

- **Multiple view types**: Support for different calendar views (e.g., day, 3-days, week).
- **Support for all-day events**: The library can handle and display all-day events.
- **Drag and drop functionality**: Users can create and edit events by dragging and dropping.
- **Flexible day view**: The library supports hiding specific days of the week.
- **Scrolling by day**: Users can scroll through the calendar view by individual days.
- **Pinch to zoom**: The calendar supports pinch gestures for zooming in and out.
- **Recurring events**: The library has support for handling recurring events.
- **Haptic feedback**: The library includes optional haptic feedback for user interactions.
- **Timezone support**: The calendar can handle different timezones.
- **Unavailable hours**: The ability to mark certain hours as unavailable in the calendar.
- **Theming support**: The library includes a theming system for consistent styling.
- **Overlap events**: The library supports overlapping events.

## Installation

To install React Native Calendar Kit, follow these steps:

```bash npm2yarn
npm install @howljs/calendar-kit
```

## Dependencies

The libraries we will install now are [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) and [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/). If you already have these libraries installed and at the latest version, you are done here! Otherwise, read on.

### Installing dependencies into an Expo managed project

```bash npm2yarn
$ npx expo install react-native-gesture-handler react-native-reanimated
```

> Follow installation instructions for [React Native Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/) and [React Native Gesture Handler](https://docs.expo.dev/versions/latest/sdk/gesture-handler/).


### Installing dependencies into a bare React Native project

```bash npm2yarn
$ npm install react-native-gesture-handler react-native-reanimated
```

> Follow installation instructions for [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started) and [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation).


## Initialize the Calendar

```tsx
import { CalendarBody, CalendarContainer, CalendarHeader } from '@howljs/calendar-kit';
import React from 'react';

const Calendar = () => {
  return (
    <CalendarContainer>
      <CalendarHeader />
      <CalendarBody />
    </CalendarContainer>
  );
};

export default Calendar;
```
