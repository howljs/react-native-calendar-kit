import CalendarKit, {
  OutOfRangeProps,
  type CalendarKitHandle,
  type CalendarViewMode,
  type LocaleConfigs,
} from '@howljs/calendar-kit';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

type SearchParams = { viewMode: CalendarViewMode; numberOfDays: string };

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

const initialLocales: Record<string, LocaleConfigs> = {
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

const randomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const minDate = new Date(
  new Date().getFullYear(),
  new Date().getMonth() - 4,
  new Date().getDate()
);

const generateEvents = () => {
  return new Array(1000).fill(0).map((_, index) => {
    const randomDateByIndex = new Date(
      minDate.getFullYear(),
      minDate.getMonth(),
      minDate.getDate() + Math.floor(index / 2),
      Math.floor(Math.random() * 15),
      Math.floor(Math.random() * 60)
    );

    const duration =
      Math.floor(Math.random() * 3.5 * 60 * 60 * 1000) + 30 * 60 * 1000;

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
  const [events, setEvents] = useState(() => generateEvents());
  const { bottom: safeBottom } = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const calendarRef = useRef<CalendarKitHandle>(null);
  const { configs } = useAppContext();
  const params = useLocalSearchParams<SearchParams>();
  const router = useRouter();
  const currentDate = useSharedValue(INITIAL_DATE);

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
    console.log(date);
  };

  const _renderEvent = useCallback(() => {
    return <Text>Event</Text>;
  }, []);

  return (
    <View style={styles.container}>
      <Header currentDate={currentDate} onPressToday={_onPressToday} />
      <CalendarKit
        ref={calendarRef}
        viewMode={params.viewMode}
        scrollByDay={params.viewMode === 'day'}
        numberOfDays={Number(params.numberOfDays)}
        firstDay={configs.startOfWeek}
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
        onPressEvent={console.log}
        renderEvent={_renderEvent}
        scrollToNow
        rightEdgeSpacing={4}
        overlapEventsSpacing={1}
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
            calendarRef.current?.goToPrevPage(true, params.viewMode === 'day');
          }}
        >
          <Text>Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            calendarRef.current?.goToNextPage(true, params.viewMode === 'day');
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
