---
sidebar_position: 7
---

# Unavailable Hours

React Native Calendar Kit allows you to specify certain hours as unavailable in your calendar view. This feature is useful for indicating non-working hours, lunch breaks, or any other time slots that should be visually distinguished or blocked off.

## Using the unavailableHours Prop

The `unavailableHours` prop accepts an array or object with the following properties:

- `start`: The start hour of the unavailable time range (0-1440, where 0 is midnight and 1440 is the last minute of the day)
- `end`: The end hour of the unavailable time range (0-1440, where 0 is midnight and 1440 is the last minute of the day)
- `enableBackgroundInteraction`: A boolean that determines whether interactions (like creating events) are allowed in unavailable hours. Default is `false`.
- `backgroundColor`: A string representing the background color for unavailable hours.

Here's the basic structure:

### Applying to all days of the week
```tsx
const unavailableHours = useMemo(
    () => [
      {
        start: 0,
        end: 6 * 60,
        enableBackgroundInteraction: true,
        backgroundColor: '#ccc',
      }, // 00:00 - 06:00
      {
        start: 20 * 60,
        end: 24 * 60,
        enableBackgroundInteraction: true,
        backgroundColor: '#ccc',
      }, // 20:00 - 24:00
    ],
    []
  );
<CalendarContainer
    unavailableHours={unavailableHours}
    // ... other props
>
    <CalendarHeader />
    <CalendarBody />
</CalendarContainer>
```

![unavailable-hours](../assets/unavailable-hours.png)


### Applying to specific days
```tsx
<CalendarKit
    unavailableHours={{
        1: [{ start: 0, end: 6 * 60 }, { start: 20 * 60, end: 24 * 60 }], // 00:00 - 06:00 and 20:00 - 24:00
        '2024-05-01': [{ start: 0, end: 6 * 60 }, { start: 20 * 60, end: 24 * 60 }], // 00:00 - 06:00 and 20:00 - 24:00
        '2024-05-02': [{ start: 0, end: 24 * 60 }], // All day
    }}
/>
```

## Examples

Let's explore various cases and how to implement them:

### 1. Weekday Working Hours

To set unavailable hours for weekdays (assuming work hours are 9 AM to 5 PM):

```tsx
const unavailableHours = useMemo(
    () => ({
        1: [{ start: 0, end: 9 * 60 }, { start: 17 * 60, end: 24 * 60 }],  // Monday 00:00 - 09:00 and 17:00 - 24:00
        2: [{ start: 0, end: 9 * 60 }, { start: 17 * 60, end: 24 * 60 }],  // Tuesday 00:00 - 09:00 and 17:00 - 24:00
        3: [{ start: 0, end: 9 * 60 }, { start: 17 * 60, end: 24 * 60 }],  // Wednesday 00:00 - 09:00 and 17:00 - 24:00
        4: [{ start: 0, end: 9 * 60 }, { start: 17 * 60, end: 24 * 60 }],  // Thursday 00:00 - 09:00 and 17:00 - 24:00
        5: [{ start: 0, end: 9 * 60 }, { start: 17 * 60, end: 24 * 60 }],  // Friday 00:00 - 09:00 and 17:00 - 24:00
    }),
    []
);
```

### 2. Weekend Unavailability

To mark weekends as entirely unavailable:

```tsx
const unavailableHours = useMemo(
    () => ({
        6: [{ start: 0, end: 24 * 60 }],  // Saturday
        7: [{ start: 0, end: 24 * 60 }],  // Sunday
    }),
    []
);
```

### 3. Lunch Break

To mark a lunch break as unavailable on all days:

```tsx
const unavailableHours = useMemo(
    () => ({
        1: [{ start: 12 * 60, end: 13 * 60 }],
        2: [{ start: 12 * 60, end: 13 * 60 }],
        3: [{ start: 12 * 60, end: 13 * 60 }],
        4: [{ start: 12 * 60, end: 13 * 60 }],
        5: [{ start: 12 * 60, end: 13 * 60 }],
        6: [{ start: 12 * 60, end: 13 * 60 }],
        7: [{ start: 12 * 60, end: 13 * 60 }],
    }),
    []
);
```

### 4. Complex Schedule

For a more complex schedule with different hours for different days:

```tsx
const unavailableHours = useMemo(
    () => ({
        1: [{ start: 0, end: 9 * 60 }, { start: 17 * 60, end: 24 * 60 }],  // Monday 00:00 - 09:00 and 17:00 - 24:00
        2: [{ start: 0, end: 10 * 60 }, { start: 16 * 60, end: 24 * 60 }], // Tuesday 00:00 - 10:00 and 16:00 - 24:00
        3: [{ start: 0, end: 9 * 60 }, { start: 17 * 60, end: 24 * 60 }],  // Wednesday 00:00 - 09:00 and 17:00 - 24:00
        4: [{ start: 0, end: 10 * 60 }, { start: 16 * 60, end: 24 * 60 }], // Thursday 00:00 - 10:00 and 16:00 - 24:00
        5: [{ start: 0, end: 9 * 60 }, { start: 14 * 60, end: 24 * 60 }],  // Friday 00:00 - 09:00 and 14:00 - 24:00
        6: [{ start: 0, end: 24 * 60 }],  // Saturday 00:00 - 24:00
        7: [{ start: 0, end: 24 * 60 }],  // Sunday 00:00 - 24:00
    }),
    []
);
```

## Considerations

- The day numbers are 1-7, where 1 is Monday and 7 is Sunday.
- When specifying hours, use minutes from midnight (0-1440).
- You can specify multiple unavailable ranges for each day.
- If a day is not specified in the object, it will be treated as fully available.

## Customizing Appearance

You can set default background color for unavailable hours using the theme prop:

```tsx
<CalendarKit
    unavailableHours={{
        1: [{ start: 0, end: 9 * 60 }, { start: 17 * 60, end: 24 * 60 }],
    }}
    theme={{
        unavailableHourBackgroundColor: 'rgba(0, 0, 0, 0.1)', // Customize the background color
    }}
/>  
```

### renderCustomUnavailableHour Prop

The `renderCustomUnavailableHour` prop is a function that receives an object with the following properties:

- `start`: The start hour (in minutes)
- `end`: The end hour (in minutes)
- `enableBackgroundInteraction`: Whether background interaction is enabled
- `backgroundColor`: The background color
- `width`: The width of the unavailable slot (`SharedValue<number>`)
- `height`: The height of the unavailable slot (`SharedValue<number>`)

Here's an example of how to use `renderCustomUnavailableHour`:

```tsx
 const renderCustomUnavailableHour = useCallback(
    (
      props: UnavailableHourProps & {
        width: SharedValue<number>;
        height: SharedValue<number>;
      }
    ) => {
      return <CustomUnavailableHour {...props} />;
    },
    []
  );

<CalendarBody renderCustomUnavailableHour={renderCustomUnavailableHour} />
```

- CustomUnavailableHour component:

```tsx CustomUnavailableHour
import { UnavailableHourProps } from '@howljs/calendar-kit';
import React, { FC } from 'react';
import Animated, {
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Defs, Line, Pattern, Rect, Svg } from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CustomUnavailableHour: FC<
  UnavailableHourProps & {
    width: SharedValue<number>;
    height: SharedValue<number>;
  }
> = (props) => {
  const patternSize = 5;

  const rectProps = useAnimatedProps(() => ({
    height: props.height.value,
  }));

  return (
    <Svg>
      <Defs>
        <Pattern
          id="stripe-pattern"
          patternUnits="userSpaceOnUse"
          width={patternSize}
          height={patternSize}
          patternTransform="rotate(-45)">
          <Line
            x1={0}
            y={0}
            x2={0}
            y2={patternSize + 5}
            stroke="red"
            strokeWidth={1.5}
            strokeLinecap="butt"
          />
        </Pattern>
      </Defs>
      <AnimatedRect
        x="0"
        y="0"
        width="100%"
        fill="url(#stripe-pattern)"
        animatedProps={rectProps}
      />
    </Svg>
  );
};

export default CustomUnavailableHour;
```