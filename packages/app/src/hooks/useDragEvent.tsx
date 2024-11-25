import {
  clampValues,
  type DraggingMode,
  forceUpdateZone,
  parseDateTime,
  roundMinutes,
  useActions,
  useCalendar,
  useDragActions,
  useDragContext,
  useTimezone,
} from '@calendar-kit/core';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedReaction, useSharedValue, withTiming } from 'react-native-reanimated';

import { MILLISECONDS_IN_DAY } from '../constants';
import type { DateTimeType, PackedEvent, SelectedEventType } from '../types';

const useDragEventGesture = () => {
  const {
    minuteHeight,
    columnWidthAnim,
    hourWidth,
    verticalListRef,
    gridListRef,
    numberOfDays,
    columnWidth,
    start: calendarStart,
  } = useCalendar();
  const { timeZone } = useTimezone();
  const {
    isDraggingAnim,
    roundedDragStartMinutes,
    dragStep,
    roundedDragDuration,
    extraMinutes,
    draggingStartMinutes,
    dragPosition,
    draggingDuration,
    draggingMode,
    isDraggingToCreate,
    initialDragData,
    draggingColumnIndex,
    selectedEvent,
    draggableData,
    isShowDraggableEvent,
    draggableDates,
    draggingId,
  } = useDragContext();
  const { updateDraggingEvent, updateDraggableDates } = useDragActions();
  const { onDragEventStart, onDragEventEnd, onDragSelectedEventStart, onDragSelectedEventEnd } =
    useActions();

  const draggingEventRef = useRef<PackedEvent>();
  const selectedEventRef = useRef<SelectedEventType>();
  const cachedSelectedEventRef = useRef<{
    start: number;
    end: number;
  }>();
  const initialX = useSharedValue(0);
  const pendingUpdateIsDragging = useRef<boolean>(false);

  const updateDraggableEvent = useCallback(
    (start?: DateTimeType, end?: DateTimeType) => {
      if (!gridListRef.current) {
        return;
      }

      if (!start?.dateTime || !end?.dateTime) {
        // Reset draggable dates if event is undefined
        draggableData.value = undefined;
        updateDraggableDates([]);
        cachedSelectedEventRef.current = undefined;
        selectedEventRef.current = undefined;
        return;
      }

      const newEventStart = parseDateTime(start.dateTime, {
        zone: start.timeZone,
      }).setZone(timeZone);
      const newEventEnd = parseDateTime(end.dateTime, {
        zone: end.timeZone,
      }).setZone(timeZone);
      const startUnix = newEventStart.toMillis();
      const endUnix = newEventEnd.toMillis();
      const prevStartUnix = cachedSelectedEventRef.current?.start;
      const prevEndUnix = cachedSelectedEventRef.current?.end;
      if (startUnix === prevStartUnix && endUnix === prevEndUnix) {
        return;
      }

      cachedSelectedEventRef.current = { start: startUnix, end: endUnix };
      const eventDates = [];
      const startDate = forceUpdateZone(newEventStart.startOf('day'), 'utc');
      const endDate = forceUpdateZone(newEventEnd.startOf('day'), 'utc');
      const startDateUnix = startDate.toMillis();
      const endDateUnix = endDate.toMillis();
      const currentIndex = gridListRef.current.getCurrentScrollIndex();
      const targetIndex = gridListRef.current.getIndexByItem(startDateUnix);
      const columnIndex = targetIndex - currentIndex;
      const diffDays = Math.ceil((endDateUnix - startDateUnix) / MILLISECONDS_IN_DAY);
      for (let i = 0; i <= diffDays; i++) {
        eventDates.push(startDateUnix + i * MILLISECONDS_IN_DAY);
      }
      updateDraggableDates(eventDates);
      draggableData.value = {
        columnIndex,
        startMinutes: newEventStart.hour * 60 + newEventStart.minute,
        duration: newEventEnd.diff(newEventStart, 'minutes').minutes,
      };
    },
    [draggableData, gridListRef, timeZone, updateDraggableDates]
  );

  useEffect(() => {
    const start = {
      dateTime: selectedEvent?.start?.dateTime,
      timeZone: selectedEvent?.start?.timeZone,
    };
    const end = {
      dateTime: selectedEvent?.end?.dateTime,
      timeZone: selectedEvent?.end?.timeZone,
    };
    updateDraggableEvent(start, end);
  }, [
    updateDraggableEvent,
    selectedEvent?.start?.dateTime,
    selectedEvent?.end?.dateTime,
    selectedEvent?.start?.timeZone,
    selectedEvent?.end?.timeZone,
  ]);

  const updateDragDurationForBottom = (
    translationY: number,
    initialStart: number,
    initialDuration: number
  ) => {
    'worklet';
    const diffMinutes = Math.floor(translationY / minuteHeight.value);
    let nextDuration = initialDuration + extraMinutes.value + diffMinutes;
    const roundedEndTime = roundMinutes(initialStart + nextDuration, dragStep);
    let nextRoundedDuration = roundedEndTime - initialStart;

    if (nextDuration < dragStep) {
      nextDuration = dragStep;
      nextRoundedDuration = dragStep;
    }

    draggingDuration.value = nextDuration;
    roundedDragDuration.value = nextRoundedDuration;
  };

  /** Updates drag start and duration when dragging the top handle. */
  const updateDragDurationForTop = (
    translationY: number,
    initialStart: number,
    initialDuration: number
  ) => {
    'worklet';
    const minStart = initialStart + (initialDuration - dragStep);
    const initialY = (initialStart + extraMinutes.value) * minuteHeight.value;
    const newY = initialY + translationY;
    let newDragStart = Math.floor(newY / minuteHeight.value);
    let roundedDragStart = roundMinutes(newDragStart, dragStep, 'floor');

    const diffMinutes = Math.floor(translationY / minuteHeight.value);
    const diffRoundedMinutes = roundedDragStart - newDragStart;
    let nextDuration = initialDuration - extraMinutes.value - diffMinutes;
    let nextRoundedDuration = nextDuration - diffRoundedMinutes;

    if (nextDuration <= dragStep) {
      newDragStart = minStart;
      roundedDragStart = minStart;
      nextDuration = dragStep;
      nextRoundedDuration = dragStep;
    }

    draggingStartMinutes.value = newDragStart;
    roundedDragStartMinutes.value = roundedDragStart;
    draggingDuration.value = nextDuration;
    roundedDragDuration.value = nextRoundedDuration;
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
    .manualActivation(true)
    .onBegin(({ x }) => {
      initialX.value = x;
    })
    .onStart(() => {
      initialDragData.value = {
        startMinutes: draggingStartMinutes.value,
        duration: draggingDuration.value,
        columnIndex: draggingColumnIndex.value,
      };
    })
    .onUpdate(({ translationX, translationY, x, y }) => {
      if (!initialDragData.value) {
        return;
      }

      dragPosition.value = { x, y };
      const { startMinutes: initialStart, duration: initialDuration } = initialDragData.value;

      if (draggingMode.value === 'bottom') {
        updateDragDurationForBottom(translationY, initialStart, initialDuration);
      } else if (draggingMode.value === 'top') {
        updateDragDurationForTop(translationY, initialStart, initialDuration);
      } else {
        updateDragStartPosition(translationY, initialStart);
        const newX = initialX.value + translationX - hourWidth;
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
      if (isDraggingAnim.value && !isDraggingToCreate.value) {
        state.activate();
      } else if (Platform.OS === 'ios') {
        state.fail();
      }
    })
    .onTouchesUp(() => {
      if (isDraggingAnim.value && !isDraggingToCreate.value) {
        isDraggingAnim.value = false;
      }
    });

  const isDraggingEventDirty = (
    previousEvent: PackedEvent | SelectedEventType,
    newStartISO: string,
    newEndISO: string
  ) => {
    const prevStart = parseDateTime(previousEvent.start.dateTime, {
      zone: previousEvent.start.timeZone,
    }).toMillis();
    const prevEnd = parseDateTime(previousEvent.end.dateTime, {
      zone: previousEvent.end.timeZone,
    }).toMillis();
    const newStart = parseDateTime(newStartISO, {
      zone: previousEvent.start.timeZone,
    }).toMillis();
    const newEnd = parseDateTime(newEndISO, {
      zone: previousEvent.end.timeZone,
    }).toMillis();

    return prevStart !== newStart || prevEnd !== newEnd;
  };

  const resetDragState = useCallback(() => {
    isShowDraggableEvent.value = true;
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
    draggingId.value = undefined;
  }, [
    isShowDraggableEvent,
    draggingColumnIndex,
    draggingStartMinutes,
    draggingDuration,
    isDraggingToCreate,
    initialDragData,
    roundedDragStartMinutes,
    roundedDragDuration,
    draggingMode,
    dragPosition,
    extraMinutes,
    draggingId,
  ]);

  useEffect(() => {
    if (pendingUpdateIsDragging.current) {
      resetDragState();
      pendingUpdateIsDragging.current = false;
    }
  }, [draggableDates, resetDragState]);

  const onEndDragging = (params: {
    columnIndex: number;
    startMinutes: number;
    duration: number;
  }) => {
    const event = selectedEventRef.current || draggingEventRef.current;
    if (!gridListRef.current || !event) {
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
    const isDirty = isDraggingEventDirty(event, startISO, endISO);

    if (selectedEventRef.current && onDragSelectedEventEnd) {
      const updatedEvent = {
        ...selectedEventRef.current,
        start: { dateTime: startISO, timeZone },
        end: { dateTime: endISO, timeZone },
        isDirty,
      };
      if (isDirty) {
        pendingUpdateIsDragging.current = true;
        updateDraggableEvent(updatedEvent.start, updatedEvent.end);
      } else {
        resetDragState();
      }
      onDragSelectedEventEnd(updatedEvent);
    } else if (onDragEventEnd && draggingEventRef.current) {
      onDragEventEnd({
        ...draggingEventRef.current,
        start: { dateTime: startISO, timeZone },
        end: { dateTime: endISO, timeZone },
        isDirty,
      });
      resetDragState();
    }
    draggingEventRef.current = undefined;
    updateDraggingEvent(undefined);
  };

  useAnimatedReaction(
    () => isDraggingAnim.value,
    (value, previousValue) => {
      if (!isDraggingToCreate.value && previousValue === true && value !== previousValue) {
        const columnIndex = draggingColumnIndex.value;
        const startMinutes = roundedDragStartMinutes.value;
        const duration = roundedDragDuration.value;
        runOnJS(onEndDragging)({
          columnIndex,
          startMinutes,
          duration,
        });
      }
    },
    [timeZone]
  );

  const triggerDragEvent = useCallback(
    (event: PackedEvent) => {
      if (!gridListRef.current) {
        return;
      }

      draggingId.value = event.id;
      draggingEventRef.current = event;
      updateDraggingEvent(event);
      if (event && onDragEventStart) {
        onDragEventStart({ ...event, isDirty: false });
      }

      const startDate = parseDateTime(event.start.dateTime, {
        zone: event.start.timeZone,
      }).setZone(timeZone);
      const endDate = parseDateTime(event.end.dateTime, {
        zone: event.end.timeZone,
      }).setZone(timeZone);

      const eventIndex = event._internal.eventIndex ?? 0;
      const startUnix = forceUpdateZone(startDate.startOf('day'), 'utc').toMillis();
      const targetIndex = gridListRef.current.getIndexByItem(startUnix) + eventIndex;
      const currentIndex = gridListRef.current.getCurrentScrollIndex();
      const columnIndex = targetIndex - currentIndex;

      let startMinutes = startDate.hour * 60 + startDate.minute;
      const duration = endDate.diff(startDate, 'minutes').minutes;
      if (eventIndex > 0) {
        startMinutes = calendarStart - (24 * 60 - startMinutes);
      }

      dragPosition.value = {
        x: columnIndex * columnWidth + hourWidth,
        y: startMinutes * minuteHeight.value,
      };

      draggingColumnIndex.value = columnIndex;
      draggingStartMinutes.value = startMinutes;
      roundedDragStartMinutes.value = startMinutes;
      draggingDuration.value = duration;
      roundedDragDuration.value = duration;
      isDraggingAnim.value = true;
    },
    [
      calendarStart,
      columnWidth,
      dragPosition,
      draggingColumnIndex,
      draggingDuration,
      draggingId,
      draggingStartMinutes,
      gridListRef,
      hourWidth,
      isDraggingAnim,
      minuteHeight,
      onDragEventStart,
      roundedDragDuration,
      roundedDragStartMinutes,
      timeZone,
      updateDraggingEvent,
    ]
  );

  const triggerDragSelectedEvent = useCallback(
    (event: { eventIndex: number; type: DraggingMode }) => {
      if (!gridListRef.current || !selectedEvent) {
        return;
      }

      draggingId.value = selectedEvent.id;
      selectedEventRef.current = selectedEvent;
      updateDraggingEvent(selectedEvent);
      if (onDragSelectedEventStart) {
        onDragSelectedEventStart({ ...selectedEvent, isDirty: false });
      }

      const startDate = parseDateTime(selectedEvent.start.dateTime, {
        zone: selectedEvent.start.timeZone,
      }).setZone(timeZone);
      const endDate = parseDateTime(selectedEvent.end.dateTime, {
        zone: selectedEvent.end.timeZone,
      }).setZone(timeZone);

      const startUnix = forceUpdateZone(startDate.startOf('day'), 'utc').toMillis();
      const targetIndex = gridListRef.current.getIndexByItem(startUnix) + event.eventIndex;
      const currentIndex = gridListRef.current.getCurrentScrollIndex();
      const columnIndex = targetIndex - currentIndex;

      let startMinutes = startDate.hour * 60 + startDate.minute;
      const duration = endDate.diff(startDate, 'minutes').minutes;
      if (event.eventIndex > 0) {
        startMinutes = calendarStart - (24 * 60 - startMinutes);
      }
      dragPosition.value = {
        x: columnIndex * columnWidth + hourWidth,
        y: startMinutes * minuteHeight.value,
      };

      isShowDraggableEvent.value = false;
      draggingMode.value = event.type;
      draggingColumnIndex.value = columnIndex;
      draggingStartMinutes.value = startMinutes;
      roundedDragStartMinutes.value = startMinutes;
      draggingDuration.value = duration;
      roundedDragDuration.value = duration;
      isDraggingAnim.value = true;
    },
    [
      gridListRef,
      selectedEvent,
      draggingId,
      updateDraggingEvent,
      onDragSelectedEventStart,
      timeZone,
      dragPosition,
      columnWidth,
      hourWidth,
      minuteHeight,
      isShowDraggableEvent,
      draggingMode,
      draggingColumnIndex,
      draggingStartMinutes,
      roundedDragStartMinutes,
      draggingDuration,
      roundedDragDuration,
      isDraggingAnim,
      calendarStart,
    ]
  );

  return { gesture, triggerDragEvent, triggerDragSelectedEvent };
};

export default useDragEventGesture;
