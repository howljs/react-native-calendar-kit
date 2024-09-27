---
sidebar_position: 7
---

# Custom Header

Customize the header

## highlightDates

![highlightDates](./img/highlight-dates.png)

```jsx title="highlightDates"
const highlightDates: HighlightDates = useMemo(
  () => ({
    '2022-11-07': {
      dayNameColor: 'red',
      dayNumberColor: 'red',
      dayNumberBackgroundColor: '#FFF',
    },
    '2022-11-08': {
      dayNameColor: 'red',
      dayNumberColor: 'red',
      dayNumberBackgroundColor: '#FFF',
    },
    '2022-11-09': {
      dayNameColor: 'blue',
      dayNumberColor: 'blue',
      dayNumberBackgroundColor: '#FFF',
    },
  }),
  []
);

<TimelineCalendar viewMode="week" highlightDates={highlightDates} />;
```

## theme

![weekend-style](./img/weekend-style.png)

```jsx title="highlightDates"
<TimelineCalendar
  viewMode="week"
  theme={{
    //Saturday style
    saturdayName: { color: 'blue' },
    saturdayNumber: { color: 'blue' },
    saturdayNumberContainer: { backgroundColor: 'white' },

    //Sunday style
    sundayName: { color: 'red' },
    sundayNumber: { color: 'red' },
    sundayNumberContainer: { backgroundColor: 'white' },

    //Today style
    todayName: { color: 'green' },
    todayNumber: { color: 'white' },
    todayNumberContainer: { backgroundColor: 'green' },

    //Normal style
    dayName: { color: 'black' },
    dayNumber: { color: 'black' },
    dayNumberContainer: { backgroundColor: 'white' },
  }}
/>
```
