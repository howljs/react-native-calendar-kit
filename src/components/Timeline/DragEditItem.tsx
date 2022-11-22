import dayjs from 'dayjs';
import React, { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  SharedValue,
} from 'react-native-reanimated';
import { COLUMNS, DEFAULT_PROPS } from '../../constants';
import { useTimelineCalendarContext } from '../../context/TimelineProvider';
import useTimelineScroll from '../../hooks/useTimelineScroll';
import type { PackedEvent, ThemeProperties } from '../../types';
import { triggerHaptic } from '../../utils';

interface DragEditItemProps {
  selectedEvent: PackedEvent;
  onEndDragSelectedEvent?: (event: PackedEvent) => void;
  renderEventContent?: (
    event: PackedEvent,
    timeIntervalHeight: SharedValue<number>
  ) => JSX.Element;
  isEnabled?: boolean;
}

const EVENT_DEFAULT_COLOR = '#FFFFFF';

const DragEditItem = ({
  selectedEvent,
  onEndDragSelectedEvent,
  renderEventContent,
  isEnabled = true,
}: DragEditItemProps) => {
  const {
    columnWidth,
    hourWidth,
    offsetY,
    dragStep,
    pages,
    currentIndex,
    isScrolling,
    timelineWidth,
    rightEdgeSpacing,
    spaceFromTop,
    timeIntervalHeight,
    viewMode,
    spaceFromBottom,
    timelineLayoutRef,
    totalHours,
    theme,
    hourFormat,
    useHaptic,
  } = useTimelineCalendarContext();
  const { goToNextPage, goToPrevPage, goToOffsetY } = useTimelineScroll();

  const event = useRef(selectedEvent).current;
  const leftWithHourColumn = event.leftByIndex! + hourWidth;
  const defaultTopPosition = event.top + spaceFromTop;

  const eventWidth = useSharedValue(event.width);
  const eventLeft = useSharedValue(leftWithHourColumn + event.left);
  const currentHour = useSharedValue(event.top / timeIntervalHeight.value);

  const startOffsetY = useSharedValue(0);
  const startXY = useSharedValue({ x: 0, y: 0 });
  const translateX = useSharedValue(0);
  const eventTop = useSharedValue(defaultTopPosition);
  const eventHeight = useSharedValue<number>(event.height);

  useEffect(() => {
    if (useHaptic) {
      triggerHaptic();
    }
  }, [useHaptic]);

  useEffect(() => {
    requestAnimationFrame(() => {
      eventWidth.value = withTiming(columnWidth - rightEdgeSpacing, {
        duration: 100,
      });
      eventLeft.value = withTiming(leftWithHourColumn, {
        duration: 100,
      });
    });
  }, [
    columnWidth,
    eventLeft,
    eventWidth,
    leftWithHourColumn,
    rightEdgeSpacing,
  ]);

  const _handleScroll = ({
    x,
    y,
    type,
  }: {
    x: number;
    y: number;
    type: 'swipe_down' | 'swipe_up';
  }) => {
    const SPACE = 25;
    if (x < SPACE) {
      if (isScrolling.current) {
        return;
      }
      goToPrevPage(true);
    }
    if (x > timelineWidth - SPACE) {
      if (isScrolling.current) {
        return;
      }
      goToNextPage(true);
    }

    const scrollTargetDiff = Math.abs(startOffsetY.value - offsetY.value);
    const scrollInProgress = scrollTargetDiff > 3;
    if (scrollInProgress) {
      return;
    }
    const startY = y + timeIntervalHeight.value;
    if (startY < 3 && offsetY.value > 0 && type === 'swipe_up') {
      const targetOffset = Math.max(
        0,
        offsetY.value - timeIntervalHeight.value * 3
      );
      startOffsetY.value = targetOffset;
      goToOffsetY(targetOffset);
    }

    const pageSize = timelineLayoutRef.current.height;
    const scrollPosition = y + eventHeight.value - timeIntervalHeight.value;
    if (scrollPosition > pageSize - 3 && type === 'swipe_down') {
      const spacingInBottomAndTop = spaceFromTop + spaceFromBottom;
      const timelineHeight = totalHours * timeIntervalHeight.value;
      const maxOffsetY = timelineHeight + spacingInBottomAndTop - pageSize;
      const nextOffset = offsetY.value + timeIntervalHeight.value * 3;
      const targetOffset = Math.min(maxOffsetY, nextOffset);
      startOffsetY.value = targetOffset;
      goToOffsetY(targetOffset);
    }
  };

  const recalculateEvent = () => {
    const newLeftPosition = event.leftByIndex! + translateX.value;
    const dayIndex = Math.round(newLeftPosition / columnWidth);
    const startDate = pages[viewMode].data[currentIndex.value];
    const currentDateMoment = dayjs(startDate)
      .add(dayIndex, 'd')
      .add(currentHour.value, 'h');

    const newEvent = {
      ...selectedEvent,
      left: newLeftPosition,
      top: eventTop.value,
      height: eventHeight.value,
      start: currentDateMoment.toISOString(),
      end: currentDateMoment
        .clone()
        .add(eventHeight.value / timeIntervalHeight.value, 'h')
        .toISOString(),
    };

    if (onEndDragSelectedEvent) {
      onEndDragSelectedEvent(newEvent);
    }
  };

  const dragPositionGesture = Gesture.Pan()
    .enabled(isEnabled)
    .maxPointers(1)
    .onStart(() => {
      startOffsetY.value = offsetY.value;
      startXY.value = {
        x: translateX.value,
        y: eventTop.value - offsetY.value,
      };
    })
    .onUpdate(({ translationX, translationY, absoluteX }) => {
      const initIndex = event.leftByIndex! / columnWidth;
      const maxIndex = COLUMNS[viewMode] - 1;
      const minRounded = -initIndex;
      const maxRounded = maxIndex - initIndex;
      const nextTranslateX = startXY.value.x + translationX;
      const xToIndex = Math.round(nextTranslateX / columnWidth);
      const clampIndex = Math.min(Math.max(minRounded, xToIndex), maxRounded);
      const roundedTranslateX = clampIndex * columnWidth;

      const nextTranslateY = startXY.value.y + translationY;
      const offset = offsetY.value - spaceFromTop;
      const originalY = startXY.value.y + offset + translationY;
      const originalTime = originalY / timeIntervalHeight.value;
      const rHours = Math.floor(originalTime);
      const minutes = (originalTime - rHours) * 60;
      const rMinutes = Math.round(minutes);
      const extraPos = dragStep - (rMinutes % dragStep);
      const roundedHour = (rMinutes + extraPos + rHours * 60) / 60;
      const newTopPosition =
        roundedHour * timeIntervalHeight.value + spaceFromTop;
      const isSameX = translateX.value === roundedTranslateX;
      const isSameY = eventTop.value === newTopPosition;
      if (!isSameX || !isSameY) {
        translateX.value = withTiming(roundedTranslateX, {
          duration: 100,
        });
        eventTop.value = newTopPosition;
        currentHour.value = roundedHour;
        if (useHaptic) {
          runOnJS(triggerHaptic)();
        }
      }
      runOnJS(_handleScroll)({
        x: absoluteX,
        y: nextTranslateY,
        type: nextTranslateY > startXY.value.y ? 'swipe_down' : 'swipe_up',
      });
    })
    .onEnd(() => {
      runOnJS(recalculateEvent)();
    });

  const startHeight = useSharedValue(0);

  const dragDurationGesture = Gesture.Pan()
    .enabled(isEnabled)
    .maxPointers(1)
    .onStart(() => {
      startOffsetY.value = offsetY.value;
      startHeight.value = eventHeight.value;
    })
    .onUpdate((e) => {
      const heightOfTenMinutes = (dragStep / 60) * timeIntervalHeight.value;
      const nextHeight = startHeight.value + e.translationY;
      const roundedHeight =
        Math.ceil(nextHeight / heightOfTenMinutes) * heightOfTenMinutes;
      const clampedHeight = Math.max(roundedHeight, heightOfTenMinutes);
      const isSameHeight = eventHeight.value === clampedHeight;
      if (!isSameHeight) {
        eventHeight.value = clampedHeight;
        if (useHaptic) {
          runOnJS(triggerHaptic)();
        }
      }
    })
    .onEnd(() => {
      runOnJS(recalculateEvent)();
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: eventHeight.value,
      width: eventWidth.value,
      left: eventLeft.value,
      top: eventTop.value,
      transform: [{ translateX: translateX.value }],
    };
  }, []);

  const _renderEventContent = () => {
    return <Text style={[styles.title, theme.eventTitle]}>{event.title}</Text>;
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <GestureDetector gesture={dragPositionGesture}>
        <Animated.View
          style={[
            styles.eventContainer,
            {
              backgroundColor: event.color ? event.color : EVENT_DEFAULT_COLOR,
              top: defaultTopPosition,
            },
            event.containerStyle,
            animatedStyle,
          ]}
        >
          {renderEventContent
            ? renderEventContent(event, timeIntervalHeight)
            : _renderEventContent()}
          <GestureDetector gesture={dragDurationGesture}>
            <View style={[styles.indicator, { width: columnWidth }]}>
              <View
                style={[
                  styles.indicatorLine,
                  theme.editIndicatorColor
                    ? { backgroundColor: theme.editIndicatorColor }
                    : undefined,
                ]}
              />
              <View
                style={[
                  styles.indicatorLine,
                  theme.editIndicatorColor
                    ? { backgroundColor: theme.editIndicatorColor }
                    : undefined,
                ]}
              />
            </View>
          </GestureDetector>
        </Animated.View>
      </GestureDetector>
      <AnimatedHour
        currentHour={currentHour}
        animatedTop={eventTop}
        top={defaultTopPosition}
        hourWidth={hourWidth}
        theme={theme}
        hourFormat={hourFormat}
      />
    </View>
  );
};

export default memo(DragEditItem);

interface AnimatedHourProps {
  currentHour: Animated.SharedValue<number>;
  animatedTop: Animated.SharedValue<number>;
  top: number;
  hourWidth: number;
  theme: ThemeProperties;
  hourFormat?: string;
}

const AnimatedHour = ({
  currentHour,
  animatedTop,
  top,
  hourWidth,
  theme,
  hourFormat,
}: AnimatedHourProps) => {
  const [time, setTime] = useState('');

  const _onChangedTime = (
    hourStr: string | number,
    minutesStr: string | number
  ) => {
    let newTime = `${hourStr}:${minutesStr}`;
    if (hourFormat) {
      newTime = dayjs(
        `1970/1/1 ${hourStr}:${minutesStr}`,
        'YYYY/M/D HH:mm'
      ).format(hourFormat);
    }
    setTime(newTime);
  };

  useAnimatedReaction(
    () => currentHour.value,
    (hour) => {
      let extra = 0;
      if (hour < 0) {
        extra = 24;
      } else if (hour >= 24) {
        extra = -24;
      }
      const convertedTime = hour + extra;
      const rHours = Math.floor(convertedTime);
      const minutes = (convertedTime - rHours) * 60;
      const rMinutes = Math.round(minutes);
      const offset = rHours < 0 ? 24 : 0;
      const hourStr = rHours + offset < 10 ? '0' + rHours : rHours + offset;
      const minutesStr = rMinutes < 10 ? '0' + rMinutes : rMinutes;
      runOnJS(_onChangedTime)(hourStr, minutesStr);
    }
  );

  const animatedTextStyles = useAnimatedStyle(() => {
    return { top: animatedTop.value - 6 };
  });

  return (
    <Animated.View
      style={[
        styles.hourContainer,
        {
          width: hourWidth - 8,
          top: top - 6,
        },
        theme.dragHourContainer,
        animatedTextStyles,
      ]}
    >
      <Text style={[styles.hourText, theme.dragHourText]}>{time}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  eventContainer: {
    position: 'absolute',
    borderRadius: 4,
    overflow: 'hidden',
  },
  badgeContainer: {
    padding: 2,
    borderRadius: 2,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  hourContainer: {
    position: 'absolute',
    borderColor: DEFAULT_PROPS.PRIMARY_COLOR,
    backgroundColor: DEFAULT_PROPS.WHITE_COLOR,
    borderWidth: 1,
    borderRadius: 4,
    top: -6,
    alignItems: 'center',
    left: 4,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  title: { paddingVertical: 4, paddingHorizontal: 2, fontSize: 10 },
  hourText: {
    color: DEFAULT_PROPS.PRIMARY_COLOR,
    fontSize: 10,
  },
  indicatorLine: {
    width: 12,
    height: 2,
    backgroundColor: '#000',
    marginBottom: 2,
  },
});
