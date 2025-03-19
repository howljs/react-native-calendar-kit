# 📅 React Native Calendar Kit

React Native Calendar Kit is a powerful and flexible calendar component for React Native applications. It provides a customizable and feature-rich calendar view with support for various functionalities.

[![Version][npm-shield]][npm-link]
[![PayPal_Me][paypal-me-shield]][paypal-me]
[![ko-fi][ko-fi-shield]][ko-fi-profile]

## Demo:

![Calendar Demo](https://github.com/howljs/react-native-calendar-kit/blob/main/__assets__/demo.jpg?raw=true)

### iOS:

https://github.com/user-attachments/assets/9a099b37-6898-4e05-87d9-c8fd82e16c63

### Android:

https://github.com/user-attachments/assets/3896a8c8-4cde-4f76-8621-168be4cba74b


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
- **Resources calendar**: The library supports displaying events for multiple resources (e.g., rooms, employees, equipment) side by side in a single calendar view.

## Documentation

For detailed usage and customization options, please refer to the [official documentation](https://howljs.github.io/react-native-calendar-kit/docs/intro).

## Example

For examples and usage, please refer to the [example app](https://github.com/howljs/react-native-calendar-kit/tree/main/apps/example).

## Installation

To install React Native Calendar Kit, follow these steps:

```bash
yarn add @howljs/calendar-kit

# or

npm install @howljs/calendar-kit
```

## Dependencies

The libraries we will install now are [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) and [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/). If you already have these libraries installed and at the latest version, you are done here! Otherwise, read on.

### Installing dependencies into an Expo managed project

```bash
npx expo install react-native-gesture-handler react-native-reanimated
```

> Follow installation instructions for [React Native Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/) and [React Native Gesture Handler](https://docs.expo.dev/versions/latest/sdk/gesture-handler/).


### Installing dependencies into a bare React Native project

```bash
yarn add react-native-gesture-handler react-native-reanimated

# or

npm install react-native-gesture-handler react-native-reanimated
```

> Follow installation instructions for [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started) and [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation).


## Haptic Feedback

The library includes optional haptic feedback when dragging events. To enable haptic feedback, please install the `expo-haptics` or `react-native-haptic-feedback` library and set the `useHaptic` prop to `true` on the `CalendarContainer` component.

```bash
npx expo install expo-haptics
```

or

```bash
yarn add react-native-haptic-feedback

# or

npm install --save react-native-haptic-feedback
```


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

[npm-shield]: https://img.shields.io/npm/v/@howljs/calendar-kit
[ko-fi-shield]: https://img.shields.io/static/v1.svg?label=%20&message=ko-fi&logo=ko-fi&color=13C3FF
[paypal-me-shield]: https://img.shields.io/static/v1.svg?label=%20&message=PayPal.Me&logo=paypal
[paypal-me]: https://www.paypal.me/j2teamlh
[ko-fi-profile]: https://ko-fi.com/W7W6G75FH
[npm-link]: https://www.npmjs.com/package/@howljs/calendar-kit
