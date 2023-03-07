import {
  EventItem,
  HighlightDates,
  MomentConfig,
  OnChangeProps,
  PackedEvent,
  RangeTime,
  TimelineCalendar,
  TimelineCalendarHandle,
  UnavailableItemProps,
} from '@howljs/calendar-kit';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Line, Svg } from 'react-native-svg';
import CustomUnavailableItem from './CustomUnavailableItem';

interface CalendarProps {
  route: RouteProp<any>;
  navigation: NavigationProp<any>;
}

const randLightColor = () => {
  return (
    'hsl(' +
    360 * Math.random() +
    ',' +
    (25 + 70 * Math.random()) +
    '%,' +
    (85 + 10 * Math.random()) +
    '%)'
  );
};

const randColor = () => {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
      .toUpperCase()
  );
};

const unavailableHours = {
  '0': [{ start: 0, end: 24 }],
  '1': [
    { start: 0, end: 7 },
    { start: 18, end: 24 },
  ],
  '2': [
    { start: 0, end: 7 },
    { start: 18, end: 24 },
  ],
  '3': [
    { start: 0, end: 7 },
    { start: 18, end: 24 },
  ],
  '4': [
    { start: 0, end: 7 },
    { start: 18, end: 24 },
  ],
  '5': [
    { start: 0, end: 7 },
    { start: 18, end: 24 },
  ],
  '6': [{ start: 0, end: 24 }],
  '2022-12-01': [
    { start: 0, end: 7.5 },
    { start: 12, end: 13.5 },
    { start: 17, end: 24 },
  ],
  '2022-11-29': [
    { start: 0, end: 8.5 },
    { start: 16, end: 24 },
  ],
};

MomentConfig.updateLocale('vi', {
  weekdaysShort: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
});

MomentConfig.updateLocale('ja', {
  weekdaysShort: '日_月_火_水_木_金_土'.split('_'),
});

const Calendar = ({ route, navigation }: CalendarProps) => {
  const { bottom: safeBottom } = useSafeAreaInsets();
  const calendarRef = useRef<TimelineCalendarHandle>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<PackedEvent>();

  const _renderHeaderRight = useCallback(() => {
    return (
      <TouchableOpacity
        style={styles.headerRight}
        onPress={() => {
          if (selectedEvent) {
            return;
          }
          calendarRef.current?.goToDate({
            hourScroll: true,
          });
        }}
      >
        <Text allowFontScaling={false}>Now</Text>
      </TouchableOpacity>
    );
  }, [selectedEvent]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: _renderHeaderRight,
    });
  }, [_renderHeaderRight, navigation]);

  const _onDragCreateEnd = (event: RangeTime) => {
    const randomId = Math.random().toString(36).slice(2, 10);
    const newEvent = {
      id: randomId,
      title: randomId,
      start: event.start,
      end: event.end,
      color: randLightColor(),
      containerStyle: { borderColor: randColor(), borderWidth: 1 },
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const _onLongPressEvent = (event: PackedEvent) => {
    setSelectedEvent(event);
  };

  const _onPressCancel = () => {
    setSelectedEvent(undefined);
  };

  const _onPressSubmit = () => {
    setEvents((prevEvents) =>
      prevEvents.map((ev) => {
        if (ev.id === selectedEvent?.id) {
          return { ...ev, ...selectedEvent };
        }
        return ev;
      })
    );
    setSelectedEvent(undefined);
  };

  const _renderEditFooter = () => {
    return (
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={_onPressCancel}>
          <Text style={styles.btnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={_onPressSubmit}>
          <Text style={styles.btnText}>Save</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const _renderCustomUnavailableItem = useCallback(
    (props: UnavailableItemProps) => <CustomUnavailableItem {...props} />,
    []
  );

  const highlightDates: HighlightDates = useMemo(
    () => ({
      '2022-11-07': {
        dayNameColor: '#CF0A0A',
        dayNumberColor: '#CF0A0A',
        dayNumberBackgroundColor: '#FFF',
      },
      '2022-11-08': {
        dayNameColor: '#0008C1',
        dayNumberColor: '#0008C1',
        dayNumberBackgroundColor: '#FFF',
      },
      '2022-11-09': {
        dayNameColor: '#E14D2A',
        dayNumberColor: '#FFF',
        dayNumberBackgroundColor: '#E14D2A',
      },
    }),
    []
  );

  const _onChange = ({ date }: OnChangeProps) => {
    navigation.setOptions({
      title: dayjs(date).format('MMMM YYYY'),
    });
  };

  const _onPressDayNum = (date: string) => {
    if (route.params?.viewMode === 'day') {
      return;
    }
    navigation.navigate('Calendar', { viewMode: 'day' });
    setTimeout(() => {
      calendarRef.current?.goToDate({ date, animatedDate: true });
    }, 100);
  };

  const _renderHalfLineCustom = useCallback(
    (width) => (
      <Svg>
        <Line
          x1="0"
          y1="1"
          x2={width}
          y2="1"
          stroke="#ececec"
          strokeDasharray={5}
          strokeWidth={2}
        />
      </Svg>
    ),
    []
  );

  return (
    <View style={[styles.container, { paddingBottom: safeBottom }]}>
      <TimelineCalendar
        ref={calendarRef}
        viewMode={route.params?.viewMode ?? 'week'}
        allowPinchToZoom
        allowDragToCreate
        events={events}
        unavailableHours={unavailableHours}
        holidays={['2022-11-05', '2022-11-02']}
        onDragCreateEnd={_onDragCreateEnd}
        onLongPressEvent={_onLongPressEvent}
        selectedEvent={selectedEvent}
        onEndDragSelectedEvent={setSelectedEvent}
        renderCustomUnavailableItem={_renderCustomUnavailableItem}
        highlightDates={highlightDates}
        onPressDayNum={_onPressDayNum}
        onChange={_onChange}
        theme={{
          unavailableBackgroundColor: 'transparent',
          //Saturday style
          saturdayName: { color: 'blue' },
          saturdayNumber: { color: 'blue' },
          saturdayNumberContainer: { backgroundColor: 'white' },

          //Sunday style
          sundayName: { color: 'red' },
          sundayNumber: { color: 'red' },
          sundayNumberContainer: { backgroundColor: 'white' },

          //Today style
          todayName: { color: 'green' },
          todayNumber: { color: 'white' },
          todayNumberContainer: { backgroundColor: 'green' },

          //Normal style
          dayName: { color: 'black' },
          dayNumber: { color: 'black' },
          dayNumberContainer: { backgroundColor: 'white' },
          allowFontScaling: false,
        }}
        locale="en"
        useHaptic
        timeZone="Asia/Tokyo"
        renderHalfLineCustom={_renderHalfLineCustom}
        halfLineContainerStyle={styles.halfLineContainer}
      />
      {!!selectedEvent && _renderEditFooter()}
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerRight: { marginRight: 16 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    height: 85,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    height: 45,
    paddingHorizontal: 24,
    backgroundColor: '#1973E7',
    justifyContent: 'center',
    borderRadius: 24,
    marginHorizontal: 8,
    marginVertical: 8,
  },
  btnText: { fontSize: 16, color: '#FFF', fontWeight: 'bold' },
  halfLineContainer: { backgroundColor: 'transparent' },
});
