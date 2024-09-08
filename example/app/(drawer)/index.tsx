import CalendarKit, {
  DragEventProps,
  EventItem,
  OutOfRangeProps,
  PackedEvent,
  type CalendarKitHandle,
  type LocaleConfigsProps,
} from '@howljs/calendar-kit';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WeekdayNumbers } from 'luxon';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import OutOfRange from '../../components/OutOfRange';
import { useAppContext } from '../../context/AppProvider';

type SearchParams = { viewMode: string; numberOfDays: string };

const MIN_DATE = new Date(
  new Date().getFullYear() - 1,
  new Date().getMonth(),
  new Date().getDate()
).toISOString();

const MAX_DATE = new Date(
  new Date().getFullYear() + 1,
  new Date().getMonth(),
  new Date().getDate()
).toISOString();

const INITIAL_DATE = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  new Date().getDate()
).toISOString();

const initialLocales: Record<string, LocaleConfigsProps> = {
  en: {
    weekDayShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
    meridiem: { ante: 'am', post: 'pm' },
  },
  ja: {
    weekDayShort: '日_月_火_水_木_金_土'.split('_'),
    meridiem: { ante: '午前', post: '午後' },
  },
  vi: {
    weekDayShort: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
    meridiem: { ante: 'sa', post: 'ch' },
  },
};

const randomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const minDate = new Date(
  new Date().getFullYear(),
  new Date().getMonth() - 4,
  new Date().getDate()
);

const generateEvents = () => {
  return new Array(300).fill(0).map((_, index) => {
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
      start: randomDateByIndex.toISOString(),
      end: endDate.toISOString(),
      title: `Event ${index + 1}`,
      color: randomColor(),
      titleColor: 'white',
    };
  });
};

const Calendar = () => {
  const [events, setEvents] = useState<EventItem[]>(() => generateEvents());
  const { bottom: safeBottom } = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const calendarRef = useRef<CalendarKitHandle>(null);
  const { configs } = useAppContext();
  const params = useLocalSearchParams<SearchParams>();
  const router = useRouter();
  const currentDate = useSharedValue(INITIAL_DATE);
  const [selectedEvent, setSelectedEvent] = useState<DragEventProps>();

  const _onChange = (date: string) => {
    currentDate.value = date;
  };

  const _onPressDayNumber = (date: string) => {
    calendarRef.current?.setVisibleDate(date);
    router.setParams({ viewMode: 'day', numberOfDays: '1' });
  };

  const _onPressToday = useCallback(() => {
    calendarRef.current?.goToDate({
      date: new Date().toISOString(),
      animatedDate: true,
      hourScroll: true,
    });
  }, []);

  const unavailableHours = useMemo(
    () => [
      { start: 0, end: 6 * 60, enableBackgroundInteraction: true },
      { start: 20 * 60, end: 24 * 60, enableBackgroundInteraction: true },
    ],
    []
  );
  const highlightDates = useMemo(
    () => ({
      '6': { dayNumber: { color: 'blue' }, dayName: { color: 'blue' } },
      '7': { dayNumber: { color: 'red' }, dayName: { color: 'red' } },
    }),
    []
  );

  const _renderCustomOutOfRange = useCallback((props: OutOfRangeProps) => {
    return <OutOfRange {...props} />;
  }, []);

  const _onPressBackground = (date: string) => {
    // if (selectedEvent) {
    //   const startISO = new Date(date).toISOString();
    //   const duration =
    //     new Date(selectedEvent.end).getTime() -
    //     new Date(selectedEvent.start).getTime();
    //   const end = new Date(date).getTime() + duration;
    //   const endISO = new Date(end).toISOString();
    //   const newEvent = { ...selectedEvent, start: startISO, end: endISO };
    //   if (newEvent.id) {
    //     let newEvents = events.filter((item) => item.id !== newEvent.id);
    //     newEvents.push({ ...newEvent, id: newEvent.id });
    //     setEvents(newEvents);
    //   }
    //   setSelectedEvent(newEvent);
    // }
    console.log(new Date(date).toISOString());
    setSelectedEvent(undefined);
  };

  const _renderEvent = useCallback((props: PackedEvent) => {
    return <Text>{props.title}</Text>;
  }, []);

  const isWorkWeek = params.viewMode === 'week' && params.numberOfDays === '5';
  const hideWeekDays: WeekdayNumbers[] = isWorkWeek ? [6, 7] : [];

  return (
    <View style={styles.container}>
      <Header currentDate={currentDate} onPressToday={_onPressToday} />
      <CalendarKit
        ref={calendarRef}
        numberOfDays={Number(params.numberOfDays)}
        scrollByDay={Number(params.numberOfDays) < 5}
        firstDay={isWorkWeek ? 1 : configs.startOfWeek}
        hideWeekDays={hideWeekDays}
        initialLocales={initialLocales}
        themeMode={
          configs.themeMode === 'auto'
            ? colorScheme === 'dark'
              ? 'dark'
              : 'light'
            : configs.themeMode
        }
        showWeekNumber={configs.showWeekNumber}
        locale="en"
        allowPinchToZoom
        onChange={_onChange}
        onDateChanged={console.log}
        minDate={MIN_DATE}
        maxDate={MAX_DATE}
        initialDate={INITIAL_DATE}
        onPressDayNumber={_onPressDayNumber}
        renderCustomOutOfRange={_renderCustomOutOfRange}
        onPressBackground={_onPressBackground}
        unavailableHours={unavailableHours}
        highlightDates={highlightDates}
        events={events}
        onPressEvent={(event) => {
          console.log(new Date(event.start as string).toLocaleString());
        }}
        renderEvent={_renderEvent}
        scrollToNow
        rightEdgeSpacing={4}
        overlapEventsSpacing={1}
        useHaptic
        timezone="Asia/Tokyo"
        allowDragToEdit
        allowDragToCreate
        onLongPressEvent={(event) => {
          if (event.id !== selectedEvent?.id) {
            setSelectedEvent(undefined);
          }
        }}
        selectedEvent={selectedEvent}
        start={60}
        end={23 * 60}
        defaultDuration={60}
        onDragEventEnd={(event) => {
          if (event.id) {
            let newEvents = events.filter((item) => item.id !== event.id);
            newEvents.push({ ...event, id: event.id });
            setEvents(newEvents);
          }
          setSelectedEvent(event);
        }}
        onDragSelectedEventEnd={(event) => {
          if (event.id) {
            let newEvents = events.filter((item) => item.id !== event.id);
            newEvents.push({ ...event, id: event.id });
            setEvents(newEvents);
          }
          setSelectedEvent(event);
        }}
        onDragCreateEventEnd={(event) => {
          const newEvent = {
            ...event,
            id: `event_${events.length + 1}`,
            title: `Event ${events.length + 1}`,
            color: randomColor(),
          };
          const newEvents = [...events, newEvent];
          setEvents(newEvents);
          setSelectedEvent(newEvent);
        }}
      />
      <View style={[styles.actions, { paddingBottom: safeBottom }]}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            const newEvents = generateEvents();
            setEvents(newEvents);
          }}
        >
          <Text>Random events</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            calendarRef.current?.goToPrevPage(true);
          }}
        >
          <Text>Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            calendarRef.current?.goToNextPage(true);
          }}
        >
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: { flex: 1 },
  actions: { flexDirection: 'row', gap: 10, padding: 10 },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#23cfde',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
  },
  date: { fontSize: 16, fontWeight: 'bold' },
});
