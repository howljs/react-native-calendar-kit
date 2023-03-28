import moment from 'moment-timezone';
import React, { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { COLUMNS, DEFAULT_PROPS } from '../../constants';
import { useTimelineCalendarContext } from '../../context/TimelineProvider';
import useTimelineScroll from '../../hooks/useTimelineScroll';
import type { PackedEvent, ThemeProperties } from '../../types';
import { roundTo, triggerHaptic } from '../../utils';

interface DragEditItemProps {
  selectedEvent: PackedEvent;
  onEndDragSelectedEvent?: (event: PackedEvent) => void;
  renderEventContent?: (
    event: PackedEvent,
    heightByTimeInterval: SharedValue<number>
  ) => JSX.Element;
  isEnabled?: boolean;
  EditIndicatorComponent?: JSX.Element;
}

const EVENT_DEFAULT_COLOR = '#FFFFFF';

const DragEditItem = ({
  selectedEvent,
  onEndDragSelectedEvent,
  renderEventContent,
  isEnabled = true,
  EditIndicatorComponent,
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
    heightByTimeInterval,
    viewMode,
    spaceFromBottom,
    timelineLayoutRef,
    totalHours,
    theme,
    hourFormat,
    useHaptic,
    tzOffset,
    start,
    navigateDelay,
  } = useTimelineCalendarContext();
  const { goToNextPage, goToPrevPage, goToOffsetY } = useTimelineScroll();

  const event = useRef(selectedEvent).current;
  const leftWithHourColumn = event.leftByIndex! + hourWidth;
  const defaultTopPosition = event.top + spaceFromTop;

  const eventWidth = useSharedValue(event.width);
  const eventLeft = useSharedValue(leftWithHourColumn + event.left);
  const currentHour = useSharedValue(
    event.top / heightByTimeInterval.value + start
  );

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

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const _handleScroll = ({
    x,
    y,
    type,
  }: {
    x: number;
    y: number;
    type: 'swipe_down' | 'swipe_up';
  }) => {
    if (timeoutRef.current && x > hourWidth && x < timelineWidth - 25) {
      clearInterval(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (x <= hourWidth) {
      if (isScrolling.current || timeoutRef.current) {
        return;
      }
      timeoutRef.current = setInterval(() => {
        goToPrevPage(true);
      }, navigateDelay);
    }
    if (x >= timelineWidth - 25) {
      if (isScrolling.current || timeoutRef.current) {
        return;
      }
      timeoutRef.current = setInterval(() => {
        goToNextPage(true);
      }, navigateDelay);
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
    const currentDateMoment = moment
      .tz(startDate, tzOffset)
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
        .add(eventHeight.value / heightByTimeInterval.value, 'h')
        .toISOString(),
    };

    if (onEndDragSelectedEvent) {
      onEndDragSelectedEvent(newEvent);
    }
  };

  const clearCurrentInterval = () => {
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const dragPositionGesture = Gesture.Pan()
    .enabled(isEnabled)
    .runOnJS(true)
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
      const originalTime = originalY / heightByTimeInterval.value;
      const roundedHour = roundTo(originalTime, dragStep, 'up');
      const newTopPosition =
        roundedHour * heightByTimeInterval.value + spaceFromTop;
      const isSameX = translateX.value === roundedTranslateX;
      const isSameY = eventTop.value === newTopPosition;
      if (!isSameX || !isSameY) {
        translateX.value = withTiming(roundedTranslateX, {
          duration: 100,
          easing: Easing.linear,
        });
        eventTop.value = newTopPosition;
        currentHour.value = roundedHour + start;
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
    })
    .onTouchesUp(() => {
      runOnJS(clearCurrentInterval)();
    });

  const startHeight = useSharedValue(0);

  const dragDurationGesture = Gesture.Pan()
    .enabled(isEnabled)
    .runOnJS(true)
    .maxPointers(1)
    .onStart(() => {
      startOffsetY.value = offsetY.value;
      startHeight.value = eventHeight.value;
    })
    .onUpdate((e) => {
      const heightOfTenMinutes = (dragStep / 60) * heightByTimeInterval.value;
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
    })
    .onTouchesUp(() => {
      runOnJS(clearCurrentInterval)();
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
            ? renderEventContent(event, heightByTimeInterval)
            : _renderEventContent()}
          <GestureDetector gesture={dragDurationGesture}>
            <View style={styles.indicatorContainer}>
              {EditIndicatorComponent ? (
                EditIndicatorComponent
              ) : (
                <View style={styles.indicator}>
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
              )}
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
      newTime = moment(
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
      <Text
        allowFontScaling={theme.allowFontScaling}
        style={[styles.hourText, theme.dragHourText]}
      >
        {time}
      </Text>
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
  indicatorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  indicator: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 24,
  },
  title: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    fontSize: 10,
    color: DEFAULT_PROPS.BLACK_COLOR,
  },
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
