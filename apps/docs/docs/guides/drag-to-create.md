---
sidebar_position: 3
---

# Drag to Create Events

The React Native Calendar Kit provides a powerful drag-and-drop feature to create new events directly on the calendar interface. This guide will walk you through enabling this feature and customizing its behavior.

## Enabling Drag-to-Create

To enable the drag-to-create feature, you need to set the `allowDragToCreate` prop to `true` on the `CalendarContainer` component:

```tsx
import {
  CalendarContainer,
  CalendarHeader,
  CalendarBody,
} from "@howljs/calendar-kit";
const MyCalendar = () => {
  return (
    <CalendarContainer
      allowDragToCreate={true}
      // ... other props
    >
      <CalendarHeader />
      <CalendarBody />
    </CalendarContainer>
  );
};
```

## Handling Event Creation

When a user drags to create a new event, you need to handle the creation process. This is done using two callback props:

1. `onDragCreateEventStart`: Called when the user starts dragging to create an event.
2. `onDragCreateEventEnd`: Called when the user releases the drag, finalizing the event creation.

Here's an example of how to implement these callbacks:

```tsx
const MyCalendar = () => {
  const handleDragCreateStart = (start) => {
    console.log("Started creating event at:", start);
    // You can use this to show a UI indicator that event creation has started
  };

  const handleDragCreateEnd = (event) => {
    console.log("New event:", event);
    // Here you would typically add the new event to your events array
    // and possibly open a modal for the user to add more details
  };

  return (
    <CalendarContainer
      allowDragToCreate={true}
      onDragCreateEventStart={handleDragCreateStart}
      onDragCreateEventEnd={handleDragCreateEnd}
      // ... other props
    >
      <CalendarHeader />
      <CalendarBody />
    </CalendarContainer>
  );
};
```

## Customizing Drag-to-Create Behavior

You can customize various aspects of the drag-to-create feature:

### Default Duration

Set the `defaultDuration` prop (in minutes) to control the initial duration of newly created events:

```tsx
<CalendarContainer
  allowDragToCreate={true}
  defaultDuration={60} // New events will be 1 hour long by default
  // ... other props
>
  {/* ... */}
</CalendarContainer>
```

### Drag Step

The `dragStep` prop determines the time increments (in minutes) for dragging:

```tsx
<CalendarContainer
  allowDragToCreate={true}
  dragStep={15} // Drag will snap to 15-minute increments
  // ... other props
>
  {/* ... */}
</CalendarContainer>
```

### Customizing the Dragging Indicator

You can customize the appearance of the dragging indicator by providing a custom renderer:

```tsx
import React, { useCallback } from 'react';
import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  DraggingEvent,
  DraggingEventProps
} from '@howljs/calendar-kit';

const renderDraggingEvent = useCallback((props: DraggingEventProps) => {
  return (
    <DraggingEvent
        {...props}
        TopEdgeComponent={
          <View
            style={{
              height: 10,
              width: '100%',
              backgroundColor: 'red',
              position: 'absolute',
            }}
          />
        }
        BottomEdgeComponent={
          <View
            style={{
              height: 10,
              width: '100%',
              backgroundColor: 'red',
              bottom: 0,
              position: 'absolute',
            }}
          />
        }
      />
  );
}, []);

<CalendarContainer
  allowDragToCreate={true}
  // ... other props
>
  <CalendarHeader />
  <CalendarBody renderDraggingEvent={renderDraggingEvent} />
</CalendarContainer>
```
