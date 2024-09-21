import {
  CalendarBody,
  CalendarContainer,
  CalendarDayBar,
  DragEventProps,
  EventItem,
  OutOfRangeProps,
  PackedEvent,
  type CalendarKitHandle,
  type LocaleConfigsProps,
} from '@howljs/calendar-kit';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WeekdayNumbers } from 'luxon';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
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
  new Date().getFullYear() - 2,
  new Date().getMonth(),
  new Date().getDate()
).toISOString();

const MAX_DATE = new Date(
  new Date().getFullYear() + 2,
  new Date().getMonth(),
  new Date().getDate()
).toISOString();

const INITIAL_DATE = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  new Date().getDate()
).toISOString();

const CALENDAR_THEME = {
  light: {
    colors: {
      primary: '#1a73e8',
      onPrimary: '#fff',
      background: '#fff',
      onBackground: '#000',
      border: '#dadce0',
      text: '#000',
      surface: '#ECECEC',
    },
  },
  dark: {
    colors: {
      primary: '#4E98FA',
      onPrimary: '#FFF',
      background: '#1A1B21',
      onBackground: '#FFF',
      border: '#46464C',
      text: '#FFF',
      surface: '#545454',
    },
  },
};

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

const allDayEvents = [
  {
    id: 'event_0',
    start: '2024-09-14T22:00:00.000+07:00',
    end: '2024-09-24T22:00:00.000+07:00',
    title: 'Event 0',
    color: '#5428F2',
    titleColor: 'white',
  },
  {
    id: 'event_0x',
    start: '2024-09-16T22:00:00.000+07:00',
    end: '2024-09-22T23:00:00.000+07:00',
    title: 'Event 0x',
    color: '#5428F2',
    titleColor: 'white',
  },
  {
    id: 'event_1',
    start: '2024-09-16T22:00:00.000+07:00',
    end: '2024-09-18T22:00:00.000+07:00',
    title: 'Event 1',
    color: '#5428F2',
    titleColor: 'white',
  },
  {
    id: 'event_1x',
    start: '2024-09-16T00:00:00.000+07:00',
    end: '2024-09-19T00:00:00.000+07:00',
    title: 'Event 1x',
    color: '#5428F2',
    titleColor: 'white',
  },
  {
    id: 'event_2',
    start: '2024-09-21T00:00:00.000+07:00',
    end: '2024-09-22T00:00:00.000+07:00',
    title: 'Event 2',
    color: '#8EBB85',
    titleColor: 'white',
  },
  {
    id: 'event_2x',
    start: '2024-09-18T00:00:00.000+07:00',
    end: '2024-09-21T00:00:00.000+07:00',
    title: 'Event 2x',
    color: '#5428F2',
    titleColor: 'white',
  },
  {
    id: 'event_3c',
    start: '2024-09-16',
    end: '2024-09-16',
    title: 'Event 3',
    color: '#B70100',
    titleColor: 'white',
    isAllDay: true,
  },
  {
    id: 'event_3xx',
    start: '2024-09-16T22:00:00.000+07:00',
    end: '2024-09-17T22:00:00.000+07:00',
    title: 'Event 3xx',
    color: '#5428F2',
    titleColor: 'white',
  },
  {
    id: 'event_3x',
    start: '2024-09-16T15:00:00.000+07:00',
    end: '2024-09-17T23:00:00.000+07:00',
    title: 'Event 3x',
    color: '#5428F2',
    titleColor: 'white',
  },
  {
    id: 'event_4',
    start: '2024-09-20T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 4',
    color: '#B70100',
    titleColor: 'white',
  },
  {
    id: 'event_5',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 5',
    color: '#EAAB7E',
    titleColor: 'white',
  },
  {
    id: 'event_6',
    start: '2024-09-17T17:00:00.000Z',
    end: '2024-09-18T17:00:00.000Z',
    title: 'Event 6x',
    color: '#AC2A57',
    titleColor: 'white',
  },
  {
    id: 'event_7',
    start: '2024-09-20T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 7',
    color: '#DC1F98',
    titleColor: 'white',
  },
  {
    id: 'event_8',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 8',
    color: '#6E911C',
    titleColor: 'white',
  },
  {
    id: 'event_9',
    start: '2024-09-20T17:00:00.000Z',
    end: '2024-09-22T17:00:00.000Z',
    title: 'Event 9',
    color: '#BE1459',
    titleColor: 'white',
  },
  {
    id: 'event_10',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 10',
    color: '#BA3D9D',
    titleColor: 'white',
  },
  {
    id: 'event_11',
    start: '2024-09-20T00:00:00.000+07:00',
    end: '2024-09-26T00:00:00.000+07:00',
    title: 'Event 11',
    color: '#BA3D9D',
    titleColor: 'white',
  },
  {
    id: 'event_12',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 12',
    color: '#BA3D9D',
    titleColor: 'white',
  },
  {
    id: 'event_13',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 12',
    color: '#BA3D9D',
    titleColor: 'white',
  },
  {
    id: 'event_14',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 12',
    color: '#BA3D9D',
    titleColor: 'white',
  },
  {
    id: 'event_15',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 12',
    color: '#BA3D9D',
    titleColor: 'white',
  },
  {
    id: 'event_16',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 12',
    color: '#BA3D9D',
    titleColor: 'white',
  },
  {
    id: 'event_17',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 12',
    color: '#BA3D9D',
    titleColor: 'white',
  },
  {
    id: 'event_18',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 12',
    color: '#BA3D9D',
    titleColor: 'white',
  },
  {
    id: 'event_19',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 12',
    color: '#BA3D9D',
    titleColor: 'white',
  },
  {
    id: 'event_20',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 12',
    color: '#BA3D9D',
    titleColor: 'white',
  },
  {
    id: 'event_21',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 12',
    color: '#BA3D9D',
    titleColor: 'white',
  },
  {
    id: 'event_22',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 12',
    color: '#BA3D9D',
    titleColor: 'white',
  },
  {
    id: 'event_23',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 12',
    color: '#BA3D9D',
    titleColor: 'white',
  },
  {
    id: 'event_24',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 12',
    color: '#BA3D9D',
    titleColor: 'white',
  },
  {
    id: 'event_25',
    start: '2024-09-19T17:00:00.000Z',
    end: '2024-09-21T17:00:00.000Z',
    title: 'Event 12',
    color: '#BA3D9D',
    titleColor: 'white',
  },
];
const generateEvents = () => {
  return new Array(1000)
    .fill(0)
    .map((_, index) => {
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
    })
    .concat(allDayEvents);
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
  const [calendarWidth, setCalendarWidth] = useState(
    Dimensions.get('window').width
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setCalendarWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

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

  const _onPressBackground = ({ date }: { date: string }) => {
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

      <CalendarContainer
        ref={calendarRef}
        calendarWidth={calendarWidth}
        numberOfDays={Number(params.numberOfDays)}
        scrollByDay={Number(params.numberOfDays) < 5}
        firstDay={isWorkWeek ? 1 : configs.startOfWeek}
        hideWeekDays={hideWeekDays}
        initialLocales={initialLocales}
        locale="en"
        theme={
          configs.themeMode === 'auto'
            ? colorScheme === 'dark'
              ? CALENDAR_THEME.dark
              : CALENDAR_THEME.light
            : CALENDAR_THEME[configs.themeMode]
        }
        showWeekNumber={configs.showWeekNumber}
        allowPinchToZoom
        onChange={_onChange}
        onDateChanged={console.log}
        minDate={MIN_DATE}
        maxDate={MAX_DATE}
        initialDate={INITIAL_DATE}
        onPressDayNumber={_onPressDayNumber}
        onPressBackground={_onPressBackground}
        unavailableHours={unavailableHours}
        highlightDates={highlightDates}
        events={events}
        onPressEvent={(event) => {
          console.log(new Date(event.start as string).toLocaleString());
        }}
        scrollToNow
        useHaptic
        timezone="Asia/Tokyo"
        allowDragToEdit
        allowDragToCreate
        useAllDayEvent
        onLongPressEvent={(event) => {
          if (event.id !== selectedEvent?.id) {
            setSelectedEvent(undefined);
          }
        }}
        selectedEvent={selectedEvent}
        start={60}
        end={23 * 60}
        defaultDuration={60}
        onDragEventEnd={async (event) => {
          if (event.id) {
            let filteredEvents = events.filter((item) => item.id !== event.id);
            const newEvent = { ...event, id: event.id };
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
          if (event.id) {
            let filteredEvents = events.filter((item) => item.id !== event.id);
            const newEvent = { ...event, id: event.id };
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
      >
        <CalendarDayBar />
        <CalendarBody
          renderCustomOutOfRange={_renderCustomOutOfRange}
          renderEvent={_renderEvent}
          rightEdgeSpacing={4}
          overlapEventsSpacing={1}
        />
      </CalendarContainer>
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
