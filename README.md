# 📅 React Native Calendar Kit

Calendar component for react native project

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

> Follow installation instructions for [React Native Reanimated v2](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation) and [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/installation). This library needs these dependencies to be installed in your project

## Example Usage

```js
import { TimelineCalendar } from '@howljs/calendar-kit';

// ...
<TimelineCalendar
  viewMode="week"
  allowPinchToZoom
  allowDragToCreate
  minDate="2022-01-01"
  maxDate="2022-12-31"
  initialDate="2022-11-30"
  holidays={['2022-11-05', '2022-11-02']}
  onDragCreateEnd={(date) => {
    console.log(date);
  }}
/>;
```

## Available props

| Name                      | Type                                | Default      | Description                            |
| ------------------------- | ----------------------------------- | ------------ | -------------------------------------- |
| viewMode                  | day, week, threeDays, workWeek      | week         | Calendar view mode                     |
| firstDay                  | number                              | 1            | First day of the week                  |
| minDate                   | string (YYYY-MM-DD)                 | 2 year ago   | Minimum display date                   |
| maxDate                   | string (YYYY-MM-DD)                 | 2 year later | Maximum display date                   |
| initialDate               | string (YYYY-MM-DD)                 | Today        | Initial display date                   |
| start                     | number                              | 0            | Day start time                         |
| end                       | number                              | 24           | Day end time                           |
| hourWidth                 | number                              | 53           | Width of hour column                   |
| timeInterval              | number                              | 60           | The interval of time slots in timeline |
| allowPinchToZoom          | boolean                             | false        | Pinch to change time interval height   |
| initialTimeIntervalHeight | number                              | 60           | Initial time interval height           |
| minTimeIntervalHeight     | number                              | None         | Min time interval height               |
| maxTimeIntervalHeight     | number                              | 116          | Width of hour column                   |
| allowDragToCreate         | boolean                             | false        | Drag to create a event                 |
| dragCreateInterval        | number                              | 60           | Default duration when create event     |
| dragStep                  | number                              | 10           | Default step                           |
| isShowHalfLine            | boolean                             | false        | Show half line                         |
| spaceFromTop              | number                              | false        |                                        |
| spaceFromBottom           | number                              | false        |                                        |
| syncedLists               | boolean                             | true         |                                        |
| unavailableHours          | [UnavailableHour](#unavailablehour) | true         | Unavailable hours                      |
| holidays                  | string[]                            | None         | Unavailable days                       |
| showNowIndicator          | boolean                             | true         |                                        |
| rightEdgeSpacing          | number                              |              |                                        |
| overlapEventsSpacing      | number                              |              |                                        |
| theme                     | [ThemeProperties](#themeproperties) |              |                                        |
| renderDayBarItem          | function                            |              |                                        |
| onPressDayNum             | function                            |              |                                        |
| onDragCreateEnd           | function                            |              |                                        |
| onPressBackground         | function                            |              |                                        |
| onLongPressBackground     | function                            |              |                                        |
| onPressOutBackground      | function                            |              |                                        |
| onDateChanged             | function                            |              |                                        |
| isLoading                 | boolean                             |              |                                        |
| events                    | [EventItem](#eventitem)[]           |              |                                        |
| onPressEvent              | function                            |              |                                        |
| onLongPressEvent          | function                            |              |                                        |
| renderEventContent        | function                            |              |                                        |
| selectedEvent             | [PackedEvent](#packedevent)         |              |                                        |
| onEndDragSelectedEvent    | function                            |              |                                        |

### EventItem

```ts
{
  id: string;
  start: string;
  end: string;
  title?: string;
  color?: string;
};
```

### PackedEvent

```ts
type PackedEvent = {
  id: string;
  start: string;
  end: string;
  title?: string;
  color?: string;
  left: number;
  top: number;
  width: number;
  height: number;
  leftByIndex?: number;
};
```

### UnavailableHour

An array of objects to apply full week:

```js
[
  { start: 0, end: 8 },
  { start: 19, end: 24 },
];
```

or

An object to customize by week day

```js
{
  //Sunday
  0: [{ start: 0, end: 24 }],
  //Monday
  1: [
    { start: 0, end: 8 },
    { start: 19, end: 24 },
  ],
}
```

### ThemeProperties

| Name                          | Type   | Required | Default | Description |
| ----------------------------- | ------ | -------- | ------- | ----------- |
| cellBorderColor               | string | Optional |         |             |
| todayTextColor                | string | Optional |         |             |
| todayBackgroundColor          | string | Optional |         |             |
| dayTextColor                  | string | Optional |         |             |
| backgroundColor               | string | Optional |         |             |
| dragHourColor                 | string | Optional |         |             |
| dragHourBorderColor           | string | Optional |         |             |
| dragHourBackgroundColor       | string | Optional |         |             |
| dragCreateItemBackgroundColor | string | Optional |         |             |
| loadingBarColor               | string | Optional |         |             |
| unavailableBackgroundColor    | string | Optional |         |             |

## Available methods

| Name         | Props                           |
| ------------ | ------------------------------- |
| goToDate     | [goToDateProps](#goToDateProps) |
| goToNextPage |                                 |
| goToPrevPage |                                 |

### goToDateProps

```typescript
{
    date?: string;
    hourScroll?: boolean;
    animatedDate?: boolean;
    animatedHour?: boolean;
}
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
