---
sidebar_position: 1
---

# View Mode
TimelineCalendar has 4 modes: **week**, **day**, **threeDays** and **workWeek**

```jsx title="Example"
import { SafeAreaView, Text } from 'react-native';
import React from 'react';
import { TimelineCalendar } from '@howljs/calendar-kit';

const Calendar = () => {
  return (
    <SafeAreaView style={styles.container}>
      <TimelineCalendar viewMode="week" />
    </SafeAreaView>
  );
};

export default Calendar;

const style = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
});
```

![View mode](./img/view-mode.jpg)
