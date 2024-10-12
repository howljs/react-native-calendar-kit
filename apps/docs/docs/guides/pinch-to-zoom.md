---
sidebar_position: 6
---

# Pinch to Zoom

React Native Calendar Kit provides a pinch-to-zoom feature that allows users to dynamically adjust the time scale of the calendar view. This feature enhances user interaction and provides a more flexible way to view and manage events.

## Enabling Pinch to Zoom

To enable the pinch-to-zoom feature, you need to set the `allowPinchToZoom` prop to `true`:

```tsx
<CalendarKit
    allowPinchToZoom={true}
    // ... other props
/>
```

## Customizing Zoom Behavior

You can customize the zoom behavior by setting the following props:

### minTimeIntervalHeight

This prop sets the minimum height (in pixels) for each time interval when zoomed out:

```tsx
<CalendarKit
    allowPinchToZoom={true}
    minTimeIntervalHeight={30}
    // ... other props
/>
```

### maxTimeIntervalHeight

This prop sets the maximum height (in pixels) for each time interval when zoomed in:

```tsx
<CalendarKit
    allowPinchToZoom={true}
    maxTimeIntervalHeight={120}
    // ... other props
/>
```

### initialTimeIntervalHeight

This prop sets the initial height (in pixels) for each time interval:

```tsx
<CalendarKit
    allowPinchToZoom={true}
    initialTimeIntervalHeight={60}
    // ... other props
/>
```

## Programmatic Zooming

You can also programmatically control the zoom level using the `zoom` method of the CalendarKit ref:

```tsx
const calendarRef = useRef(null);

// Zoom in
const zoomIn = () => {
    calendarRef.current?.zoom({ scale: 1.5 });
};

// Zoom out
const zoomOut = () => {
    calendarRef.current?.zoom({ scale: 0.75 });
};

// Set a specific time interval height
const setSpecificZoom = () => {
    calendarRef.current?.zoom({ height: 90 });
};

return (
    <>
    <CalendarKit
        ref={calendarRef}
        allowPinchToZoom={true}
        // ... other props
    />
    <Button title="Zoom In" onPress={zoomIn} />
    <Button title="Zoom Out" onPress={zoomOut} />
    <Button title="Set Specific Zoom" onPress={setSpecificZoom} />
    </>
);
```