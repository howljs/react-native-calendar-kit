---
sidebar_position: 11
---

# Other Props

Some other properties of TimelineCalendar

### minDate

Minimum display date. Format: (YYYY-MM-DD). Default is **2 year ago**

<span style={{color: "grey"}}>string</span>

### maxDate

Maximum display date. Format: (YYYY-MM-DD). Default is **2 year later**

<span style={{color: "grey"}}>string</span>

### initialDate

Initial display date. Format: (YYYY-MM-DD). Default is **today**

<span style={{color: "grey"}}>string</span>

### start

Start hour of the day. Default is `0`

<span style={{color: "grey"}}>number</span>

### end

End hour of the day. Default is `24`

<span style={{color: "grey"}}>number</span>

### hourWidth

Width of hour column. Default is `53`

<span style={{color: "grey"}}>number</span>

### firstDay

First day of the week. Default is `1` (Monday)

<span style={{color: "grey"}}>number</span>

### timeInterval

The interval of time slots. Default is `60` minutes

<span style={{color: "grey"}}>number</span>

### syncedLists

Auto scroll header when scroll time slots view. Default is `true`

<span style={{color: "grey"}}>boolean</span>

### spaceFromTop

Space between header view and time slots view. Default is `16`

<span style={{color: "grey"}}>number</span>

### spaceFromBottom

Space below time slots view. Default is `16`

<span style={{color: "grey"}}>number</span>

### isShowHalfLine

Show a line in the middle of the interval. Default is `true`

<span style={{color: "grey"}}>boolean</span>

### showNowIndicator

Show a line at current time. Default is `true`

<span style={{color: "grey"}}>boolean</span>

### scrollToNow

Auto scroll to current time. Default is `true`

<span style={{color: "grey"}}>boolean</span>

### rightEdgeSpacing

Spacing at the right edge of events. Default is `1`

<span style={{color: "grey"}}>number</span>

### overlapEventsSpacing

Spacing between overlapping events. Default is `1`

<span style={{color: "grey"}}>number</span>

### renderDayBarItem

Custom header component

<span style={{color: "grey"}}>function</span>

### renderEventContent

Custom component rendered inside an event

<span style={{color: "grey"}}>function</span>

### onPressDayNum

Callback function will be called when day in header is pressed

<span style={{color: "grey"}}>function</span>

### onPressBackground

Callback function will be called when time slots view is pressed

<span style={{color: "grey"}}>function</span>

### onLongPressBackground

Callback function will be called when time slots view is long pressed

### onPressOutBackground

Callback function will be called when time slots view is pressed out

<span style={{color: "grey"}}>function</span>

### onPressEvent

Callback function will be called when the event item is pressed

<span style={{color: "grey"}}>function</span>

### isShowHeader

Show/Hide header component. Default is `true`

<span style={{color: "grey"}}>boolean</span>

### onChange

Callback function will be called when the timeline is scrolling

<span style={{color: "grey"}}>boolean</span>

### hourFormat

Hour format. Default is `HH:mm`

<span style={{color: "grey"}}>string</span>

### eventAnimatedDuration

How long the animation should last when the style of the event is changed. Default is `250`

<span style={{color: "grey"}}>number</span>

### useHaptic

Haptic Feedback when drag to create/edit.

<span style={{color: "grey"}}>boolean</span>

### editEventGestureEnabled

Enable drag with selected event. Default is `true`

<span style={{color: "grey"}}>boolean</span>

### renderSelectedEventContent

Custom component rendered inside an selected event

<span style={{color: "grey"}}>function</span>

### timeZone

Use calendar in different time zones

<span style={{color: "grey"}}>string</span>

### renderHalfLineCustom

Custom component rendered inside the line in the middle of the interval

<span style={{color: "grey"}}>function</span>

### halfLineContainerStyle

Container style of the line in the middle of the interval.

<span style={{color: "grey"}}>function</span>

### nowIndicatorInterval

Update indicator at specified intervals (in milliseconds). Default is `1000`

<span style={{color: "grey"}}>number</span>

### calendarWidth

Width of calendar. Default is `window width`

<span style={{color: "grey"}}>number</span>

### onTimeIntervalHeightChange

Callback function will be called when the time interval height is changed

<span style={{color: "grey"}}>function</span>
