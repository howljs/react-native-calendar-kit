# 📅 React Native Calendar Kit

React Native Calendar component, fully implemented using @shopify/flash-list, react-native-gesture-handler and react-native-reanimated. Support pinch to zoom, drag and drop to create/update event.

[![Version](https://img.shields.io/npm/v/@howljs/calendar-kit)](https://www.npmjs.com/package/@howljs/calendar-kit)

[![Demo](./assets/demo.gif)](https://user-images.githubusercontent.com/33460888/199891737-af6957ba-6a2c-49ee-8312-6feca89a2c39.MP4)

## Installation

Using Yarn:

```
$ yarn add @howljs/calendar-kit
```

Using NPM:

```
$ npm install --save @howljs/calendar-kit
```

## Installing dependencies into a bare React Native project

Using Yarn:

```
$ yarn add @shopify/flash-list react-native-gesture-handler react-native-reanimated
```

Using NPM:

```
$ npm install --save @shopify/flash-list react-native-gesture-handler react-native-reanimated
```

> Follow installation instructions for [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation) and [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/installation).

## Documentation

- [Guides](https://howljs.github.io/react-native-calendar-kit/docs/intro)

- [Example](./example/)

## Features

- [Pinch to zoom](https://howljs.github.io/react-native-calendar-kit/docs/guides/pinch-to-zoom)
- [Drag and drop to create a new event](https://howljs.github.io/react-native-calendar-kit/docs/guides/drag-to-create)
- [Drag and drop to edit the event](https://howljs.github.io/react-native-calendar-kit/docs/guides/drag-to-edit)
- Set unavailable hours and unavailable days

## Basic Usage

```tsx
import { TimelineCalendar } from '@howljs/calendar-kit';

// Week View
<TimelineCalendar viewMode="week" />;

// Day View
<TimelineCalendar viewMode="day" />;

// 3-days
<TimelineCalendar viewMode="threeDays" />;

// Work week
<TimelineCalendar viewMode="workWeek" />;
```

![View mode](./assets/mode.jpg)
