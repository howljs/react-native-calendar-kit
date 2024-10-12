---
sidebar_position: 2
---

# CalendarHeader

The `CalendarHeader` component is an essential part of the React Native Calendar Kit. It renders the header section of the calendar, including day names, dates, and optionally all-day events.

## Props

The `CalendarHeader` component accepts the following props:

| Prop Name             | Type      | Default | Description                                                                         |
| --------------------- | --------- | ------- | ----------------------------------------------------------------------------------- |
| `dayBarHeight`        | number    | 60      | Height of the day bar.                                                              |
| `renderHeaderItem`    | function  | -       | Custom renderer for header items.                                                   |
| `renderExpandIcon`    | function  | -       | Custom renderer for the expand icon.                                                |
| `LeftAreaComponent`   | component | -       | Custom component for the left area of the header.                                   |
| `headerBottomHeight`  | number    | 20      | Height of the bottom section of the header.                                         |
| `collapsedItems`      | number    | 2       | Number of items to show when collapsed.                                             |
| `renderEvent`         | function  | -       | Custom renderer for events in the header.                                           |
| `eventMinMinutes`     | number    | 20      | Minimum minutes to calculate height of all day event (scale by timeInterval height) |
| `eventMaxMinutes`     | number    | 30      | Maximum minutes to calculate height of all day event (scale by timeInterval height) |
| `eventInitialMinutes` | number    | 20      | Initial minutes to calculate height of all day event (scale by timeInterval height) |
