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
    end,
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

  // 모르겟듬
  useEffect(() => {
    if (useHaptic) {
      triggerHaptic();
    }
  }, [useHaptic]);

  // 드래그 박스 등장 애니메이션
  useEffect(() => {
    requestAnimationFrame(() => {
      // 꾹 눌렀을 때 드래그 박스가 가로 크기만큼 늘어나는 애니메이션 (일간)
      eventWidth.value = withTiming(columnWidth - rightEdgeSpacing, {
        duration: 100,
      });
      // 꾹 눌렀을 때 드래그 박스 전체가 오른쪽에서 왼쪽으로 슬라이드 하면서 나타나는 애니메이션 (주간)
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
    // 주석 처리하면 한번 페이지 넘어가기 시작하면 계속 넘어감
    if (timeoutRef.current && x > hourWidth && x < timelineWidth - 25) {
      clearInterval(timeoutRef.current);
      timeoutRef.current = null;
    }
    // 드래그 박스 왼쪽에 두면 이전 페이지로 넘어가기
    if (x <= hourWidth) {
      if (isScrolling.current || timeoutRef.current) {
        return;
      }
      timeoutRef.current = setInterval(() => {
        goToPrevPage(true);
      }, navigateDelay);
    }
    // 드래그 박스 오른쪽에 두면 다음 페이지로 넘어가기
    if (x >= timelineWidth - 25) {
      if (isScrolling.current || timeoutRef.current) {
        return;
      }
      timeoutRef.current = setInterval(() => {
        goToNextPage(true);
      }, navigateDelay);
    }

    // y축 방향으로 얼만큼 이동했는지 (절댓값)
    const scrollTargetDiff = Math.abs(startOffsetY.value - offsetY.value);
    // 너무 적게 이동했으면 스크롤할 필요 없다
    const scrollInProgress = scrollTargetDiff > 3;
    if (scrollInProgress) {
      return;
    }

    // 드래그 박스 위로 올렸을 때 달력 화면 위로 스크롤 (startY < XX 값을 조절해서 조정가능 -> 원래는 3)
    const startY = y + timeIntervalHeight.value;
    if (startY < 30 && offsetY.value > 0 && type === 'swipe_up') {
      const targetOffset = Math.max(
        0,
        offsetY.value - timeIntervalHeight.value * 3
      );
      startOffsetY.value = targetOffset;
      goToOffsetY(targetOffset);
    }

    // 드래그 박스 아래로 내렸을 때 달력 화면 아래로 스크롤 (scrollPosition > pageSize - XX값을 조절해서 조정가능 -> 원래는 3)
    const pageSize = timelineLayoutRef.current.height;
    const scrollPosition = y + eventHeight.value - timeIntervalHeight.value;
    if (scrollPosition > pageSize - 30 && type === 'swipe_down') {
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

  // 드래그 박스 자체 움직이기
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
      /**
       * event.leftByIndex! : 시간 표시로부터 몇 픽셀 떨어져있는 지 (0,50,100,150..)
       * initIndex : 몇번째 요일에 있는지 (0,1,2,3,4..)
       * minRounded : 왼쪽으로 얼마만큼 갈 수 있는 지 (0,-1,-2,-3,..)
       * maxRounded : 오른쪽으로 얼만큼 갈 수 있는 지 (7,6,5,4,...)
       * nextTranslateX : 다음에 블럭의 x좌표가 될 곳 (픽셀 기준)
       * xToIndex : 다음 블럭의 index 번호
       */
      
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

      
      /**   ------ 드래그 박스가 00:00 위로 && 24:00 아래로 가지 못하게 하는 코드 ------
       * tempRoundedHour : 실제 드래그 박스가 손을 따라 움직인 곳에서의 시간 시간 (start에 상관없이 0시를 기준으로 함)
       * roundedHour : 드래그 박스가 달력 밖(위/아래)로 삐져 나가지 않게 튜닝된 시작 시간
       * 
       * 튜닝된 시작 시간을 얻기 위한 계산
       * 1. roundTo에서 계산된 시작 시간이 0보다 작다면 0을 반환 (roundTo)
       * 2. 현재 드래그 박스의 소요 시간(eventDuration)을 구하고, end-start에서 소요 시간만큼 위로 떨어진 "최대 시작 시간"(end - eventDuration) 구함
       * 3. 만약 tempRoundedHour가 최대 시작보다 크다면 최대 시작 시간으로, 작다면 tempRoundedHour 그대로 사용
       * 
       * newTopPosition : 최종적으로 이동하여 표시될 드래그 박스의 시작 위치 (픽셀 단위)
       */
      const tempRoundedHour = roundTo(originalTime, dragStep, 'up');
      const eventDuration = eventHeight.value / heightByTimeInterval.value;
      const roundedHour = tempRoundedHour > end - start - eventDuration ? end - start - eventDuration : tempRoundedHour;
      const newTopPosition = roundedHour * heightByTimeInterval.value + spaceFromTop;

      const isSameX = translateX.value === roundedTranslateX;
      const isSameY = eventTop.value === newTopPosition;
      if (!isSameX || !isSameY) {
        // 드래그 박스 좌우로 움직이는 애니메이션
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

  // 핸들러 움직이기
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


      /** -------- 핸들러가 캘린더 바깥으로(아래)가지 못하게 하는 코드 --------
       * roundedHeight : 기준 점에서 부터 핸들러 움직임에 따른 드래그 박스의 높이 (10, 60, 70, -10 음수 가능)
       * tempClampedHeight : 음수 불가능 최솟값(heightOfTenMinutes) 존재
       * 
       * 드래그 박스의 시작 위치 + 드래그 박스 높이 => 값이 end의 위치 보다 크면 안 됨 
       * (eventTop.value + clampedHeight < (end - start) * heightByTimeInterval.value + spaceFromTop)
       * 
       * maxClampedHeight : 현재 드래그 박스의 시작 위치에서부터 최대로 늘어날 수 있는 드래그 박스 높이 (달력 끝 - 드래그 박스 시작점)
       * clampedHeight : 최종 드래그 박스의 높이, 최댓값(maxClampedHeight) 존재
       */
      const roundedHeight =
        Math.ceil(nextHeight / heightOfTenMinutes) * heightOfTenMinutes;
      const tempClampedHeight = Math.max(roundedHeight, heightOfTenMinutes);
      const maxClampedHeight = (end - start) * heightByTimeInterval.value - eventTop.value + spaceFromTop;
      const clampedHeight = Math.min(tempClampedHeight, maxClampedHeight);
      // const clampedHeight = Math.max(roundedHeight, heightOfTenMinutes);     // 원래
    
      const isSameHeight = eventHeight.value === clampedHeight;
      if (!isSameHeight) {
        eventHeight.value = clampedHeight;
        if (useHaptic) {
          runOnJS(triggerHaptic)();
        }
      }

      // 핸들러 아래로 내리면 아래로 스크롤 되기.. 실패
      // y축 방향으로 얼만큼 이동했는지 (절댓값)
      /*
      const scrollTargetDiff = Math.abs(startOffsetY.value - offsetY.value);
      // 너무 적게 이동했으면 스크롤할 필요 없다
      const scrollInProgress = scrollTargetDiff > 3;
      if (scrollInProgress) {
        return;
      }
      const nextTranslateY = startXY.value.y + e.translationY + eventHeight.value;
      // 드래그 박스 아래로 내렸을 때 달력 화면 아래로 스크롤 (scrollPosition > pageSize - XX값을 조절해서 조정가능 -> 원래는 3)
      const pageSize = timelineLayoutRef.current.height;
      const scrollPosition = nextTranslateY - timeIntervalHeight.value;
      const isSwipeDown = nextTranslateY > startXY.value.y;
      if (scrollPosition > pageSize && isSwipeDown) {
        const spacingInBottomAndTop = spaceFromTop + spaceFromBottom;
        const timelineHeight = totalHours * timeIntervalHeight.value;
        const maxOffsetY = timelineHeight + spacingInBottomAndTop - pageSize;
        const nextOffset = offsetY.value + timeIntervalHeight.value * 3;
        const targetOffset = Math.min(maxOffsetY, nextOffset);
        startOffsetY.value = targetOffset;
        goToOffsetY(targetOffset);
      }
      */
      // const nextTranslateY = startXY.value.y + e.translationY;
      // runOnJS(_handleScroll)({
      //   x: e.absoluteX,
      //   y: nextTranslateY,
      //   type: nextTranslateY > startXY.value.y ? 'swipe_down' : 'swipe_up',
      // });
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
      ).format("HH:mm");
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
