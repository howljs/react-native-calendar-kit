import times from 'lodash/times';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { SECONDS_IN_DAY } from '../../constants';
import { useCalendarKit } from '../../context/CalendarKitProvider';
import { useMultipleDayView } from '../../context/MultipleDayViewProvider';
import { useNowIndicator } from '../../context/NowIndicatorProvider';
import { EventItem, LocaleConfigs } from '../../types';
import { parseUnixToDateStr } from '../../utils/dateUtils';
import AllDayEvent from './AllDayEvent';

interface DayBarItemProps {
  startUnix: number;
  locale: string;
  allDayEvents: Record<string, EventItem[]>;
  allDayHeight: SharedValue<number>;
  onPressDayNumber?: (date: string) => void;
  onPressEvent?: (event: EventItem) => void;
  onLongPressEvent?: (event: EventItem) => void;
}

const DayBarItem = ({
  startUnix,
  locale,
  allDayEvents,
  allDayHeight,
  onPressDayNumber,
  onPressEvent,
  onLongPressEvent,
}: DayBarItemProps) => {
  const {
    timelineWidth,
    numberOfColumns,
    dayBarHeight,
    theme,
    isRTL,
    locales,
    rightEdgeSpacing,
    overlapEventsSpacing,
    allDayEventHeight,
  } = useCalendarKit();
  const { currentDateStart } = useNowIndicator();
  const { dayBar } = theme;
  const { columnWidth } = useMultipleDayView();

  const animView = useAnimatedStyle(() => ({ width: columnWidth.value }));

  const _renderDay = (index: number) => {
    const dayUnix = startUnix + index * SECONDS_IN_DAY;
    const dayByIndex = new Date(dayUnix * 1000);
    const weekDay = dayByIndex.getDay();
    const dayNumber = dayByIndex.getDate();
    const currentLocale =
      locales.current[locale] || (locales.current.en as LocaleConfigs);
    const weekDayStr = currentLocale.weekDayShort[weekDay];
    const isToday = currentDateStart === dayUnix;

    const onPress = () => {
      const dateStr = parseUnixToDateStr(dayUnix);
      onPressDayNumber!(dateStr);
    };

    return (
      <Animated.View key={`col_${index}`} style={animView}>
        <Text style={styles.weekDayText}>{weekDayStr}</Text>
        <TouchableOpacity
          disabled={!onPressDayNumber}
          activeOpacity={0.6}
          onPress={onPress}
        >
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
      </Animated.View>
    );
  };

  const _renderEvents = (index: number) => {
    const dayUnix = startUnix + index * SECONDS_IN_DAY;
    const events = allDayEvents[dayUnix] || [];
    let children: React.ReactElement[] = [];
    for (let i = 0; i < events.length; i++) {
      if (i > 3) {
        break;
      }

      if (i === 2 && events.length > 3) {
        children.push(
          <View
            key="extra"
            style={[
              styles.extra,
              { height: allDayEventHeight },
              isRTL ? styles.alignEnd : styles.alignStart,
            ]}
          >
            <Text style={styles.extraText}>+{events.length - 2}</Text>
          </View>
        );
        break;
      }

      children.push(
        <AllDayEvent
          key={events[i]!.id}
          event={events[i]!}
          rightEdgeSpacing={rightEdgeSpacing}
          overlapEventsSpacing={overlapEventsSpacing}
          eventHeight={allDayEventHeight}
          onPressEvent={onPressEvent}
          onLongPressEvent={onLongPressEvent}
          isRTL={isRTL}
          width={columnWidth}
        />
      );
    }

    return (
      <Animated.View key={`events_${index}`} style={animView}>
        {children}
      </Animated.View>
    );
  };

  const allDayStyle = useAnimatedStyle(() => ({ height: allDayHeight.value }));

  return (
    <View style={[{ width: timelineWidth }]}>
      <View
        style={[
          isRTL ? styles.rowReverse : styles.row,
          {
            height: dayBarHeight,
            backgroundColor: dayBar.backgroundColor,
          },
        ]}
      >
        {times(numberOfColumns, _renderDay)}
      </View>
      <Animated.View
        style={[isRTL ? styles.rowReverse : styles.row, allDayStyle]}
      >
        {times(numberOfColumns, _renderEvents)}
      </Animated.View>
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
  extra: { padding: 2 },
  extraText: { fontSize: 10 },
  alignStart: { alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
});
