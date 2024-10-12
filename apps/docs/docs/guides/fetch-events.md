---
sidebar_position: 6
---

# Fetch events

Learn how to fetch new events when the date changes in your calendar application.

## Overview

This guide demonstrates how to implement a calendar component that fetches events dynamically as the user navigates through different dates.

## Example

```tsx
import {
  CalendarContainer,
  CalendarBody,
  CalendarHeader,
  EventItem,
} from '@howljs/calendar-kit';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';

const randomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const generateEvents = ({ from, to }: { from: string; to: string }) => {
  return new Array(20).fill(0).map((_, index) => {
    const randomDateByIndex = new Date(
      new Date(from).getFullYear(),
      new Date(from).getMonth(),
      new Date(from).getDate() +
        Math.floor(
          Math.random() * (new Date(to).getDate() - new Date(from).getDate())
        ),
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60),
      Math.floor(Math.random() * 60)
    );
    const duration = (Math.floor(Math.random() * 15) + 1) * 15 * 60 * 1000;
    const endDate = new Date(randomDateByIndex.getTime() + duration);
    return {
      id: `event_${Math.random().toString(36).substring(2, 15)}`,
      start: {
        dateTime: randomDateByIndex.toISOString(),
      },
      end: {
        dateTime: endDate.toISOString(),
      },
      title: `Event ${index + 1}`,
      color: randomColor(),
    } as EventItem;
  });
};

const fetchData = (props: { from: string; to: string }) =>
  new Promise<EventItem[]>((resolve) => {
    setTimeout(() => {
      resolve(generateEvents(props));
    }, 1000);
  });

const Calendar = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getEvents = async (date: string) => {
    try {
      setIsLoading(true);
      const offset = 7; // days
      const dateObj = new Date(date);
      const fromDate = new Date(dateObj);
      fromDate.setDate(dateObj.getDate() - offset);
      const toDate = new Date(dateObj);
      toDate.setDate(dateObj.getDate() + offset);

      const newEvents = await fetchData({
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      });
      setEvents((prev) => [...prev, ...newEvents]);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    getEvents(now.toISOString());
  }, []);

  const _onDateChanged = (date: string) => {
    getEvents(date);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CalendarContainer
        events={events}
        isLoading={isLoading}
        onDateChanged={_onDateChanged}>
        <CalendarHeader />
        <CalendarBody />
      </CalendarContainer>
    </SafeAreaView>
  );
};

export default Calendar;

```
