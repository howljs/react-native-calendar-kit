import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import {
  Gesture,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTimelineCalendarContext } from '../context/TimelineProvider';
import { triggerHaptic } from '../utils';
import useTimelineScroll from './useTimelineScroll';

interface useDragCreateGesture {
  onDragCreateEnd?: (data: { start: string; end: string }) => void;
}

const useDragCreateGesture = ({ onDragCreateEnd }: useDragCreateGesture) => {
  const {
    timeIntervalHeight,
    spaceFromTop,
    spaceFromBottom,
    offsetY,
    timelineLayoutRef,
    isScrolling,
    currentIndex,
    minDate,
    maxDate,
    pages,
    hourWidth,
    columnWidth,
    timelineWidth,
    totalHours,
    dragCreateInterval,
    dragStep,
    viewMode,
    isDragCreateActive,
    useHaptic,
  } = useTimelineCalendarContext();
  const { goToNextPage, goToPrevPage, goToOffsetY } = useTimelineScroll();

  const [isDraggingCreate, setIsDraggingCreate] = useState(false);

  const currentHour = useSharedValue(0);
  const dragXPosition = useSharedValue(0);
  const dragYPosition = useSharedValue(0);
  const startOffsetY = useRef(0);

  const calcPosition = (
    xPosition: number,
    yPosition: number,
    nearestMinutes: number
  ) => {
    'worklet';
    const positionIndex = Math.floor((xPosition - hourWidth) / columnWidth);
    const calcX = positionIndex * columnWidth;

    const startY = yPosition + offsetY.value - spaceFromTop;
    const subtractHour = (dragCreateInterval / 60) * timeIntervalHeight.value;
    const originalTime = (startY - subtractHour) / timeIntervalHeight.value;
    const rHours = Math.floor(originalTime);
    const minutes = (originalTime - rHours) * 60;
    const rMinutes = Math.round(minutes);
    const extraPos = nearestMinutes - (rMinutes % nearestMinutes);
    const roundedHour = (rMinutes + extraPos + rHours * 60) / 60;
    const calcY = roundedHour * timeIntervalHeight.value;
    currentHour.value = roundedHour;

    return {
      x: Math.max(0, calcX),
      y: calcY + spaceFromTop - offsetY.value,
    };
  };

  const _handleScroll = (
    event: GestureUpdateEvent<PanGestureHandlerEventPayload>
  ) => {
    const SPACE = 25;
    if (event.x < SPACE) {
      if (isScrolling.current) {
        return;
      }
      goToPrevPage(true);
    }
    if (event.x > timelineWidth - SPACE) {
      if (isScrolling.current) {
        return;
      }
      goToNextPage(true);
    }

    const scrollTargetDiff = Math.abs(startOffsetY.current - offsetY.value);
    const scrollInProgress = scrollTargetDiff > 3;
    if (scrollInProgress) {
      return;
    }

    const startY = dragYPosition.value - spaceFromTop;
    if (startY < 3 && offsetY.value > 0) {
      const targetOffset = Math.max(
        0,
        offsetY.value - timeIntervalHeight.value * 3
      );
      startOffsetY.current = targetOffset;
      goToOffsetY(targetOffset);
    }

    const subtractHour = (dragCreateInterval / 60) * timeIntervalHeight.value;
    const yInPage = dragYPosition.value + subtractHour + spaceFromTop;
    const pageSize = timelineLayoutRef.current.height;
    const currentY = startY + offsetY.value + subtractHour;
    const timelineHeight = totalHours * timeIntervalHeight.value;
    if (yInPage > pageSize - 3 && currentY < timelineHeight) {
      const spacingInBottomAndTop = spaceFromTop + spaceFromBottom;
      const maxOffsetY = timelineHeight + spacingInBottomAndTop - pageSize;
      const nextOffset = offsetY.value + timeIntervalHeight.value * 3;
      const targetOffset = Math.min(maxOffsetY, nextOffset);
      startOffsetY.current = targetOffset;
      goToOffsetY(targetOffset);
    }
  };

  const _onEnd = (event: { x: number; y: number }) => {
    const time = event.y / timeIntervalHeight.value;
    const positionIndex = Math.floor(event.x / columnWidth);
    const startDate = pages[viewMode].data[currentIndex.value];
    const eventStart = dayjs(startDate).add(positionIndex, 'd').add(time, 'h');

    const isBeforeMinDate = eventStart.isBefore(dayjs(minDate), 'd');
    const isAfterMaxDate = eventStart.isAfter(dayjs(maxDate), 'd');
    if (isBeforeMinDate || isAfterMaxDate) {
      return;
    }

    const eventEnd = eventStart.clone().add(dragCreateInterval, 'm');
    onDragCreateEnd?.({
      start: eventStart.toISOString(),
      end: eventEnd.toISOString(),
    });
  };

  const dragCreateGesture = Gesture.Pan()
    .minPointers(1)
    .manualActivation(true)
    .onTouchesDown((event, stateManager) => {
      if (event.numberOfTouches > 1) {
        stateManager.fail();
        isDragCreateActive.value = false;
      }
    })
    .onTouchesMove((_e, stateManager) => {
      if (isDragCreateActive.value) {
        stateManager.activate();
      }
    })
    .onUpdate((event) => {
      if (event.numberOfPointers > 1) {
        return;
      }
      const { x, y } = calcPosition(event.x, event.y, dragStep);
      if (dragXPosition.value !== x || dragYPosition.value !== y) {
        dragXPosition.value = withTiming(x, { duration: 100 });
        dragYPosition.value = y;
        if (useHaptic) {
          runOnJS(triggerHaptic)();
        }
      }

      runOnJS(_handleScroll)(event);
    })
    .onTouchesUp(() => {
      if (isDragCreateActive.value) {
        runOnJS(_onEnd)({
          x: dragXPosition.value,
          y: dragYPosition.value + offsetY.value - spaceFromTop,
        });
        isDragCreateActive.value = false;
      }
    });

  useAnimatedReaction(
    () => isDragCreateActive.value,
    (active) => {
      runOnJS(setIsDraggingCreate)(active);
    }
  );

  const onLongPress = (e: GestureResponderEvent) => {
    isDragCreateActive.value = true;
    const posX = e.nativeEvent.locationX + hourWidth;
    const posY = e.nativeEvent.locationY + spaceFromTop - offsetY.value;
    const { x, y } = calcPosition(posX, posY, dragStep);
    dragXPosition.value = x;
    dragYPosition.value = y;
    startOffsetY.current = offsetY.value;
    if (useHaptic) {
      triggerHaptic();
    }
  };

  return {
    dragCreateGesture,
    dragXPosition,
    dragYPosition,
    isDraggingCreate,
    currentHour,
    onLongPress,
  };
};

export default useDragCreateGesture;
