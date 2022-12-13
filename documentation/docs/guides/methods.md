# Available methods

TimelineCalendar methods

## goToDate

```tsx title="Example"
const calendarRef = useRef<TimelineCalendarHandle>(null);

//...
<TimelineCalendar ref={calendarRef} viewMode="week" />;

//...
<TouchableOpacity onPress={() => {
     //Optional
    const optionalProps = {
      date: "2022-11-09" //Default: today
      hourScroll: true,
      animatedHour: true
      animatedDate: false
    }
    calendarRef.current?.goToDate(optionalProps)
  }}>
  <Text>Go to date</Text>
</TouchableOpacity>;
```

## goToNextPage

```tsx title="Example"
const calendarRef = useRef<TimelineCalendarHandle>(null);

//...
<TimelineCalendar ref={calendarRef} viewMode="week" />;

//...
<TouchableOpacity
  onPress={() => {
    calendarRef.current?.goToNextPage();
  }}
>
  <Text>Next week</Text>
</TouchableOpacity>;
```

## goToPrevPage

```tsx title="Example"
const calendarRef = useRef<TimelineCalendarHandle>(null);

//...
<TimelineCalendar ref={calendarRef} viewMode="week" />;

//...
<TouchableOpacity
  onPress={() => {
    calendarRef.current?.goToPrevPage();
  }}
>
  <Text>Previous week</Text>
</TouchableOpacity>;
```

## getZones

Get Supported Time Zone List

```tsx title="Example"
const calendarRef = useRef<TimelineCalendarHandle>(null);

//...
<TimelineCalendar ref={calendarRef} viewMode="week" />;

//...
<TouchableOpacity
  onPress={() => {
    calendarRef.current?.getZones();
  }}
>
  <Text>Get Supported Time Zone List</Text>
</TouchableOpacity>;
```

## getZone

Get zone info by zone name

```tsx title="Example"
const calendarRef = useRef<TimelineCalendarHandle>(null);

//...
<TimelineCalendar ref={calendarRef} viewMode="week" />;

//...
<TouchableOpacity
  onPress={() => {
    calendarRef.current?.getZone('Asia/Ho_Chi_Minh');
  }}
>
  <Text>Get zone info</Text>
</TouchableOpacity>;
```

## goToHour

Scroll timeline to the custom hour

```tsx title="Example"
const calendarRef = useRef<TimelineCalendarHandle>(null);

//...
<TimelineCalendar ref={calendarRef} viewMode="week" />;

//...
<TouchableOpacity
  onPress={() => {
    calendarRef.current?.goToHour(7.5);
  }}
>
  <Text>Go to 07:30</Text>
</TouchableOpacity>;
```
