---
sidebar_position: 8
---

# Locale and Date Formatting

React Native Calendar Kit provides extensive customization options for locale settings and date formatting. This guide will walk you through how to set custom locales, hour formats, date formats, and other related customizations.

## Setting the Locale

You can set the locale for your calendar using the `initialLocales` and `locale` prop.

```tsx
const initialLocales: Record<string, Partial<LocaleConfigsProps>> = {
  en: {
    weekDayShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'), // Text in day header (Sun, Mon, etc.)
    meridiem: { ante: 'am', post: 'pm' }, // Hour format (hh:mm a)
    more: 'more', // Text for "more" button (All day events)
  },
  ja: {
    weekDayShort: '日_月_火_水_木_金_土'.split('_'),
    meridiem: { ante: '午前', post: '午後' },
    more: 'もっと',
  },
  vi: {
    weekDayShort: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
    meridiem: { ante: 'sa', post: 'ch' },
    more: 'Xem thêm',
  },
};

<CalendarKit
  initialLocales={initialLocales}
  locale="en"
  // ... other props
/>
```

The `locale` prop is the key of `initialLocales` object.

## Customizing Date and Time Formats

You can customize various date and time formats used throughout the calendar:

### Hour Format

To customize the format of hours displayed in the calendar:

```tsx
<CalendarKit
    hourFormat="HH:mm"  // 24-hour format
    // or
    hourFormat="hh:mm a"  // 12-hour format with AM/PM
    // ... other props
/>
```

## Time Zone

You can specify the time zone for the calendar:

```tsx
<CalendarKit
    timeZone="America/New_York"
    // ... other props
/>
```

## Considerations

- Make sure to use consistent locale settings across your app for a uniform user experience.
- Some date formats may affect the layout of your calendar. Always test different locales and formats to ensure your calendar looks good in all scenarios.
- Remember that changing the locale affects not just the visible text, but also the order of days, first day of the week, and other locale-specific behaviors.

By leveraging these customization options, you can create a calendar that perfectly fits the language and formatting needs of your target audience.
