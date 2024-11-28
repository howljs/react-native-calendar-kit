import {
  clampValues,
  forceUpdateZone,
  parseDateTime,
  roundMinutes,
  useActions,
  useTimezone,
} from '@calendar-kit/core';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedReaction, useSharedValue, withTiming } from 'react-native-reanimated';

import { MILLISECONDS_IN_MINUTE } from '../constants';
import { useCalendar } from '../context/CalendarContext';
import { useDragActions, useDragContext } from '../context/DragProvider';

const useDragToCreate = () => {
  const {
    offsetY,
    minuteHeight,
    spaceFromTop,
    start,
    columnWidthAnim,
    hourWidth,
    numberOfDays,
    verticalListRef,
    gridListRef,
  } = useCalendar();
  const { timeZone } = useTimezone();
  const {
    allowDragToCreate,
    dragStep,
    dragToCreateMode,
    defaultDuration,
    draggingStartMinutes,
    draggingDuration,
    draggingColumnIndex,
    initialDragData,
    roundedDragStartMinutes,
    roundedDragDuration,
    draggingMode,
    dragPosition,
    isDraggingToCreate,
    isDraggingAnim,
    extraMinutes,
  } = useDragContext();

  const { updateDraggingEvent } = useDragActions();
  const { onDragCreateEventStart, onDragCreateEventEnd } = useActions();

  const initialStartY = useSharedValue(0);
  const initialStartX = useSharedValue(0);

  const computeDragValues = (initialStart: number, newMinutes: number, step: number) => {
    'worklet';
    let newDraggingMode: 'top' | 'bottom' | undefined;
    let newDragStart = initialStart;
    let newRoundedDragStart = initialStart;
    let newDragDuration = step;
    let newRoundedDragDuration = step;

    if (newMinutes > initialStart + step) {
      newDraggingMode = 'bottom';
      newDragStart = initialStart;
      newDragDuration = newMinutes - initialStart;
      newRoundedDragDuration = roundMinutes(newMinutes, step) - initialStart;
    } else if (newMinutes < initialStart) {
      newDraggingMode = 'top';
      newDragStart = newMinutes;
      newRoundedDragStart = Math.floor(newMinutes / step) * step;
      newDragDuration = initialStart - newMinutes + step;
      newRoundedDragDuration = initialStart - newRoundedDragStart + step;
    }

    return {
      newDraggingMode,
      newDragStart,
      newRoundedDragStart,
      newDragDuration,
      newRoundedDragDuration,
    };
  };

  const updateDragStartPosition = (translationY: number, initialStart: number) => {
    'worklet';
    const initialY = (initialStart + extraMinutes.value) * minuteHeight.value;
    const newY = initialY + translationY;
    const newDragStart = Math.floor(newY / minuteHeight.value);
    const roundedDragStart = roundMinutes(newDragStart, dragStep, 'floor');
    draggingStartMinutes.value = newDragStart;
    roundedDragStartMinutes.value = roundedDragStart;
  };

  const gesture = Gesture.Pan()
    .blocksExternalGesture(verticalListRef, gridListRef as any)
    .enabled(allowDragToCreate)
    .manualActivation(true)
    .onBegin((event) => {
      initialStartX.value = event.x;
      initialStartY.value = event.translationY;
    })
    .onStart(() => {
      initialDragData.value = {
        startMinutes: draggingStartMinutes.value,
        columnIndex: draggingColumnIndex.value,
        duration: draggingDuration.value,
      };
    })
    .onUpdate(({ translationX, translationY, x, y }) => {
      dragPosition.value = { x, y };
      const initialStart = initialDragData.value?.startMinutes ?? 0;
      if (dragToCreateMode === 'duration') {
        const newMinutes =
          Math.floor((offsetY.value + y - spaceFromTop) / minuteHeight.value) + start;

        const {
          newDraggingMode,
          newDragStart,
          newRoundedDragStart,
          newDragDuration,
          newRoundedDragDuration,
        } = computeDragValues(initialStart, newMinutes, dragStep);

        draggingMode.value = newDraggingMode;
        draggingStartMinutes.value = newDragStart;
        draggingDuration.value = newDragDuration;
        roundedDragStartMinutes.value = newRoundedDragStart;
        roundedDragDuration.value = newRoundedDragDuration;
      } else {
        updateDragStartPosition(translationY, initialStart);
        const newX = initialStartX.value + translationX - hourWidth;
        const newDragDayIndex = Math.floor(newX / columnWidthAnim.value);
        const clampedDragDayIndex = clampValues(newDragDayIndex, 0, numberOfDays - 1);
        draggingColumnIndex.value = clampedDragDayIndex;
      }
    })
    .onEnd(() => {
      draggingStartMinutes.value = withTiming(roundedDragStartMinutes.value, {
        duration: 150,
      });
      draggingDuration.value = withTiming(roundedDragDuration.value, {
        duration: 150,
      });
    })
    .onTouchesMove((_event, state) => {
      if (isDraggingToCreate.value && isDraggingAnim.value) {
        state.activate();
      } else if (Platform.OS === 'ios') {
        state.fail();
      }
    })
    .onTouchesUp(() => {
      if (isDraggingToCreate.value && isDraggingAnim.value) {
        isDraggingAnim.value = false;
      }
    });

  const triggerDragCreateEvent = useCallback(
    (dateTime: string, posX: number) => {
      const startDateTime = parseDateTime(dateTime, { zone: timeZone });
      const startMinutes = startDateTime.hour * 60 + startDateTime.minute;
      dragPosition.value = {
        x: posX + hourWidth,
        y: startMinutes * minuteHeight.value,
      };
      const startUnix = parseDateTime(dateTime, { zone: 'utc' }).startOf('day').toMillis();
      const subMinutes = dragToCreateMode === 'date-time' ? defaultDuration / 2 : 0;
      const roundedMinutes = Math.floor((startMinutes - subMinutes) / dragStep) * dragStep;
      const roundedStartUnix = startUnix + roundedMinutes * MILLISECONDS_IN_MINUTE;
      const startDate = parseDateTime(roundedStartUnix, { zone: 'utc' });
      const startISO = startDate.toISO();
      const endISO = startDate.plus({ minutes: defaultDuration }).toISO();
      updateDraggingEvent({
        start: { dateTime: startISO },
        end: { dateTime: endISO },
      });
      if (onDragCreateEventStart) {
        onDragCreateEventStart({
          start: { dateTime: startISO },
          end: { dateTime: endISO },
        });
      }
      const roundedIndex = Math.floor(posX / columnWidthAnim.value);
      const clampedDragDayIndex = clampValues(roundedIndex, 0, numberOfDays - 1);
      isDraggingToCreate.value = true;
      draggingColumnIndex.value = clampedDragDayIndex;
      draggingStartMinutes.value = roundedMinutes;
      roundedDragStartMinutes.value = roundedMinutes;
      draggingDuration.value = defaultDuration;
      roundedDragDuration.value = defaultDuration;
      isDraggingAnim.value = true;
    },
    [
      timeZone,
      dragPosition,
      hourWidth,
      minuteHeight,
      dragToCreateMode,
      defaultDuration,
      dragStep,
      updateDraggingEvent,
      onDragCreateEventStart,
      columnWidthAnim,
      numberOfDays,
      isDraggingToCreate,
      draggingColumnIndex,
      draggingStartMinutes,
      roundedDragStartMinutes,
      draggingDuration,
      roundedDragDuration,
      isDraggingAnim,
    ]
  );

  const onEndDragging = (params: {
    columnIndex: number;
    startMinutes: number;
    duration: number;
  }) => {
    if (!gridListRef.current) {
      return;
    }
    const { columnIndex, startMinutes, duration } = params;
    const currentIndex = gridListRef.current?.getCurrentScrollIndex();
    const targetIndex = currentIndex + columnIndex;
    const startUnix = gridListRef.current?.getItemByIndex(targetIndex);
    const startWithZone = forceUpdateZone(parseDateTime(startUnix, { zone: 'utc' }), timeZone);
    const startDate = startWithZone.plus({ minutes: startMinutes });
    const startISO = startDate.toUTC().toISO();
    const endISO = startDate.plus({ minutes: duration }).toUTC().toISO();
    if (onDragCreateEventEnd) {
      onDragCreateEventEnd({
        start: { dateTime: startISO },
        end: { dateTime: endISO },
      });
    }
    updateDraggingEvent(undefined);
  };

  useAnimatedReaction(
    () => isDraggingAnim.value,
    (value, previousValue) => {
      if (isDraggingToCreate.value && previousValue === true && value !== previousValue) {
        const columnIndex = draggingColumnIndex.value;
        const startMinutes = roundedDragStartMinutes.value;
        const duration = roundedDragDuration.value;
        runOnJS(onEndDragging)({
          columnIndex,
          startMinutes,
          duration,
        });
        draggingColumnIndex.value = -1;
        draggingStartMinutes.value = -1;
        draggingDuration.value = -1;
        isDraggingToCreate.value = false;
        initialDragData.value = undefined;
        roundedDragStartMinutes.value = -1;
        roundedDragDuration.value = -1;
        draggingMode.value = undefined;
        dragPosition.value = undefined;
        extraMinutes.value = 0;
      }
    },
    [timeZone]
  );

  return { gesture, triggerDragCreateEvent };
};

export default useDragToCreate;
