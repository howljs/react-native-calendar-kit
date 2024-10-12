---
sidebar_position: 4
---

# Drag to Edit Events

The React Native Calendar Kit allows users to edit existing events by dragging them to new times or dates. This guide will walk you through enabling this feature and customizing its behavior.

## Enabling Drag-to-Edit

To enable the drag-to-edit feature, set the `allowDragToEdit` prop to `true` on the `CalendarContainer` component:

```tsx
import {
  CalendarContainer,
  CalendarHeader,
  CalendarBody,
} from "@howljs/calendar-kit";

const MyCalendar = () => {
  return (
    <CalendarContainer
      allowDragToEdit={true}
      // ... other props
    >
      <CalendarHeader />
      <CalendarBody />
    </CalendarContainer>
  );
};
```

## Handling Event Editing

When a user drags to edit an event, you need to handle the editing process. This is done using two callback props:

1. `onDragEventStart`: Called when the user starts dragging an event.
2. `onDragEventEnd`: Called when the user releases the drag, finalizing the event edit.

Here's an example of how to implement these callbacks:

```tsx
const MyCalendar = () => {
  const handleDragStart = (event) => {
    console.log("Started editing event:", event);
    // You can use this to show a UI indicator that event editing has started
  };

  const handleDragEnd = (event, newStart, newEnd) => {
    console.log("Event edited:", event, newStart, newEnd);
    // Here you would typically update the event in your events array
    // and possibly update your backend or state management
  };

  return (
    <CalendarContainer
      allowDragToEdit={true}
      onDragEventStart={handleDragStart}
      onDragEventEnd={handleDragEnd}
      // ... other props
    >
      <CalendarHeader />
      <CalendarBody />
    </CalendarContainer>
  );
};
```

## Customizing Drag-to-Edit Behavior

You can customize various aspects of the drag-to-edit feature:

### Drag Step

The `dragStep` prop determines the time increments (in minutes) for dragging:

```tsx
<CalendarContainer
  allowDragToEdit={true}
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
  allowDragToEdit={true}
  // ... other props
>
  <CalendarHeader />
  <CalendarBody renderDraggingEvent={renderDraggingEvent} />
</CalendarContainer>
```
