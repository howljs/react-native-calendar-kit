import CustomUnavailableHour from '@/components/CustomUnavailableHour';
import ResourceNavigation from '@/components/ResourceNavigation';
import { Ionicons } from '@expo/vector-icons';
import type {
  CalendarKitHandle,
  DateOrDateTime,
  DraggingEventProps,
  EventItem,
  HeaderItemProps,
  LocaleConfigsProps,
  ResourceItem,
  SelectedEventType,
  UnavailableHourProps,
} from '@howljs/calendar-kit';
import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  DraggingEvent,
  ResourceHeaderItem,
} from '@howljs/calendar-kit';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { WeekdayNumbers } from 'luxon';
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
  useColorScheme,
  View,
} from 'react-native';
import {
  configureReanimatedLogger,
  SharedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { useAppContext } from '../../context/AppProvider';

configureReanimatedLogger({ strict: false });

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

const initialLocales: Record<string, Partial<LocaleConfigsProps>> = {
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

const allDayEvents: EventItem[] = [
  {
    id: 'event_0',
    start: {
      date: '2024-09-14',
    },
    end: {
      date: '2024-09-24',
    },
    title: 'Event 0',
    color: '#5428F2',
  },
  {
    id: 'event_0x',
    start: {
      dateTime: '2024-09-16T22:00:00.000+07:00',
    },
    end: {
      dateTime: '2024-09-22T23:00:00.000+07:00',
    },
    title: 'Event 0x',
    color: '#5428F2',
  },
  {
    id: 'event_1',
    start: {
      dateTime: '2024-09-16T22:00:00.000+07:00',
    },
    end: {
      dateTime: '2024-09-18T22:00:00.000+07:00',
    },
    title: 'Event 1',
    color: '#5428F2',
  },
  {
    id: 'event_1x',
    start: {
      dateTime: '2024-09-16T00:00:00.000+07:00',
    },
    end: {
      dateTime: '2024-09-19T00:00:00.000+07:00',
    },
    title: 'Event 1x',
    color: '#5428F2',
  },
  {
    id: 'event_2',
    start: {
      dateTime: '2024-09-21T00:00:00.000+07:00',
    },
    end: {
      dateTime: '2024-09-22T00:00:00.000+07:00',
    },
    title: 'Event 2',
    color: '#8EBB85',
  },
  {
    id: 'event_2x',
    start: {
      date: '2024-09-18',
    },
    end: {
      date: '2024-09-21',
    },
    title: 'Event 2x',
    color: '#5428F2',
  },
  {
    id: 'event_3c',
    start: {
      date: '2024-09-16',
    },
    end: {
      date: '2024-09-16',
    },
    title: 'Event 3',
    color: '#B70100',
  },
  {
    id: 'event_3xx',
    start: {
      dateTime: '2024-09-16T22:00:00.000+07:00',
    },
    end: {
      dateTime: '2024-09-17T22:00:00.000+07:00',
    },
    title: 'Event 3xx',
    color: '#5428F2',
  },
  {
    id: 'event_3x',
    start: {
      dateTime: '2024-09-16T15:00:00.000+07:00',
    },
    end: {
      dateTime: '2024-09-17T23:00:00.000+07:00',
    },
    title: 'Event 3x',
    color: '#5428F2',
  },
  {
    id: 'event_4',
    start: {
      dateTime: '2024-09-20T17:00:00.000Z',
    },
    end: {
      dateTime: '2024-09-21T17:00:00.000Z',
    },
    title: 'Event 4',
    color: '#B70100',
  },
  {
    id: 'event_5',
    start: {
      dateTime: '2024-09-19T17:00:00.000Z',
    },
    end: {
      dateTime: '2024-09-21T17:00:00.000Z',
    },
    title: 'Event 5',
    color: '#EAAB7E',
  },
  {
    id: 'event_6',
    start: {
      dateTime: '2024-09-17T17:00:00.000Z',
    },
    end: {
      dateTime: '2024-09-18T17:00:00.000Z',
    },
    title: 'Event 6x',
    color: '#AC2A57',
  },
  {
    id: 'event_7',
    start: {
      dateTime: '2024-09-20T17:00:00.000Z',
    },
    end: {
      dateTime: '2024-09-21T17:00:00.000Z',
    },
    title: 'Event 7',
    color: '#DC1F98',
  },
  {
    id: 'event_8',
    start: {
      dateTime: '2024-09-19T17:00:00.000Z',
    },
    end: {
      dateTime: '2024-09-21T17:00:00.000Z',
    },
    title: 'Event 8',
    color: '#6E911C',
  },
  {
    id: 'event_9',
    start: {
      dateTime: '2024-09-20T17:00:00.000Z',
    },
    end: {
      dateTime: '2024-09-22T17:00:00.000Z',
    },
    title: 'Event 9',
    color: '#BE1459',
  },
  {
    id: 'event_10',
    start: {
      dateTime: '2024-09-19T17:00:00.000Z',
    },
    end: {
      dateTime: '2024-09-21T17:00:00.000Z',
    },
    title: 'Event 10',
    color: '#BA3D9D',
  },
  {
    id: 'event_11',
    start: {
      dateTime: '2024-09-20T00:00:00.000+07:00',
    },
    end: {
      dateTime: '2024-09-26T00:00:00.000+07:00',
    },
    title: 'Event 11',
    color: '#BA3D9D',
  },
  {
    id: 'event_2xx3',
    start: {
      date: '2024-09-16',
    },
    end: {
      date: '2024-09-17',
    },
    title: 'All day Recurring',
    color: '#BA3D9D',
    recurrence: 'FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,TH,FR',
    excludeDates: ['2024-09-16', '2024-09-22'],
  },
  {
    id: 'event_26',
    start: {
      dateTime: '2024-09-16T05:00:00.000Z',
    },
    end: {
      dateTime: '2024-09-16T07:00:00.000Z',
    },
    title: 'Event Recurring',
    color: '#BA3D9D',
    recurrence: 'FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,TH,FR',
    excludeDates: [
      '2024-09-16T05:00:00.000Z',
      '2024-09-22T05:00:00.000Z',
      '2024-10-11T05:00:00.000Z',
    ],
  },
];

const TOTAL_RESOURCES = 50;

const generateEvents = () => {
  return new Array(500)
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
        start: {
          dateTime: randomDateByIndex.toISOString(),
        },
        end: {
          dateTime: endDate.toISOString(),
        },
        title: `Event ${index + 1}`,
        color: randomColor(),
        resourceId: `resource_${Math.floor(Math.random() * TOTAL_RESOURCES) + 1}`,
      } as EventItem;
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
  const [currentDate, setCurrentDate] = useState(INITIAL_DATE);

  const [selectedEvent, setSelectedEvent] = useState<SelectedEventType>();
  const [calendarWidth, setCalendarWidth] = useState(
    Dimensions.get('window').width
  );

  const isResourcesMode = params.viewMode === 'resources';

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setCalendarWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const _onChange = (date: string) => {
    setCurrentDate(date);
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

  const resources = useMemo(() => {
    return new Array(TOTAL_RESOURCES).fill(0).map((_, index) => {
      return {
        id: `resource_${index + 1}`,
        title: `Resource ${index + 1}`,
      };
    });
  }, []);

  const unavailableHours = useMemo(
    () => [
      { start: 0, end: 6 * 60, enableBackgroundInteraction: true },
      { start: 20 * 60, end: 24 * 60, enableBackgroundInteraction: true },
      {
        start: 7 * 60,
        end: 8 * 60,
        enableBackgroundInteraction: true,
        resourceId: resources[0].id,
      },
      {
        start: 8 * 60,
        end: 9 * 60,
        enableBackgroundInteraction: true,
        resourceId: resources[1].id,
      },
      {
        start: 9 * 60,
        end: 10 * 60,
        enableBackgroundInteraction: true,
        resourceId: resources[2].id,
      },
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

  const _onPressBackground = (props: DateOrDateTime) => {
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
    console.log('BACKGROUND');
    if (props.date) {
      console.log(new Date(props.date).toISOString());
    }
    if (props.dateTime) {
      console.log(new Date(props.dateTime).toISOString());
    }
    setSelectedEvent(undefined);
  };

  const isWorkWeek = params.viewMode === 'week' && params.numberOfDays === '5';
  const hideWeekDays: WeekdayNumbers[] = isWorkWeek ? [6, 7] : [];

  const onPressPrevious = () => {
    calendarRef.current?.goToPrevPage();
  };

  const onPressNext = () => {
    calendarRef.current?.goToNextPage();
  };

  const _renderResource = useCallback((resource: ResourceItem) => {
    return (
      <View style={styles.resourceContainer}>
        <Ionicons name="person-circle-outline" size={24} color="black" />
        <Text>{resource.title}</Text>
      </View>
    );
  }, []);

  const _renderResourceHeaderItem = useCallback(
    (item: HeaderItemProps) => {
      return (
        <ResourceHeaderItem
          startUnix={item.startUnix}
          resources={item.extra.resources}
          renderResource={_renderResource}
          DateComponent={null}
        />
      );
    },
    [_renderResource]
  );

  const _renderCustomHorizontalLine = useCallback(
    (props: { index: number; borderColor: string }) => {
      // Check if index is a whole number (not 0.5, 1.5, etc)
      const isWholeNumber = Number.isInteger(props.index);
      if (isWholeNumber) {
        return (
          <View
            pointerEvents="none"
            style={{
              height: 1,
              backgroundColor: props.borderColor,
            }}
          />
        );
      }

      return (
        <View
          pointerEvents="none"
          style={{
            height: 1,
            borderWidth: 1,
            borderColor: props.borderColor,
            borderStyle: 'dashed',
          }}
        />
      );
    },
    []
  );

  const _renderCustomUnavailableHour = useCallback(
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

  const _renderDraggingEvent = useCallback((props: DraggingEventProps) => {
    return (
      <DraggingEvent
        {...props}
        containerStyle={{ backgroundColor: '#1a73e8', opacity: 0.5 }}
      />
    );
  }, []);

  return (
    <View style={styles.container}>
      <Header
        currentDate={currentDate}
        onPressToday={_onPressToday}
        onPressPrevious={onPressPrevious}
        onPressNext={onPressNext}
        isResourcesMode={isResourcesMode}
      />
      <CalendarContainer
        ref={calendarRef}
        calendarWidth={calendarWidth}
        numberOfDays={Number(params.numberOfDays)}
        scrollByDay={Number(params.numberOfDays) < 5}
        firstDay={isWorkWeek ? 1 : configs.startOfWeek}
        hideWeekDays={hideWeekDays}
        initialLocales={initialLocales}
        locale="en"
        minRegularEventMinutes={5}
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
          console.log(event);
        }}
        onLoad={() => {
          console.log('onLoad');
        }}
        dragToCreateMode={configs.dragToCreateMode}
        scrollToNow
        useHaptic
        allowDragToEdit
        allowDragToCreate
        useAllDayEvent
        rightEdgeSpacing={4}
        overlapEventsSpacing={1}
        onLongPressEvent={(event) => {
          if (event.id !== selectedEvent?.id) {
            setSelectedEvent(undefined);
          }
        }}
        onDragCreateEventStart={() => {
          setSelectedEvent(undefined);
        }}
        selectedEvent={selectedEvent}
        start={60}
        end={23 * 60}
        spaceFromBottom={safeBottom}
        defaultDuration={60}
        onDragEventEnd={async (event) => {
          console.log('onDragEventEnd', event);

          const { originalRecurringEvent, ...rest } = event;
          if (event.id) {
            const filteredEvents = events.filter(
              (item) =>
                item.id !== event.id && item.id !== originalRecurringEvent?.id
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
          console.log('onDragSelectedEventEnd', event);
          const { originalRecurringEvent, ...rest } = event;
          if (event.id) {
            const filteredEvents = events.filter(
              (item) =>
                item.id !== event.id && item.id !== originalRecurringEvent?.id
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
          console.log('onDragCreateEventEnd', event);
          const newEvent = {
            ...event,
            id: `event_${events.length + 1}`,
            title: `Event ${events.length + 1}`,
            color: '#23cfde',
            resourceId:
              event.resourceId ||
              `resource_${Math.floor(Math.random() * TOTAL_RESOURCES) + 1}`,
          };
          const newEvents = [...events, newEvent];
          setEvents(newEvents);
          setSelectedEvent(newEvent);
        }}
        /**
         * Resource
         */
        resources={isResourcesMode ? resources : undefined}
        resourcePerPage={3}
        enableResourceScroll
        resourcePagingEnabled={true}>
        {isResourcesMode && <ResourceNavigation />}
        <CalendarHeader
          dayBarHeight={isResourcesMode ? 80 : 60}
          renderHeaderItem={
            isResourcesMode ? _renderResourceHeaderItem : undefined
          }
        />
        <CalendarBody
          renderCustomHorizontalLine={_renderCustomHorizontalLine}
          renderCustomUnavailableHour={_renderCustomUnavailableHour}
          renderDraggingEvent={
            configs.dragToCreateMode === 'duration'
              ? undefined
              : _renderDraggingEvent
          }
        />
      </CalendarContainer>
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
  resourceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
});
