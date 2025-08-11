---
sidebar_position: 11
---

# Resources Calendar

![resources](../assets/resources.png)

The Resources Calendar feature allows you to display events for multiple resources (e.g., rooms, employees, equipment) side by side in a single calendar view. This is particularly useful for scheduling and managing multiple resources simultaneously.

## Setting Up Resources Calendar

To use the Resources Calendar feature, you need to provide a `resources` prop to the `CalendarContainer` component. Each resource should have a unique `id`.

```tsx
import {
  CalendarContainer,
  CalendarHeader,
  CalendarBody,
} from '@howljs/calendar-kit';

const resources = [
  { id: 'room1', name: 'Meeting Room 1' },
  { id: 'room2', name: 'Meeting Room 2' },
  { id: 'room3', name: 'Conference Room' },
];

function MyCalendar() {
  return (
    <CalendarContainer
      resources={resources}
      // ... other props
    >
      <CalendarHeader />
      <CalendarBody />
    </CalendarContainer>
  );
}
```

## Adding Events with Resources

When adding events to your calendar, you need to specify the `resourceId` for each event. This associates the event with a particular resource.

```tsx
const events = [
  {
    id: '1',
    title: 'Team Meeting',
    start: { dateTime: '2024-03-15T10:00:00Z' },
    end: { dateTime: '2024-03-15T11:00:00Z' },
    resourceId: 'room1',
  },
  {
    id: '2',
    title: 'Client Presentation',
    start: { dateTime: '2024-03-15T14:00:00Z' },
    end: { dateTime: '2024-03-15T15:30:00Z' },
    resourceId: 'room2',
  },
  // ... more events
];
```

## Scrollable Resources per Page

The `maxResourcesColumnsPerPage` prop on `<CalendarContainer />` allows you to control how many resource columns are visible at once in the calendar view. This is especially useful when you have many resources and want to make the resource columns horizontally scrollable, improving UX and accessibility for layout on smaller screens.

![scrollable-resources](../assets/max-resources-columns-per-page.gif)

For example, to show only 4 resource columns at a time and enable horizontal scrolling for more resources:

```tsx
// long list of resources
const resources = [
  { id: 'room1', name: 'Meeting Room 1' },
  { id: 'room3', name: 'Conference Room' },
  // ...
  { id: 'room18', name: 'Rest Room' },
];

function MyCalendar() {
  return (
    <CalendarContainer
      resources={resources}
      maxResourcesColumnsPerPage={4}
      // ... other props
    >
      <CalendarHeader />
      <CalendarBody />
    </CalendarContainer>
  );
}
```

## Customizing Resources Header

You can customize the appearance of the resources header by providing a `renderHeaderItem` prop to the `CalendarHeader` component.

```tsx
function MyCalendar() {
  const _renderResource = useCallback((resource: ResourceItem) => {
    return (
      <View style={styles.resourceContainer}>
        <Ionicons name="person-circle-outline" size={24} color="black" />
        <Text>{resource.title}</Text>
      </View>
    );
  }, []);

  const _renderResourceHeaderItem = useCallback(
    (item: HeaderItemProps) => {
      const start = parseDateTime(item.startUnix);
      const dateStr = start.toFormat('yyyy-MM-dd');

      return (
        <ResourceHeaderItem
          startUnix={item.startUnix}
          resources={item.extra.resources}
          renderResource={_renderResource}
          DateComponent={
            <View style={styles.dateContainer}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                {dateStr}
              </Text>
            </View>
          }
        />
      );
    },
    [_renderResource]
  );

  return (
    <CalendarContainer
      resources={resources}
      events={events}
      // ... other props
    >
      <CalendarHeader renderHeaderItem={_renderResourceHeaderItem} />
      <CalendarBody />
    </CalendarContainer>
  );
}
```

Check example code: https://github.com/howljs/react-native-calendar-kit/blob/main/apps/example/app/(drawer)/index.tsx

## Handling Resource-specific Actions

When handling events in a Resources Calendar, you may need to consider the associated resource. For example, when creating a new event:

```tsx
function MyCalendar() {
  const handleCreateEvent = (event) => {
    // event.resourceId will contain the id of the resource where the event was created
    console.log('New event for resource:', event.resourceId);
    // Add your logic to create the event
  };

  return (
    <CalendarKit
      resources={resources}
      onPressBackground={handleCreateEvent}
      // ... other props
    />
  );
}
```

## Limitations and Considerations

1. When using resources, the calendar will automatically switch to a single-day view.
2. All-day events are not supported in resources view.
