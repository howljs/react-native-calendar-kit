---
sidebar_position: 2
---

# Working with Events

React Native Calendar Kit provides powerful features for handling events in your calendar. This guide will walk you through how to add, customize, and interact with events.

## Adding Events

To add events to your calendar, use the `events` prop. This prop accepts an array of event objects:

```tsx
<CalendarContainer
    events={[
    {
        id: '1',
        title: 'Meeting with Team',
        start: { dateTime: '2024-03-15T10:00:00Z' },
        end: { dateTime: '2024-03-15T11:00:00Z' },
        color: '#4285F4',
    },
    // ... more events
    ]}
    // ... other props
>
    <CalendarHeader />
    <CalendarBody />
</CalendarContainer>
```

Each event object should have the following properties:

- `id` (string): A unique identifier for the event.
- `title` (string): The title of the event.
- `start` (object): The start time of the event.
  - `date` (string): YYYY-MM-DD
  - `dateTime` (string): ISO 8601 formatted date-time string.
  - `timeZone` (string): IANA time zone string.
- `end` (object): The end time of the event.
  - `date` (string): YYYY-MM-DD
  - `dateTime` (string): ISO 8601 formatted date-time string.
  - `timeZone` (string): IANA time zone string.
- `color` (string, optional): The color of the event (CSS color string).

## Customizing Event Rendering

You can customize how events are rendered using the `renderEvent` prop:

```tsx
const renderEvent = useCallback(
    (event: PackedEvent) => (
      <View
        style={{
          width: '100%',
          height: '100%',
          padding: 4,
        }}>
        <Ionicons name="calendar" size={10} color="white" />
        <Text style={{ color: 'white', fontSize: 10 }}>{event.title}</Text>
      </View>
    ),
    []
  );

/*...*/
<CalendarBody renderEvent={renderEvent} />
/*...*/
```

The `renderEvent` function receives the event object and an object containing `width` and `height` shared values. These can be used with Reanimated to create dynamic layouts.

## Handling Event Interactions

React Native Calendar Kit provides several props for handling event interactions:

### onPressEvent

Triggered when an event is pressed:

```tsx
<CalendarContainer
    events={events}
    onPressEvent={(event) => {
        console.log('Event pressed:', event);
    }}
    // ... other props
>
    {/* ... */}
</CalendarContainer>
```

### onLongPressEvent

Triggered when an event is long-pressed:

```tsx
<CalendarKit
    events={events}
    onLongPressEvent={(event) => {
        console.log('Event long-pressed:', event);
    }}
    // ... other props
/>
```

## All-Day Events

There are two ways to create all-day events:

1. Timezone-dependent all-day events:
   Set the `start` and `end` times to cover the entire day:

```tsx
{
  id: '2',
  title: 'Conference',
  start: { dateTime: '2024-03-17T00:00:00', timeZone: 'America/New_York' },
  end: { dateTime: '2024-03-18T00:00:00', timeZone: 'America/New_York' },
  color: '#34A853',
}
```

2. Timezone-independent all-day events:
   Omit the `dateTime` and `timeZone` properties, and instead use `date` for both `start` and `end`:

```tsx
{
  id: '3',
  title: 'Company Holiday',
  start: { date: '2024-03-17' },
  end: { date: '2024-03-17' },
  color: '#FBBC05',
}
```

For multi-day events, you can specify different start and end dates:

```tsx
{
  id: '4',
  title: 'Annual Leave',
  start: { date: '2024-03-18' },
  end: { date: '2024-03-22' },
  color: '#EA4335',
}
```

When you use the `date` property without `dateTime` and `timeZone`, these events will be treated as all-day events that are not dependent on any specific timezone. This is particularly useful for events like holidays or multi-day events that span entire days regardless of the user's local time.

## Recurring Events

React Native Calendar Kit supports recurring events using the RRule standard. Add a `recurrenceRule` property to your event object:

### Regular Recurring Events

```tsx
{
  id: '3',
  title: 'Weekly Team Sync',
  start: { dateTime: '2024-03-18T15:00:00Z' },
  end: { dateTime: '2024-03-18T16:00:00Z' },
  color: '#FBBC05',
  recurrenceRule: 'RRULE:FREQ=WEEKLY;BYDAY=MO'
}
```

This creates a weekly recurring event every Monday.

### More Examples of Recurring Events

1. Daily event:
```tsx
{
  id: '4',
  title: 'Daily Standup',
  start: { dateTime: '2024-03-18T09:00:00Z' },
  end: { dateTime: '2024-03-18T09:15:00Z' },
  color: '#4285F4',
  recurrenceRule: 'RRULE:FREQ=DAILY'
}
```

2. Monthly event on the first Monday:
```tsx
{
  id: '5',
  title: 'Monthly Review',
  start: { dateTime: '2024-04-01T14:00:00Z' },
  end: { dateTime: '2024-04-01T15:00:00Z' },
  color: '#34A853',
  recurrenceRule: 'RRULE:FREQ=MONTHLY;BYDAY=1MO'
}
```

3. Yearly event:
```tsx
{
  id: '6',
  title: 'Annual Company Picnic',
  start: { dateTime: '2024-07-15T11:00:00Z' },
  end: { dateTime: '2024-07-15T16:00:00Z' },
  color: '#EA4335',
  recurrenceRule: 'RRULE:FREQ=YEARLY'
}
```

### Recurring All-Day Events

You can also create recurring all-day events. Here are some examples:

1. Weekly all-day event (every Friday):
```tsx
{
  id: '7',
  title: 'Weekly Team Building Day',
  start: { date: '2024-03-22' },
  end: { date: '2024-03-22' },
  color: '#FBBC05',
  recurrenceRule: 'RRULE:FREQ=WEEKLY;BYDAY=FR'
}
```

2. Monthly all-day event (first day of every month):
```tsx
{
  id: '8',
  title: 'Monthly Planning Day',
  start: { date: '2024-04-01' },
  end: { date: '2024-04-01' },
  color: '#34A853',
  recurrenceRule: 'RRULE:FREQ=MONTHLY;BYMONTHDAY=1'
}
```

3. Yearly all-day event (every December 25th):
```tsx
{
  id: '9',
  title: 'Company Holiday',
  start: { date: '2024-12-25' },
  end: { date: '2024-12-25' },
  color: '#EA4335',
  recurrenceRule: 'RRULE:FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25'
}
```

These examples demonstrate how to create various types of recurring events, including regular timed events and all-day events. The `recurrenceRule` follows the iCalendar RFC 5545 standard, allowing for complex recurrence patterns.

Remember, when using recurring all-day events, use the `date` property in the `start` and `end` objects instead of `dateTime` and `timeZone`. This ensures that the events are treated as timezone-independent all-day events.


## Excluding Dates from Recurring Events

When working with recurring events, you might want to exclude specific dates from the recurrence pattern. React Native Calendar Kit provides the `excludeDates` property for this purpose.

### Using excludeDates

The `excludeDates` property allows you to specify dates that should be skipped in a recurring event series. This is useful for handling exceptions to regular patterns, such as holidays or canceled meetings.

#### For Regular Recurring Events

For regular recurring events (with `dateTime` and `timeZone`), `excludeDates` should be an array of ISO 8601 formatted date-time strings:

```tsx
{
  id: '10',
  title: 'Weekly Team Meeting',
  start: { dateTime: '2024-03-18T10:00:00Z' },
  end: { dateTime: '2024-03-18T11:00:00Z' },
  color: '#4285F4',
  recurrenceRule: 'RRULE:FREQ=WEEKLY;BYDAY=MO',
  excludeDates: ['2024-03-25T10:00:00Z', '2024-04-01T10:00:00Z', '2024-05-27T10:00:00Z']
}
```

In this example:
- The event is set to recur every Monday.
- The `excludeDates` array specifies three dates with times in UTC.
- The event will not appear on these excluded dates and times.

#### For Timezone-independent All-Day Events

For all-day events (using `date` instead of `dateTime`), `excludeDates` should be an array of 'YYYY-MM-DD' formatted strings:

```tsx
{
  id: '11',
  title: 'Monthly Team Building Day',
  start: { date: '2024-03-01' },
  end: { date: '2024-03-01' },
  color: '#34A853',
  recurrenceRule: 'RRULE:FREQ=MONTHLY;BYDAY=1FR',
  excludeDates: ['2024-07-05', '2024-08-02', '2024-12-06']
}
```

In this example:
- The event is set to recur on the first Friday of every month.
- The `excludeDates` array specifies three dates without times.
- The event will not appear on these excluded dates.

### Format for excludeDates

- For regular events: ISO 8601 formatted date-time strings (e.g., '2024-03-25T10:00:00Z')
- For all-day events: 'YYYY-MM-DD' formatted strings (e.g., '2024-03-25')
