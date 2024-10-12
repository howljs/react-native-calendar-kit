---
sidebar_position: 5
---

# Drag Selected Event

The React Native Calendar Kit allows users to edit a selected event by dragging it to a new time or date. This guide will walk you through enabling this feature and customizing its behavior.

## Enabling Drag Selected Event

To enable the drag selected event feature, you need to set the `allowDragToEdit` prop to `true` and provide a `selectedEvent` to the `CalendarContainer` component:

```tsx
import {
  CalendarContainer,
  CalendarHeader,
  CalendarBody,
} from "@howljs/calendar-kit";

const MyCalendar = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <CalendarContainer
      selectedEvent={selectedEvent}
      // ... other props
    >
      <CalendarHeader />
      <CalendarBody />
    </CalendarContainer>
  );
};
```

## Handling Selected Event Editing

When a user drags to edit the selected event, you need to handle the editing process. This is done using two callback props:

1. `onDragSelectedEventStart`: Called when the user starts dragging the selected event.
2. `onDragSelectedEventEnd`: Called when the user releases the drag, finalizing the event edit.

Here's an example of how to implement these callbacks:

```tsx
const MyCalendar = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleDragStart = (event) => {
    console.log("Started editing selected event:", event);
    // You can use this to show a UI indicator that event editing has started
  };

  const handleDragEnd = (event, newStart, newEnd) => {
    console.log("Selected event edited:", event, newStart, newEnd);
    // Here you would typically update the event in your events array
    // and possibly update your backend or state management
    setSelectedEvent(null); // Clear the selected event after editing
  };

  return (
    <CalendarContainer
      selectedEvent={selectedEvent}
      onDragSelectedEventStart={handleDragStart}
      onDragSelectedEventEnd={handleDragEnd}
      // ... other props
    >
      <CalendarHeader />
      <CalendarBody />
    </CalendarContainer>
  );
};
```

## Customizing Drag Selected Event Behavior

You can customize various aspects of the drag selected event feature:

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

You can customize the appearance of the dragging indicator for the selected event by providing a custom renderer:

```tsx
const renderDraggingEvent = useCallback((props: DraggingEventProps) => {
    return (
      <DraggingEvent
        {...props}
        TopEdgeComponent={
          <View
            style={{
              height: 15,
              backgroundColor: 'red',
              position: 'absolute',
              width: '100%',
            }}>
            <Text style={{ textAlign: 'center', fontSize: 10 }}>Drag</Text>
          </View>
        }
        BottomEdgeComponent={
          <View
            style={{
              height: 15,
              backgroundColor: 'red',
              position: 'absolute',
              bottom: 0,
              width: '100%',
            }}>
            <Text style={{ textAlign: 'center', fontSize: 10 }}>Drag</Text>
          </View>
        }
      />
    );
  }, []);

<CalendarBody renderDraggingEvent={CustomDraggingEvent} />
```

### Customizing for Selected Event

You can customize selected event by providing custom components:

```tsx
const renderDraggableEvent = useCallback(
    (props: DraggableEventProps) => (
      <DraggableEvent
        {...props}
        TopEdgeComponent={
          <View
            style={{
              height: 15,
              backgroundColor: 'red',
              position: 'absolute',
              width: '100%',
            }}>
            <Text style={{ textAlign: 'center', fontSize: 10 }}>Drag</Text>
          </View>
        }
        BottomEdgeComponent={
          <View
            style={{
              height: 15,
              backgroundColor: 'red',
              position: 'absolute',
              bottom: 0,
              width: '100%',
            }}>
            <Text style={{ textAlign: 'center', fontSize: 10 }}>Drag</Text>
          </View>
        }
      />
    ),
    []
  );

<CalendarBody renderDraggableEvent={renderDraggableEvent} />
```
