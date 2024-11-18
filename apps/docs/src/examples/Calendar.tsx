import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  type CalendarProviderProps,
  type EventItem,
  type SelectedEventType,
} from '@howljs/calendar-kit';
import { useState } from 'react';
import { View } from 'react-native';

interface CalendarProps extends CalendarProviderProps {}

const minDate = new Date(new Date().getFullYear(), new Date().getMonth() - 4, new Date().getDate());

const randomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const DEFAULT_EVENTS = new Array(500).fill(0).map((_, index) => {
  const randomDateByIndex = new Date(
    minDate.getFullYear(),
    minDate.getMonth(),
    minDate.getDate() + Math.floor(index / 2),
    Math.floor(Math.random() * 24),
    Math.round((Math.random() * 60) / 15) * 15
  );
  const duration = (Math.floor(Math.random() * 15) + 1) * 15 * 60 * 1000;
  const endDate = new Date(randomDateByIndex.getTime() + duration);
  return {
    id: `event_${index + 1}`,
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

const Test = ({ events: initialEvents = DEFAULT_EVENTS, ...props }: CalendarProps) => {
  const [events, setEvents] = useState<EventItem[]>(initialEvents || []);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEventType>();

  return (
    <View
      style={{
        height: 700,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        overflow: 'hidden',
      }}>
      <CalendarContainer
        {...props}
        events={events}
        selectedEvent={selectedEvent}
        onPressBackground={() => {
          setSelectedEvent(undefined);
        }}
        allowDragToEdit
        onDragEventEnd={async (event) => {
          const { originalRecurringEvent, ...rest } = event;
          if (event.id) {
            const filteredEvents = events.filter(
              (item) => item.id !== event.id && item.id !== originalRecurringEvent?.id
            );
            if (originalRecurringEvent) {
              filteredEvents.push(originalRecurringEvent);
            }
            const newEvent = { ...rest, id: event.id };
            filteredEvents.push(newEvent);
            setEvents(filteredEvents);
          }
          setSelectedEvent(event);
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve(true);
            }, 100);
          });
        }}
        onDragSelectedEventEnd={async (event) => {
          const { originalRecurringEvent, ...rest } = event;
          if (event.id) {
            const filteredEvents = events.filter(
              (item) => item.id !== event.id && item.id !== originalRecurringEvent?.id
            );
            if (originalRecurringEvent) {
              filteredEvents.push(originalRecurringEvent);
            }
            filteredEvents.push(rest as EventItem);
            setEvents(filteredEvents);
          }

          setSelectedEvent(event);
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve(true);
            }, 100);
          });
        }}
        onDragCreateEventEnd={(event) => {
          const newEvent = {
            ...event,
            id: `event_${events.length + 1}`,
            title: `Event ${events.length + 1}`,
            color: '#23cfde',
          };
          const newEvents = [...events, newEvent];
          setEvents(newEvents);
          setSelectedEvent(newEvent);
        }}>
        <CalendarHeader />
        <CalendarBody />
      </CalendarContainer>
    </View>
  );
};

export default Test;
