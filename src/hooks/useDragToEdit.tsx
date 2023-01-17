import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Gesture,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTimelineCalendarContext } from '../context/TimelineProvider';
import type { PackedEvent } from '../types';
import { roundTo, triggerHaptic } from '../utils';
import useTimelineScroll from './useTimelineScroll';

interface useDragToEdit {
  onDragBeforeEditEnd?: (event: PackedEvent) => void;
}

const useDragToEdit = ({ onDragBeforeEditEnd }: useDragToEdit) => {
  const {
    timeIntervalHeight,
    spaceFromTop,
    spaceFromBottom,
    offsetY,
    timelineLayoutRef,
    isScrolling,
    currentIndex,
    pages,
    hourWidth,
    columnWidth,
    timelineWidth,
    totalHours,
    dragStep,
    viewMode,
    isDraggingEdit,
    useHaptic,
    tzOffset,
    start,
    navigateDelay,
    rightEdgeSpacing,
  } = useTimelineCalendarContext();
  const { goToNextPage, goToPrevPage, goToOffsetY } = useTimelineScroll();

  const eventDraggingRef = useRef<PackedEvent | null>(null);
  const [eventDragging, setEventDragging] = useState<PackedEvent | null>(null);

  const dragEditXPosition = useSharedValue(0);
  const dragEditYPosition = useSharedValue(0);
  const startOffsetY = useRef(0);

  const timeoutAnim = useSharedValue<NodeJS.Timeout | null>(null);
  const _handleScroll = (x: number) => {
    if (timeoutAnim.value && x > hourWidth && x < timelineWidth - 25) {
      clearInterval(timeoutAnim.value);
      timeoutAnim.value = null;
    }
    if (x <= hourWidth) {
      if (isScrolling.current || timeoutAnim.value) {
        return;
      }
      timeoutAnim.value = setInterval(() => {
        goToPrevPage(true);
      }, navigateDelay);
    }
    if (x >= timelineWidth - 25) {
      if (isScrolling.current || timeoutAnim.value) {
        return;
      }
      timeoutAnim.value = setInterval(() => {
        goToNextPage(true);
      }, navigateDelay);
    }

    const scrollTargetDiff = Math.abs(startOffsetY.current - offsetY.value);
    const scrollInProgress = scrollTargetDiff > 3;
    if (scrollInProgress) {
      return;
    }

    const startY = dragEditYPosition.value - spaceFromTop;
    if (startY < 3 && offsetY.value > 0) {
      const targetOffset = Math.max(
        0,
        offsetY.value - timeIntervalHeight.value * 3
      );
      startOffsetY.current = targetOffset;
      goToOffsetY(targetOffset);
    }

    const eventHeight = eventDraggingRef.current?.height ?? 0;
    const yInPage = dragEditYPosition.value + eventHeight + spaceFromTop;
    const pageSize = timelineLayoutRef.current.height;
    const currentY = startY + offsetY.value + eventHeight;
    const timelineHeight = totalHours * timeIntervalHeight.value;
    if (yInPage > pageSize - 10 && currentY < timelineHeight) {
      const spacingInBottomAndTop = spaceFromTop + spaceFromBottom;
      const maxOffsetY = timelineHeight + spacingInBottomAndTop - pageSize;
      const nextOffset = offsetY.value + timeIntervalHeight.value * 3;
      const targetOffset = Math.min(maxOffsetY, nextOffset);
      startOffsetY.current = targetOffset;
      goToOffsetY(targetOffset);
    }
  };

  const calcPosition = useCallback(
    (xPosition: number, yPosition: number, nearestMinutes?: number) => {
      'worklet';
      const positionIndex = Math.floor(xPosition / columnWidth);
      const calcX = positionIndex * columnWidth + hourWidth;
      const clampedX = Math.max(hourWidth, calcX);
      let originalTime =
        (yPosition + offsetY.value - spaceFromTop) / timeIntervalHeight.value;
      if (nearestMinutes) {
        originalTime = roundTo(originalTime, nearestMinutes, 'up');
      }
      const yByTime = originalTime * timeIntervalHeight.value;
      const currentY = yByTime - offsetY.value + spaceFromTop;

      const maxY =
        (totalHours - dragStep / 60) * timeIntervalHeight.value -
        offsetY.value +
        spaceFromTop;
      const clampedY = Math.min(currentY, maxY);
      return {
        x: clampedX,
        y: clampedY,
      };
    },
    [
      columnWidth,
      dragStep,
      hourWidth,
      offsetY,
      spaceFromTop,
      timeIntervalHeight,
      totalHours,
    ]
  );

  const startY = useSharedValue(0);
  const gestureEvent = useSharedValue<
    GestureUpdateEvent<PanGestureHandlerEventPayload> | undefined
  >(undefined);
  useAnimatedReaction(
    () => gestureEvent.value,
    (event) => {
      if (!event) {
        return;
      }

      const { x, y } = calcPosition(
        event.x - hourWidth,
        event.y - startY.value + spaceFromTop,
        dragStep
      );
      if (dragEditXPosition.value !== x || dragEditYPosition.value !== y) {
        dragEditXPosition.value = withTiming(x, {
          duration: 100,
          easing: Easing.linear,
        });
        dragEditYPosition.value = y;
        if (useHaptic) {
          runOnJS(triggerHaptic)();
        }
      }
      runOnJS(_handleScroll)(event.x);
    }
  );

  const isTouchesUp = useSharedValue(false);
  const yByStartHour = useSharedValue(0);
  const dragEditGesture = Gesture.Pan()
    .minPointers(1)
    .manualActivation(true)
    .onTouchesDown((event, stateManager) => {
      if (event.numberOfTouches > 1) {
        stateManager.fail();
        isDraggingEdit.value = false;
      }
    })
    .onTouchesMove((_, stateManager) => {
      if (isDraggingEdit.value) {
        stateManager.activate();
      }
    })
    .onStart((e) => {
      startY.value = e.y - yByStartHour.value;
    })
    .onUpdate((event) => {
      if (event.numberOfPointers > 1) {
        return;
      }
      gestureEvent.value = event;
    })
    .onTouchesUp(() => {
      if (isDraggingEdit.value) {
        isTouchesUp.value = true;
      }
    });

  const _onEnd = (event: { x: number; y: number }) => {
    if (!eventDraggingRef.current) {
      isDraggingEdit.value = false;
      return;
    }
    const time = event.y / timeIntervalHeight.value;
    const positionIndex = Math.floor((event.x - hourWidth) / columnWidth);
    const startDate = pages[viewMode].data[currentIndex.value];
    const eventStart = dayjs(startDate)
      .add(positionIndex, 'd')
      .add(time, 'h')
      .add(start, 'h')
      .subtract(tzOffset, 'm');
    const newEvent = {
      ...eventDraggingRef.current,
      left: 0,
      leftByIndex: positionIndex * columnWidth,
      top: event.y,
      width: columnWidth - rightEdgeSpacing,
      start: eventStart.toISOString(),
      end: eventStart
        .clone()
        .add(eventDraggingRef.current.duration, 'h')
        .toISOString(),
    };
    onDragBeforeEditEnd?.(newEvent);
    isDraggingEdit.value = false;
  };

  useAnimatedReaction(
    () => isTouchesUp.value,
    (touchesUp) => {
      if (touchesUp) {
        runOnJS(_onEnd)({
          x: dragEditXPosition.value,
          y: dragEditYPosition.value + offsetY.value - spaceFromTop,
        });
        isTouchesUp.value = false;
      }
    }
  );

  useAnimatedReaction(
    () => isDraggingEdit.value,
    (active, prev) => {
      if (prev === active || active) {
        return;
      }
      gestureEvent.value = undefined;
      runOnJS(setEventDragging)(null);
    }
  );

  useEffect(() => {
    if (!eventDragging && timeoutAnim.value) {
      clearInterval(timeoutAnim.value);
      timeoutAnim.value = null;
    }
  }, [eventDragging, timeoutAnim]);

  const dragToEdit = useCallback(
    (event: PackedEvent) => {
      eventDraggingRef.current = event;
      isDraggingEdit.value = true;
      yByStartHour.value =
        event.startHour * timeIntervalHeight.value - offsetY.value;
      const initX = event.leftByIndex || 0;
      const initY = event.top || 0;
      const posX = initX;
      const posY = initY - offsetY.value + spaceFromTop;
      const { x, y } = calcPosition(posX, posY);
      dragEditXPosition.value = x;
      dragEditYPosition.value = y;
      startOffsetY.current = offsetY.value;
      setEventDragging(event);
      if (useHaptic) {
        triggerHaptic();
      }
    },
    [
      isDraggingEdit,
      yByStartHour,
      timeIntervalHeight,
      offsetY,
      spaceFromTop,
      calcPosition,
      dragEditXPosition,
      dragEditYPosition,
      useHaptic,
    ]
  );

  return {
    dragEditGesture,
    dragEditXPosition,
    dragEditYPosition,
    eventDragging,
    dragToEdit,
  };
};

export default useDragToEdit;
