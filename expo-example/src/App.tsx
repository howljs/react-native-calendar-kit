import {
  CalendarKitHandle,
  CalendarKitProvider,
  CalendarKitWithoutProvider,
  EventItem,
  UnavailableHour,
  type CalendarViewMode,
} from '@howljs/calendar-kit';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Button,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';

const initialLocales = {
  ja: {
    weekDayShort: '日_月_火_水_木_金_土'.split('_'),
  },
  vi: {
    weekDayShort: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
  },
};

const checkIsPortrait = () => {
  const dim = Dimensions.get('screen');
  return dim.height >= dim.width;
};

export default function App() {
  const [value, setValue] = useState(0);
  const [isRTL, setIsRTL] = useState(false);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [isPortrait, setIsPortrait] = useState(() => checkIsPortrait());

  const events: EventItem[] = [
    {
      color: '#95BDFF',
      end: '2023-08-23T11:00:00.000Z',
      id: '7',
      start: '2023-08-23T08:00:00.000Z',
      title: 'Event 7',
    },
    {
      color: '#C8E4B2',
      end: '2023-08-23T11:00:00.000Z',
      id: '7x',
      start: '2023-08-23T08:00:00.000Z',
      title: 'Event 7',
    },
    {
      color: '#95BDFF',
      end: '2023-08-25T10:00:00.000Z',
      id: '8',
      start: '2023-08-24T08:00:00.000Z',
      title: 'Event 8',
    },
    {
      color: '#C8E4B2',
      end: '2023-08-23T03:00:00.000Z',
      id: '9',
      start: '2023-08-23T00:00:00.000Z',
      title: 'Event 9',
    },
    {
      color: '#95BDFF',
      end: '2023-07-16T07:00:00.000Z',
      id: '10',
      start: '2023-07-16T05:00:00.000Z',
      title: 'Event 10',
      recurrenceRule: 'RRULE:FREQ=DAILY;INTERVAL=1;WKST=MO',
    },
  ];

  useEffect(() => {
    Dimensions.addEventListener('change', ({}) => {
      setIsPortrait(checkIsPortrait());
    });
  }, []);

  const _onDateChanged = useCallback((_date: string) => {
    console.log(_date);
  }, []);

  const unavailableHours: { [weekDay: string]: UnavailableHour[] } = useMemo(
    () => ({
      '2': [
        { start: 0, end: 8 },
        { start: 18, end: 24 },
      ],
      '2023-08-10': [
        { start: 0, end: 8 },
        { start: 17, end: 24 },
      ],
    }),
    []
  );

  const holidays: string[] = useMemo(() => ['2023-08-09', '2023-08-16'], []);
  const calendarRef = useRef<CalendarKitHandle>(null);

  const currentDate = useSharedValue('');
  const _onChange = useCallback(
    (date: string) => (currentDate.value = date),
    [currentDate]
  );

  const _onPressDayNumber = useCallback((date: string) => {
    calendarRef.current?.syncDate(date);
    setViewMode('day');
  }, []);

  return (
    <SafeAreaView style={styles.flex}>
      <View>
        <ScrollView horizontal>
          {isPortrait && (
            <React.Fragment>
              <Button title="Day" onPress={() => setViewMode('day')} />
              <Button title="3-Days" onPress={() => setViewMode('threeDays')} />
              <Button title="Week" onPress={() => setViewMode('week')} />
              <Button
                title="Work Week"
                onPress={() => setViewMode('workWeek')}
              />
              <Button title="Month" onPress={() => setViewMode('month')} />
            </React.Fragment>
          )}
          <Button title="RTL" onPress={() => setIsRTL(!isRTL)} />
          <Button title="Render" onPress={() => setValue(() => value + 1)} />
        </ScrollView>
        <HeaderBar
          currentDate={currentDate}
          onPressPrev={() => {
            calendarRef.current?.goToPrevPage(true);
          }}
          onPressNext={() => {
            calendarRef.current?.goToNextPage(true);
          }}
          onPressNow={() => {
            calendarRef.current?.goToDate({ hourScroll: true });
          }}
        />
      </View>
      <View style={styles.flex}>
        {isPortrait ? (
          <CalendarKitProvider
            key="portrait"
            viewMode={viewMode}
            isRTL={isRTL}
            initialLocales={initialLocales}
            minDate="2000-01-01"
            maxDate="2100-12-31"
            timeZone="Asia/Tokyo"
            useAllDayFilter
          >
            <CalendarKitWithoutProvider
              ref={calendarRef}
              onDateChanged={_onDateChanged}
              locale="en"
              unavailableHours={unavailableHours}
              holidays={holidays}
              onChange={_onChange}
              events={events}
              onPressDayNumber={_onPressDayNumber}
              onPressEvent={console.log}
            />
          </CalendarKitProvider>
        ) : (
          <CalendarKitProvider
            key="landscape"
            viewMode="week"
            isRTL={isRTL}
            initialLocales={initialLocales}
            minDate="2000-01-01"
            maxDate="2100-12-31"
            start={7}
            end={21}
            timeInterval={30}
          >
            <CalendarKitWithoutProvider
              onDateChanged={_onDateChanged}
              locale="en"
              unavailableHours={unavailableHours}
              holidays={holidays}
            />
          </CalendarKitProvider>
        )}
      </View>
    </SafeAreaView>
  );
}

interface HeaderBarProps {
  currentDate: SharedValue<string>;
  onPressPrev: () => void;
  onPressNext: () => void;
  onPressNow: () => void;
}

const HeaderBar = ({
  currentDate,
  onPressPrev,
  onPressNext,
  onPressNow,
}: HeaderBarProps) => {
  const [currentMonth, setCurrentMonth] = useState('');

  useAnimatedReaction(
    () => currentDate.value.substring(0, 7),
    (next, prev) => {
      if (next !== prev) {
        runOnJS(setCurrentMonth)(next);
      }
    }
  );

  return (
    <View style={styles.actions}>
      <Text>{currentMonth}</Text>
      <Button title="Prev" onPress={onPressPrev} />
      <Button title="Next" onPress={onPressNext} />
      <Button title="Now" onPress={onPressNow} />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  actions: { flexDirection: 'row', backgroundColor: '#FFF', zIndex: 99 },
});
