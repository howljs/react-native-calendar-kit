import type { FC, PropsWithChildren } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform, type GestureResponderEvent } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import {
  runOnJS,
  runOnUI,
  scrollTo,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';
import {
  MILLISECONDS_IN_DAY,
  MILLISECONDS_IN_MINUTE,
  ScrollType,
} from '../constants';
import type HapticService from '../service/HapticService';
import type {
  DateTimeType,
  DateType,
  DraggingEventType,
  OnEventResponse,
  ResourceItem,
  SelectedEventType,
} from '../types';
import { forceUpdateZone, parseDateTime } from '../utils/dateUtils';
import { useActions } from './ActionsProvider';
import { useCalendar } from './CalendarProvider';
import { useTimezone } from './TimeZoneProvider';

export type DragEventContextProps = {
  dragStep: number;
  allowDragToEdit: boolean;
  isDragging: boolean;
  draggingEvent?: SelectedEventType;
  dragStartMinutes: SharedValue<number>;
  dragDuration: SharedValue<number>;
  isDraggingAnim: SharedValue<boolean>;
  draggingId: string | undefined;
  selectedEvent?: SelectedEventType;
  dragPosition: SharedValue<{
    x: number;
    y: number;
    translationX: number;
    translationY: number;
  }>;
  dragStartUnix: SharedValue<number>;
  roundedDragStartMinutes: SharedValue<number>;
  roundedDragDuration: SharedValue<number>;
  dragSelectedType: SharedValue<'center' | 'top' | 'bottom' | undefined>;
  roundedDragStartUnix: SharedValue<number>;
  dragSelectedStartUnix: SharedValue<number>;
  dragSelectedStartMinutes: SharedValue<number>;
  dragSelectedDuration: SharedValue<number>;
  isDraggingSelectedEvent: SharedValue<boolean>;
  extraMinutes: SharedValue<number>;
  selectedEventId: string | undefined;
  initialDragState: SharedValue<{
    dragStart: number;
    dragStartUnix: number;
    dragDuration: number;
  }>;
  allowDragToCreate: boolean;
  defaultDuration: number;
  isDraggingCreateAnim: SharedValue<boolean>;
  isDraggingCreate: boolean;
  dragX: SharedValue<number>;
};

const DragEventContext = React.createContext<DragEventContextProps | undefined>(
  undefined
);

export type DragEventActionsContextProps = {
  triggerDragEvent?: (
    initialDrag: {
      start: DateTimeType;
      end: DateTimeType;
      startIndex?: number;
      dragX?: number;
    },
    event?: OnEventResponse
  ) => void;
  triggerDragSelectedEvent: (initialDrag: {
    startIndex: number;
    type: 'center' | 'top' | 'bottom';
    resourceIndex?: number;
  }) => void;
  triggerDragCreateEvent?: (
    date: DateType,
    event: GestureResponderEvent
  ) => void;
};

const DragEventActionsContext = React.createContext<
  DragEventActionsContextProps | undefined
>(undefined);

const SCROLL_THRESHOLD = 100;
const AUTO_SCROLL_INTERVAL = 800;
const AUTO_SCROLL_SPEED = 100;

const DragEventProvider: FC<
  PropsWithChildren<{
    dragStep: number;
    allowDragToEdit: boolean;
    selectedEvent?: SelectedEventType;
    allowDragToCreate: boolean;
    defaultDuration: number;
    hapticService: HapticService;
    resources?: ResourceItem[];
  }>
> = ({
  children,
  dragStep,
  allowDragToEdit,
  selectedEvent,
  allowDragToCreate,
  defaultDuration,
  hapticService,
  resources,
}) => {
  // Contexts
  const { timeZone } = useTimezone();
  const {
    offsetY,
    offsetX,
    scrollVisibleHeightAnim,
    gridListRef,
    hourWidth,
    columns,
    columnWidthAnim,
    columnWidth,
    calendarListRef,
    numberOfDays,
    triggerDateChanged,
    calendarData,
    scrollType,
    scrollByDay,
    timelineHeight,
    verticalListRef,
    minuteHeight,
    calendarGridWidth,
    visibleDateUnixAnim,
    visibleDateUnix,
    dayBarListRef,
  } = useCalendar();
  const {
    onDragSelectedEventStart,
    onDragSelectedEventEnd,
    onDragEventStart,
    onDragEventEnd,
    onDragCreateEventStart,
    onDragCreateEventEnd,
    onLongPressEvent,
  } = useActions();

  const isDraggingAnim = useSharedValue(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingCreate, setIsDraggingCreate] = useState(false);
  const [draggingEvent, setDraggingEvent] = useState<DraggingEventType>();

  const dragStartUnix = useSharedValue<number>(-1);
  const dragStartMinutes = useSharedValue<number>(-1);
  const dragDuration = useSharedValue<number>(-1);
  const roundedDragStartUnix = useSharedValue<number>(-1);
  const roundedDragStartMinutes = useSharedValue<number>(-1);
  const roundedDragDuration = useSharedValue<number>(-1);
  const dragX = useSharedValue<number>(-1);

  const extraMinutes = useSharedValue(0);
  const dragSelectedType = useSharedValue<
    'center' | 'top' | 'bottom' | undefined
  >(undefined);
  const dragPosition = useSharedValue<{
    x: number;
    y: number;
    translationX: number;
    translationY: number;
  }>({
    x: -1,
    y: -1,
    translationX: -1,
    translationY: -1,
  });
  const initialDragState = useSharedValue({
    dragStart: -1,
    dragStartUnix: -1,
    dragDuration: -1,
  });
  const dragSelectedStartUnix = useSharedValue<number>(-1);
  const dragSelectedStartMinutes = useSharedValue<number>(-1);
  const dragSelectedDuration = useSharedValue<number>(-1);
  const isDraggingSelectedEvent = useSharedValue(false);
  const isDraggingCreateAnim = useSharedValue(false);

  const autoHScrollTimer = useRef<NodeJS.Timeout>();
  const autoVScrollTimer = useRef<NodeJS.Timeout>();
  const scrollTargetX = useSharedValue(0);
  const offsetYAnim = useSharedValue(0);

  const draggingId = draggingEvent?.localId ?? draggingEvent?.id;
  const selectedEventId = selectedEvent?.localId ?? selectedEvent?.id;

  const handleIsDraggingChange = useCallback(
    async (dragging: boolean) => {
      if (!dragging) {
        if (autoHScrollTimer.current) {
          clearInterval(autoHScrollTimer.current);
          autoHScrollTimer.current = undefined;
        }
        if (autoVScrollTimer.current) {
          clearInterval(autoVScrollTimer.current);
          autoVScrollTimer.current = undefined;
        }

        const hour = Math.floor(roundedDragStartMinutes.value / 60);
        const minute = roundedDragStartMinutes.value % 60;
        const newStartUnix = parseDateTime(roundedDragStartUnix.value)
          .set({ hour, minute })
          .toMillis();
        const newEndUnix =
          newStartUnix + roundedDragDuration.value * MILLISECONDS_IN_MINUTE;

        let resourceIndex = -1;
        let resourceId = draggingEvent?.resourceId;
        if (resources?.length) {
          const width = columnWidthAnim.value / resources.length;
          resourceIndex = Math.floor((dragX.value - hourWidth) / width);
          resourceId = resources[resourceIndex]?.id;
        }
        if (draggingEvent?.start?.dateTime && draggingEvent?.end?.dateTime) {
          const prevStart = parseDateTime(draggingEvent.start.dateTime, {
            zone: draggingEvent.start.timeZone,
          })
            .setZone(timeZone)
            .toMillis();
          const prevEnd = parseDateTime(draggingEvent.end.dateTime, {
            zone: draggingEvent.end.timeZone,
          })
            .setZone(timeZone)
            .toMillis();
          const newStartObj = forceUpdateZone(newStartUnix, timeZone);
          const newEndObj = forceUpdateZone(newEndUnix, timeZone);
          const newStart = newStartObj.toMillis();
          const newEnd = newEndObj.toMillis();
          const prevResourceId = draggingEvent?.resourceId;
          const currentEvent = { ...draggingEvent };
          delete currentEvent._internal;
          if (
            prevStart !== newStart ||
            prevEnd !== newEnd ||
            prevResourceId !== resourceId
          ) {
            const newStartISO = newStartObj.toISO();
            const newEndISO = newEndObj.toISO();
            const newProps = {
              start: { dateTime: newStartISO, timeZone },
              end: { dateTime: newEndISO, timeZone },
              resourceId,
            };
            if (selectedEvent) {
              await onDragSelectedEventEnd?.({
                ...(currentEvent as SelectedEventType),
                ...newProps,
              });
            } else if (isDraggingCreate) {
              await onDragCreateEventEnd?.(newProps);
            } else {
              await onDragEventEnd?.({
                ...(currentEvent as OnEventResponse),
                ...newProps,
              });
            }
          }
        }

        setDraggingEvent(undefined);
        setIsDraggingCreate(false);
        runOnUI(() => {
          dragStartUnix.value = -1;
          dragDuration.value = -1;
          dragStartMinutes.value = -1;
          dragSelectedType.value = undefined;
          dragX.value = -1;
          roundedDragStartUnix.value = -1;
          roundedDragStartMinutes.value = -1;
          roundedDragDuration.value = -1;
          extraMinutes.value = 0;
          isDraggingSelectedEvent.value = false;
        })();
      }

      setIsDragging(dragging);
    },
    [
      roundedDragStartMinutes,
      roundedDragStartUnix,
      roundedDragDuration,
      draggingEvent,
      resources,
      columnWidthAnim.value,
      dragX,
      hourWidth,
      timeZone,
      selectedEvent,
      isDraggingCreate,
      onDragSelectedEventEnd,
      onDragCreateEventEnd,
      onDragEventEnd,
      dragStartUnix,
      dragDuration,
      dragStartMinutes,
      dragSelectedType,
      extraMinutes,
      isDraggingSelectedEvent,
    ]
  );

  useAnimatedReaction(
    () => isDraggingAnim.value,
    (dragging, prevDragging) => {
      if (dragging !== prevDragging) {
        if (dragging) {
          scrollTargetX.value = offsetX.value;
        }
        runOnJS(handleIsDraggingChange)(dragging);
      }
    },
    [draggingEvent?.start, draggingEvent?.end]
  );

  const _triggerHaptic = async () => {
    try {
      await hapticService.selection();
    } catch (error) {}
  };

  useAnimatedReaction(
    () => roundedDragStartMinutes.value,
    (clampedStart, prevStart) => {
      if (clampedStart !== prevStart && clampedStart !== -1) {
        runOnJS(_triggerHaptic)();
      }
    }
  );

  useAnimatedReaction(
    () => roundedDragStartUnix.value,
    (unix, prevUnix) => {
      if (unix !== prevUnix && unix !== -1) {
        runOnJS(_triggerHaptic)();
      }
    }
  );

  useAnimatedReaction(
    () => roundedDragDuration.value,
    (duration, prevDuration) => {
      if (duration !== prevDuration && duration !== -1) {
        runOnJS(_triggerHaptic)();
      }
    }
  );

  useEffect(() => {
    if (selectedEvent?.start?.dateTime && selectedEvent?.end?.dateTime) {
      const eventStart = parseDateTime(selectedEvent.start.dateTime, {
        zone: selectedEvent.start.timeZone,
      }).setZone(timeZone);
      const eventEnd = parseDateTime(selectedEvent.end.dateTime, {
        zone: selectedEvent.end.timeZone,
      }).setZone(timeZone);
      dragSelectedStartUnix.value = parseDateTime(
        eventStart.toISODate()
      ).toMillis();
      dragSelectedStartMinutes.value = eventStart.hour * 60 + eventStart.minute;
      dragSelectedDuration.value = eventEnd.diff(eventStart, 'minutes').minutes;
    } else {
      dragSelectedStartUnix.value = -1;
      dragSelectedStartMinutes.value = -1;
      dragSelectedDuration.value = -1;
    }
  }, [
    dragSelectedDuration,
    dragSelectedStartMinutes,
    dragSelectedStartUnix,
    selectedEvent?.end,
    selectedEvent?.start,
    timeZone,
  ]);

  const _startAutoHScroll = (isNextPage: boolean) => {
    if (autoHScrollTimer.current) {
      return;
    }

    const maxOffset = calendarListRef.current?.getMaxOffset(numberOfDays) ?? 0;
    const shouldCancel = isNextPage
      ? offsetX.value === maxOffset
      : offsetX.value === 0;

    if (shouldCancel) {
      return;
    }

    const scrollInterval = () => {
      const visibleDates = calendarData.visibleDatesArray;
      const scrollTargetDiff = Math.abs(scrollTargetX.value - offsetX.value);
      const hasScrolledToTarget = scrollTargetDiff < 2;
      if (!hasScrolledToTarget) {
        return;
      }

      const currentIndex = visibleDates.indexOf(visibleDateUnix.current);
      if (currentIndex === -1) {
        triggerDateChanged.current = undefined;
        return;
      }

      let nextVisibleDayIndex = 0;
      let nextOffset = 0;
      const reverse = isNextPage ? 1 : -1;
      if (numberOfDays === 1 || scrollByDay) {
        nextVisibleDayIndex = currentIndex + 1 * reverse;
        const colWidth = numberOfDays === 1 ? calendarGridWidth : columnWidth;
        nextOffset = nextVisibleDayIndex * colWidth;
      } else {
        nextVisibleDayIndex = currentIndex + columns * reverse;
        const pageIndex = Math.floor(nextVisibleDayIndex / columns);
        nextOffset = pageIndex * (columnWidth * columns);
      }

      const isScrollable = calendarListRef.current?.isScrollable(
        nextOffset,
        numberOfDays
      );

      if (!isScrollable) {
        triggerDateChanged.current = undefined;
        clearInterval(autoHScrollTimer.current);
        autoHScrollTimer.current = undefined;
        return;
      }

      const nextDateUnix = visibleDates[nextVisibleDayIndex];
      if (!nextDateUnix) {
        triggerDateChanged.current = undefined;
        return;
      }

      scrollType.current = ScrollType.calendarGrid;
      triggerDateChanged.current = nextDateUnix;

      let targetUnix = nextDateUnix;
      if (isNextPage) {
        let lastIndex = nextVisibleDayIndex + (columns - 1);
        if (numberOfDays === 1 || scrollByDay) {
          lastIndex = nextVisibleDayIndex + (numberOfDays - 1);
        }
        if (lastIndex > visibleDates.length - 1) {
          lastIndex = visibleDates.length - 1;
        }
        const lastVisibleDay = visibleDates[lastIndex];
        if (lastVisibleDay) {
          targetUnix = lastVisibleDay;
        }
      }

      runOnUI(() => {
        scrollTargetX.value = nextOffset;
        if (Platform.OS === 'web') {
          scrollTo(dayBarListRef, nextOffset, 0, true);
        }
        scrollTo(gridListRef, nextOffset, 0, true);
        dragStartUnix.value = targetUnix;
        roundedDragStartUnix.value = targetUnix;
        offsetX.value = nextOffset;
      })();
    };

    autoHScrollTimer.current = setInterval(
      scrollInterval,
      AUTO_SCROLL_INTERVAL
    );
  };

  const _stopAutoHScroll = () => {
    if (autoHScrollTimer.current) {
      clearInterval(autoHScrollTimer.current);
      autoHScrollTimer.current = undefined;
    }
  };

  useAnimatedReaction(
    () => dragPosition.value.x,
    (curX, prevX) => {
      if (
        isDraggingAnim.value &&
        curX !== prevX &&
        curX !== -1 &&
        dragSelectedType.value !== 'top' &&
        dragSelectedType.value !== 'bottom'
      ) {
        const isAtLeftEdge = curX <= hourWidth - 10;
        const width = columnWidthAnim.value * numberOfDays + hourWidth;
        const isAtRightEdge = width - curX <= 24;
        const isStartAutoScroll = isAtLeftEdge || isAtRightEdge;
        if (isStartAutoScroll) {
          runOnJS(_startAutoHScroll)(isAtRightEdge);
        } else {
          runOnJS(_stopAutoHScroll)();
        }
      }
    },
    [
      numberOfDays,
      scrollByDay,
      columns,
      calendarGridWidth,
      columnWidth,
      calendarData,
    ]
  );

  const _startAutoVScroll = (isAtTopEdge: boolean) => {
    if (autoVScrollTimer.current) {
      return;
    }

    const scrollInterval = () => {
      const maxOffsetY = timelineHeight.value - scrollVisibleHeightAnim.value;
      const targetOffset = isAtTopEdge
        ? Math.max(0, offsetY.value - offsetYAnim.value)
        : Math.min(offsetY.value + offsetYAnim.value, maxOffsetY);

      runOnUI(() => {
        if (targetOffset !== offsetY.value) {
          const { dragStart: initialStart, dragDuration: initialDuration } =
            initialDragState.value;

          const diffY = targetOffset - offsetY.value;
          const minutes = diffY / minuteHeight.value;
          if (dragSelectedType.value === 'bottom') {
            const nextDuration = Math.max(
              dragStep,
              dragDuration.value + minutes
            );
            const roundedEndMinutes =
              Math.round((initialStart + nextDuration) / dragStep) * dragStep;
            const roundedDuration = roundedEndMinutes - initialStart;

            dragDuration.value = nextDuration;
            roundedDragDuration.value = roundedDuration;
          } else {
            let nextStart = dragStartMinutes.value + minutes;
            let nextRoundedStart = Math.floor(nextStart / dragStep) * dragStep;
            if (dragSelectedType.value === 'top') {
              const diffRounded = nextRoundedStart - nextStart;
              const nextDuration = dragDuration.value - minutes;
              const nextRoundedDuration = nextDuration - diffRounded;
              if (nextDuration < dragStep) {
                const minStart = initialStart + (initialDuration - dragStep);
                nextStart = minStart;
                nextRoundedStart = minStart;
              }
              dragDuration.value = Math.max(dragStep, nextDuration);
              roundedDragDuration.value = Math.max(
                dragStep,
                nextRoundedDuration
              );
            }
            dragStartMinutes.value = nextStart;
            roundedDragStartMinutes.value = nextRoundedStart;
          }
          extraMinutes.value += minutes;
          offsetY.value = targetOffset;
          scrollTo(verticalListRef, 0, targetOffset, false);
        }
      })();

      if (targetOffset === 0 || targetOffset === maxOffsetY) {
        clearInterval(autoVScrollTimer.current);
        autoVScrollTimer.current = undefined;
      }
    };

    autoVScrollTimer.current = setInterval(scrollInterval, 100);
  };

  const _stopAutoVScroll = () => {
    if (autoVScrollTimer.current) {
      clearInterval(autoVScrollTimer.current);
      autoVScrollTimer.current = undefined;
    }
  };

  useAnimatedReaction(
    () => dragPosition.value.y,
    (dragY, prevY) => {
      if (isDraggingAnim.value && dragY !== prevY && dragY !== -1) {
        const isAtTopEdge = dragY <= SCROLL_THRESHOLD;
        const isAtBottomEdge =
          scrollVisibleHeightAnim.value - dragY <= SCROLL_THRESHOLD;
        const isStartAutoScroll = isAtBottomEdge || isAtTopEdge;
        if (isStartAutoScroll) {
          const distFromEdge = isAtTopEdge
            ? Math.max(0, dragY)
            : Math.max(0, scrollVisibleHeightAnim.value - dragY);
          const speedPct = 1 - distFromEdge / SCROLL_THRESHOLD;
          offsetYAnim.value = speedPct * AUTO_SCROLL_SPEED;
          runOnJS(_startAutoVScroll)(isAtTopEdge);
        } else {
          offsetYAnim.value = 0;
          runOnJS(_stopAutoVScroll)();
        }
      }
    }
  );

  const triggerDragSelectedEvent = useCallback(
    (initialDrag: {
      startIndex: number;
      type: 'center' | 'top' | 'bottom';
      resourceIndex?: number;
    }) => {
      if (!selectedEvent) {
        return;
      }
      if (selectedEvent && onDragSelectedEventStart) {
        onDragSelectedEventStart(selectedEvent);
      }
      setDraggingEvent(selectedEvent);
      if (
        resources &&
        initialDrag.resourceIndex !== undefined &&
        initialDrag.resourceIndex >= 0
      ) {
        const eventWidth = columnWidth / resources.length;
        dragX.value = initialDrag.resourceIndex * eventWidth + hourWidth + 1;
      }
      runOnUI(() => {
        if (initialDrag.startIndex === 0) {
          const startMinutes = dragSelectedStartMinutes.value;
          dragStartMinutes.value = startMinutes;
          roundedDragStartMinutes.value = startMinutes;
          const diffDays = Math.floor(
            (dragSelectedStartUnix.value - visibleDateUnixAnim.value) /
              MILLISECONDS_IN_DAY
          );
          const startUnix =
            visibleDateUnixAnim.value + diffDays * MILLISECONDS_IN_DAY;
          dragStartUnix.value = startUnix;
          roundedDragStartUnix.value = startUnix;
        } else {
          const startByIndex =
            dragSelectedStartUnix.value +
            initialDrag.startIndex * MILLISECONDS_IN_DAY;
          const diffDays = Math.floor(
            (startByIndex - visibleDateUnixAnim.value) / MILLISECONDS_IN_DAY
          );

          const startUnix =
            visibleDateUnixAnim.value + diffDays * MILLISECONDS_IN_DAY;
          dragStartUnix.value = startUnix;
          roundedDragStartUnix.value = startUnix;

          const originalStart =
            dragSelectedStartUnix.value +
            dragSelectedStartMinutes.value * MILLISECONDS_IN_MINUTE;
          const diffMinutes = Math.floor(
            (startByIndex - originalStart) / MILLISECONDS_IN_MINUTE
          );
          dragStartMinutes.value = 0 - diffMinutes;
          roundedDragStartMinutes.value = 0 - diffMinutes;
        }
        const duration = dragSelectedDuration.value;
        dragDuration.value = duration;
        roundedDragDuration.value = duration;
        dragSelectedType.value = initialDrag.type;
        isDraggingAnim.value = true;
        isDraggingSelectedEvent.value = true;
      })();
    },
    [
      columnWidth,
      dragDuration,
      dragSelectedDuration.value,
      dragSelectedStartMinutes.value,
      dragSelectedStartUnix.value,
      dragSelectedType,
      dragStartMinutes,
      dragStartUnix,
      dragX,
      hourWidth,
      isDraggingAnim,
      isDraggingSelectedEvent,
      onDragSelectedEventStart,
      resources,
      roundedDragDuration,
      roundedDragStartMinutes,
      roundedDragStartUnix,
      selectedEvent,
      visibleDateUnixAnim.value,
    ]
  );

  const triggerDragEvent = useCallback(
    (
      initialDrag: {
        start: DateTimeType;
        end: DateTimeType;
        startIndex?: number;
        dragX?: number;
      },
      event?: OnEventResponse
    ) => {
      if (event && onLongPressEvent) {
        onLongPressEvent(event);
      }
      if (event && onDragEventStart) {
        onDragEventStart(event);
      }
      setDraggingEvent(event);

      dragX.value =
        initialDrag.dragX !== undefined ? initialDrag.dragX + hourWidth : -1;
      let startDate = parseDateTime(initialDrag.start.dateTime, {
        zone: initialDrag.start.timeZone,
      }).setZone(timeZone);
      let endDate = parseDateTime(initialDrag.end.dateTime, {
        zone: initialDrag.end.timeZone,
      }).setZone(timeZone);
      startDate = forceUpdateZone(startDate);
      endDate = forceUpdateZone(endDate);
      const startMinutes = startDate.hour * 60 + startDate.minute;
      const eventStartUnix = startDate.toMillis();
      const eventEndUnix = endDate.toMillis();

      runOnUI(() => {
        if (initialDrag.startIndex === 0) {
          dragStartMinutes.value = startMinutes;
          roundedDragStartMinutes.value = startMinutes;
          const diffDays = Math.floor(
            (eventStartUnix - visibleDateUnixAnim.value) / MILLISECONDS_IN_DAY
          );
          const startUnix =
            visibleDateUnixAnim.value + diffDays * MILLISECONDS_IN_DAY;
          dragStartUnix.value = startUnix;
          roundedDragStartUnix.value = startUnix;
        } else {
          const startIndex = initialDrag.startIndex ?? 0;
          const startByIndex =
            eventStartUnix + startIndex * MILLISECONDS_IN_DAY;
          const diffDays = Math.floor(
            (startByIndex - visibleDateUnixAnim.value) / MILLISECONDS_IN_DAY
          );

          const startUnix =
            visibleDateUnixAnim.value + diffDays * MILLISECONDS_IN_DAY;
          dragStartUnix.value = startUnix;
          roundedDragStartUnix.value = startUnix;

          const originalStart =
            eventStartUnix + startMinutes * MILLISECONDS_IN_MINUTE;
          const diffMinutes = Math.floor(
            (startByIndex - originalStart) / MILLISECONDS_IN_MINUTE
          );
          dragStartMinutes.value = 0 - diffMinutes;
          roundedDragStartMinutes.value = 0 - diffMinutes;
        }
        const duration =
          (eventEndUnix - eventStartUnix) / MILLISECONDS_IN_MINUTE;
        dragDuration.value = duration;
        roundedDragDuration.value = duration;
        isDraggingAnim.value = true;
      })();
    },
    [
      onLongPressEvent,
      onDragEventStart,
      dragX,
      hourWidth,
      timeZone,
      dragDuration,
      roundedDragDuration,
      isDraggingAnim,
      dragStartMinutes,
      roundedDragStartMinutes,
      visibleDateUnixAnim.value,
      dragStartUnix,
      roundedDragStartUnix,
    ]
  );

  const triggerDragCreateEvent = useCallback(
    (date: DateType, event?: GestureResponderEvent) => {
      setIsDraggingCreate(true);
      dragX.value =
        event?.nativeEvent?.locationX !== undefined
          ? event.nativeEvent.locationX + hourWidth
          : -1;
      const start = parseDateTime(date, { zone: timeZone });
      const startUnix = parseDateTime(start.toISODate()).toMillis();
      const startMinutes = start.hour * 60 + start.minute;
      const roundedMinutes = Math.floor(startMinutes / dragStep) * dragStep;
      const roundedStartUnix =
        startUnix + roundedMinutes * MILLISECONDS_IN_MINUTE;
      const startDate = parseDateTime(roundedStartUnix);
      const startISO = startDate.toISO();
      const endISO = startDate.plus({ minutes: defaultDuration }).toISO();
      setDraggingEvent({
        start: { dateTime: startISO },
        end: { dateTime: endISO },
      });
      if (onDragCreateEventStart) {
        onDragCreateEventStart({
          start: { dateTime: startISO },
          end: { dateTime: endISO },
        });
      }

      runOnUI(() => {
        dragStartUnix.value = startUnix;
        roundedDragStartUnix.value = startUnix;
        dragStartMinutes.value = roundedMinutes;
        roundedDragStartMinutes.value = roundedMinutes;
        dragDuration.value = defaultDuration;
        roundedDragDuration.value = defaultDuration;
        isDraggingCreateAnim.value = true;
        isDraggingAnim.value = true;
      })();
    },
    [
      defaultDuration,
      dragDuration,
      dragStartMinutes,
      dragStartUnix,
      dragStep,
      dragX,
      hourWidth,
      isDraggingAnim,
      isDraggingCreateAnim,
      onDragCreateEventStart,
      roundedDragDuration,
      roundedDragStartMinutes,
      roundedDragStartUnix,
      timeZone,
    ]
  );

  const contextValues = useMemo(
    () => ({
      dragStep,
      allowDragToEdit,
      isDraggingAnim,
      isDragging,
      draggingEvent,
      dragDuration,
      dragStartMinutes,
      draggingId,
      roundedDragStartMinutes,
      roundedDragDuration,
      selectedEvent,
      dragPosition,
      dragStartUnix,
      roundedDragStartUnix,
      dragSelectedStartUnix,
      dragSelectedStartMinutes,
      dragSelectedDuration,
      isDraggingSelectedEvent,
      extraMinutes,
      selectedEventId,
      dragSelectedType,
      initialDragState,
      allowDragToCreate,
      defaultDuration,
      isDraggingCreateAnim,
      isDraggingCreate,
      dragX,
    }),
    [
      dragStep,
      allowDragToEdit,
      isDraggingAnim,
      isDragging,
      draggingEvent,
      dragDuration,
      dragStartMinutes,
      draggingId,
      roundedDragStartMinutes,
      roundedDragDuration,
      selectedEvent,
      dragPosition,
      dragStartUnix,
      roundedDragStartUnix,
      dragSelectedStartUnix,
      dragSelectedStartMinutes,
      dragSelectedDuration,
      isDraggingSelectedEvent,
      extraMinutes,
      selectedEventId,
      dragSelectedType,
      initialDragState,
      allowDragToCreate,
      defaultDuration,
      isDraggingCreateAnim,
      isDraggingCreate,
      dragX,
    ]
  );

  const actionsContext = useMemo(
    () => ({
      triggerDragEvent: allowDragToEdit ? triggerDragEvent : undefined,
      triggerDragSelectedEvent,
      triggerDragCreateEvent: allowDragToCreate
        ? triggerDragCreateEvent
        : undefined,
    }),
    [
      allowDragToEdit,
      triggerDragEvent,
      triggerDragSelectedEvent,
      allowDragToCreate,
      triggerDragCreateEvent,
    ]
  );

  return (
    <DragEventContext.Provider value={contextValues}>
      <DragEventActionsContext.Provider value={actionsContext}>
        {children}
      </DragEventActionsContext.Provider>
    </DragEventContext.Provider>
  );
};

export default DragEventProvider;

export const useDragEvent = () => {
  const context = useContext(DragEventContext);
  if (!context) {
    throw new Error('useDragEvent must be used within a DragEventProvider');
  }
  return context;
};

export const useDragEventActions = () => {
  const context = useContext(DragEventActionsContext);
  if (!context) {
    throw new Error(
      'useDragEventActions must be used within a DragEventProvider'
    );
  }
  return context;
};
