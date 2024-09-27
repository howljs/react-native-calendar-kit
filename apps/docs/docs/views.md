---
sidebar_position: 2
---

# Calendar Views

import WeekView from './assets/week-view.jpg';
import ThreeDaysView from './assets/3-days-view.jpg';
import DayView from './assets/day-view.jpg';
import WorkWeekView from './assets/work-week.jpg';

<img src={DayView} width="300px" />
<img src={ThreeDaysView} width="300px" />
<img src={WorkWeekView} width="300px" />
<img src={WeekView} width="300px" />

## Change the number of days

You can show the calendar with the number of days you want. Supports 1 to 7 days.

```tsx
<CalendarContainer numberOfDays={7}>
  <CalendarHeader />
  <CalendarBody />
</CalendarContainer>
```

## Change the scroll behavior

If you want to disable the scroll by day, you can set `scrollByDay={false}`.

Default behavior is `numberOfDays < 7 ? true : false`.

```tsx
<CalendarContainer numberOfDays={7} scrollByDay={false}>
  <CalendarHeader />
  <CalendarBody />
</CalendarContainer>
```

## Change the first day of the week

You can change the first day of the week. Valid values are 1 (Monday) to 7 (Sunday).

Default value is 1 (Monday).

```tsx
<CalendarContainer numberOfDays={7} firstDay={1}>
  <CalendarHeader />
  <CalendarBody />
</CalendarContainer>
```

## Hide week days

You can hide the week days.

Example: Hide Saturday and Sunday.

```tsx
<CalendarContainer numberOfDays={5} hideWeekDays={[6, 7]}>
  <CalendarHeader />
  <CalendarBody />
</CalendarContainer>
```

## Minimum/Maximum display date

You can set the minimum/maximum display date. 

Default is `2 years ago` from `today`.

```tsx
const MIN_DATE = new Date('2024-01-01').toISOString();
const MAX_DATE = new Date('2025-01-31').toISOString();

<CalendarContainer
  numberOfDays={7}
  minDate={MIN_DATE}
  maxDate={MAX_DATE}>
  <CalendarHeader />
  <CalendarBody />
</CalendarContainer>
```
