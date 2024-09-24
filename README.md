# 📅 React Native Calendar Kit

## Status: In Progress

React Native Calendar component, fully implemented using react-native-gesture-handler and react-native-reanimated. Support pinch to zoom, drag and drop to create/update event.

[![Version][npm-shield]][npm-link]
[![PayPal_Me][paypal-me-shield]][paypal-me]
[![ko-fi][ko-fi-shield]][ko-fi-profile]

## Features
- Support all day events.
- Support drag/drop to create/edit event.
- Support hiding the days of the week.
- Support scrolling by day.
- Support Pinch to zoom.
- Support recurring events.

## Demo:
### iOS:

https://github.com/user-attachments/assets/9a099b37-6898-4e05-87d9-c8fd82e16c63

### Android:

https://github.com/user-attachments/assets/3896a8c8-4cde-4f76-8621-168be4cba74b

## Installation

Using Yarn:

```
$ yarn add @howljs/calendar-kit
```

Using NPM:

```
$ npm install --save @howljs/calendar-kit
```

The libraries we will install now are [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) and [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/). If you already have these libraries installed and at the latest version, you are done here! Otherwise, read on.

## Installing dependencies into an Expo managed project

```
$ npx expo install react-native-gesture-handler react-native-reanimated
```

> Follow installation instructions for [React Native Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/) and [React Native Gesture Handler](https://docs.expo.dev/versions/latest/sdk/gesture-handler/).


If you enable `useHaptic`, you need to install [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)

```
$ npx expo install expo-haptics
```

## Installing dependencies into a bare React Native project

Using Yarn:

```
$ yarn add react-native-gesture-handler react-native-reanimated
```

Using NPM:

```
$ npm install --save react-native-gesture-handler react-native-reanimated
```

> Follow installation instructions for [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation) and [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/installation).

If you enable `useHaptic`, you need to install [react-native-haptic-feedback](https://github.com/mkuczera/react-native-haptic-feedback).

Using Yarn:

```
$ yarn add react-native-haptic-feedback
```

Using NPM:

```
$ npm install --save react-native-haptic-feedback
```

## Documentation

The documentation for version 2.0.0 hasn’t been updated yet, so follow the code from the [example](https://github.com/howljs/react-native-calendar-kit) if you want to use the library early.

## TODO:
- [ ] Update documentation
- [ ] Cache events to speed up rendering
- [ ] Month View

[npm-shield]: https://img.shields.io/npm/v/@howljs/calendar-kit
[ko-fi-shield]: https://img.shields.io/static/v1.svg?label=%20&message=ko-fi&logo=ko-fi&color=13C3FF
[paypal-me-shield]: https://img.shields.io/static/v1.svg?label=%20&message=PayPal.Me&logo=paypal
[paypal-me]: https://www.paypal.me/j2teamlh
[ko-fi-profile]: https://ko-fi.com/W7W6G75FH
[npm-link]: https://www.npmjs.com/package/@howljs/calendar-kit
