import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCalendarKit } from '../../context/CalendarKitProvider';
import { EventItem, LocaleConfigs } from '../../types';
import { parseUnixToDateStr } from '../../utils/dateUtils';
import { useNowIndicator } from '../../context/NowIndicatorProvider';

interface DayBarItemProps {
  startUnix: number;
  locale: string;
  events?: EventItem[];
  onPressDayNumber?: (date: string) => void;
  onPressEvent?: (event: EventItem) => void;
  onLongPressEvent?: (event: EventItem) => void;
}

const DayBarItem = ({
  startUnix,
  locale,
  events = [],
  onPressDayNumber,
  onPressEvent,
  onLongPressEvent,
}: DayBarItemProps) => {
  const {
    calendarSize,
    dayBarHeight,
    theme,
    isRTL,
    hourWidth,
    locales,
    allDayEventHeight,
    overlapEventsSpacing,
    timelineWidth,
  } = useCalendarKit();
  const { currentDateStart } = useNowIndicator();

  const dayByIndex = new Date(startUnix * 1000);
  const weekDay = dayByIndex.getDay();
  const dayNumber = dayByIndex.getDate();
  const currentLocale =
    locales.current[locale] || (locales.current.en as LocaleConfigs);
  const weekDayStr = currentLocale.weekDayShort[weekDay];
  const isToday = currentDateStart === startUnix;

  const _renderEvent = (event: EventItem, index: number) => {
    if (events.length > 3) {
      if (index > 2) {
        return;
      }
      if (index === 2) {
        return (
          <View
            key={event.id}
            style={[
              styles.eventContainer,
              {
                width: timelineWidth - 4,
                height: allDayEventHeight,
                marginBottom: overlapEventsSpacing,
              },
              isRTL ? styles.alignEnd : styles.alignStart,
            ]}
          >
            <Text style={styles.title}>+{events.length - 2}</Text>
          </View>
        );
      }
    }

    const _onPress = () => onPressEvent?.({ ...event, isAllDay: true });
    const _onLongPress = () => onLongPressEvent?.({ ...event, isAllDay: true });

    return (
      <TouchableOpacity
        key={event.id}
        disabled={!onPressEvent}
        activeOpacity={0.6}
        onPress={_onPress}
        onLongPress={_onLongPress}
      >
        <View
          style={[
            styles.eventContainer,
            {
              width: timelineWidth - 4,
              height: allDayEventHeight,
              backgroundColor: event.color,
              marginBottom: overlapEventsSpacing,
            },
            isRTL ? styles.alignEnd : styles.alignStart,
          ]}
        >
          <Text style={styles.title}>{event.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const _onPress = () => {
    const dateStr = parseUnixToDateStr(startUnix);
    onPressDayNumber!(dateStr);
  };

  return (
    <View
      style={[
        {
          width: calendarSize.width,
          height: dayBarHeight,
          backgroundColor: theme.backgroundColor,
        },
        isRTL ? styles.rowReverse : styles.row,
      ]}
    >
      <View
        style={[
          {
            width: hourWidth,
            borderColor: theme.cellBorderColor,
          },
          isRTL ? styles.borderLeft : styles.borderRight,
        ]}
      >
        <Text style={styles.weekDayText}>{weekDayStr}</Text>
        <TouchableOpacity disabled={!onPressDayNumber} onPress={_onPress}>
          <View
            style={[
              styles.dayContainer,
              { backgroundColor: isToday ? theme.primaryColor : undefined },
            ]}
          >
            <Text
              style={[
                styles.dayNumberText,
                { color: isToday ? theme.backgroundColor : undefined },
              ]}
            >
              {dayNumber}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={[styles.flexGrow]}>{events.map(_renderEvent)}</View>
    </View>
  );
};

export default DayBarItem;

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  rowReverse: { flexDirection: 'row-reverse' },
  weekDayText: { fontSize: 10, textAlign: 'center' },
  dayContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    alignSelf: 'center',
  },
  dayNumberText: { fontWeight: '500' },
  flexGrow: { flexGrow: 1 },
  alignStart: { alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
  borderLeft: { borderLeftWidth: 1 },
  borderRight: { borderRightWidth: 1 },
  eventContainer: { marginLeft: 2, borderRadius: 2, padding: 2 },
  title: { fontSize: 10 },
});
