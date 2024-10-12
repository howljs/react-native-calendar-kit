---
sidebar_position: 3
---

# CalendarBody

The `CalendarBody` component is a core part of the React Native Calendar Kit. It renders the main calendar grid, including time slots, events, and various interactive elements.

## Props

The `CalendarBody` component accepts the following props:

| Prop Name                     | Type      | Default   | Description                                        |
| ----------------------------- | --------- | --------- | -------------------------------------------------- |
| `hourFormat`                  | string    | `'HH:mm'` | Format for displaying hours.                       |
| `renderHour`                  | function  | -         | Custom renderer for hour labels.                   |
| `showNowIndicator`            | boolean   | `true`    | Whether to show the current time indicator.        |
| `renderCustomOutOfRange`      | function  | -         | Custom renderer for out-of-range areas.            |
| `renderCustomUnavailableHour` | function  | -         | Custom renderer for unavailable hours.             |
| `renderEvent`                 | function  | -         | Custom renderer for events.                        |
| `renderDraggableEvent`        | function  | -         | Custom renderer for draggable events.              |
| `renderDraggingEvent`         | function  | -         | Custom renderer for events being dragged.          |
| `renderDraggingHour`          | function  | -         | Custom renderer for hour indicator while dragging. |
| `NowIndicatorComponent`       | component | -         | Custom component for the current time indicator.   |
