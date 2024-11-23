import {
  createContext,
  type FC,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import {
  runOnJS,
  runOnUI,
  setNativeProps,
  type SharedValue,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';

import {
  AUTO_SCROLL_INTERVAL,
  AUTO_SCROLL_SPEED,
  SCROLL_THRESHOLD,
  ScrollType,
} from '../constants';
import type { DraggingEventType, SelectedEventType } from '../types';
import { useCalendar } from './CalendarContext';

export type DragData = {
  columnIndex: number;
  startMinutes: number;
  duration: number;
};

export type DragPosition = {
  x: number;
  y: number;
};

export type DraggingMode = 'top' | 'bottom' | 'middle';

export type DragContextType = {
  dragStep: number;
  isDragging: boolean;
  allowDragToCreate: boolean;
  allowDragToEdit: boolean;
  dragToCreateMode: 'duration' | 'date-time';
  selectedEvent?: SelectedEventType;
  draggingEvent?: DraggingEventType;
  defaultDuration: number;
  dragPosition: SharedValue<DragPosition | undefined>;
  initialDragData: SharedValue<DragData | undefined>;
  draggingColumnIndex: SharedValue<number>;
  draggingStartMinutes: SharedValue<number>;
  draggingDuration: SharedValue<number>;
  roundedDragStartMinutes: SharedValue<number>;
  roundedDragDuration: SharedValue<number>;
  draggableData: SharedValue<DragData | undefined>;
  isDraggingAnim: SharedValue<boolean>;
  isShowDraggableEvent: SharedValue<boolean>;
  draggingMode: SharedValue<DraggingMode | undefined>;
  extraMinutes: SharedValue<number>;
  isDraggingToCreate: SharedValue<boolean>;
  draggableDates: number[];
  draggingId: SharedValue<string | undefined>;
};

export const DragContext = createContext<DragContextType | undefined>(undefined);

export interface DragActionsContextType {
  updateDraggingEvent: (event?: DraggingEventType) => void;
  updateDraggableDates: (dates: number[]) => void;
}

const DragActionsContext = createContext<DragActionsContextType | undefined>(undefined);

interface DragProviderProps {
  selectedEvent?: SelectedEventType;
  defaultDuration: number;
  dragStep: number;
  allowDragToCreate: boolean;
  allowDragToEdit: boolean;
  dragToCreateMode: 'duration' | 'date-time';
}

const DragProvider: FC<PropsWithChildren<DragProviderProps>> = ({
  children,
  dragStep,
  allowDragToCreate,
  allowDragToEdit,
  dragToCreateMode,
  selectedEvent,
  defaultDuration,
}) => {
  const {
    gridListRef,
    offsetX,
    hourWidth,
    triggerDateChanged,
    numberOfDays,
    scrollByDay,
    columnWidth,
    calendarGridWidth,
    scrollType,
    headerListRef,
    timelineHeight,
    scrollVisibleHeightAnim,
    offsetY,
    minuteHeight,
    verticalListRef,
    hapticService,
  } = useCalendar();
  const [isDragging, setIsDragging] = useState(false);
  const [draggingEvent, setDraggingEvent] = useState<DraggingEventType>();
  const [draggableDates, setDraggableDates] = useState<number[]>([]);

  const isDraggingAnim = useSharedValue(false);
  const isShowDraggableEvent = useSharedValue(true);
  const initialDragData = useSharedValue<DragData | undefined>(undefined);
  const draggableData = useSharedValue<DragData | undefined>(undefined);
  const dragPosition = useSharedValue<DragPosition | undefined>(undefined);
  const draggingMode = useSharedValue<DraggingMode | undefined>(undefined);
  const draggingId = useSharedValue<string | undefined>(undefined);

  const draggingStartMinutes = useSharedValue<number>(-1);
  const draggingDuration = useSharedValue<number>(-1);
  const draggingColumnIndex = useSharedValue<number>(-1);

  const roundedDragStartMinutes = useSharedValue<number>(-1);
  const roundedDragDuration = useSharedValue<number>(-1);

  const extraMinutes = useSharedValue<number>(0);
  const isDraggingToCreate = useSharedValue<boolean>(false);

  const autoHScrollTimer = useRef<NodeJS.Timeout>();
  const autoVScrollTimer = useRef<NodeJS.Timeout>();
  const scrollTargetX = useSharedValue(0);
  const offsetYAnim = useSharedValue(0);

  const dragContextValue: DragContextType = useMemo(
    () => ({
      isDragging,
      dragStep,
      allowDragToCreate,
      allowDragToEdit,
      dragToCreateMode,
      selectedEvent,
      draggingEvent,
      defaultDuration,
      isDraggingAnim,
      initialDragData,
      draggingStartMinutes,
      draggingDuration,
      draggingColumnIndex,
      roundedDragStartMinutes,
      roundedDragDuration,
      isShowDraggableEvent,
      draggableData,
      dragPosition,
      draggingMode,
      extraMinutes,
      isDraggingToCreate,
      draggableDates,
      draggingId,
    }),
    [
      allowDragToCreate,
      allowDragToEdit,
      defaultDuration,
      dragPosition,
      dragStep,
      dragToCreateMode,
      draggableData,
      draggingDuration,
      draggingEvent,
      draggingMode,
      draggingStartMinutes,
      draggingColumnIndex,
      extraMinutes,
      initialDragData,
      isDragging,
      isDraggingAnim,
      isDraggingToCreate,
      isShowDraggableEvent,
      roundedDragDuration,
      roundedDragStartMinutes,
      selectedEvent,
      draggableDates,
      draggingId,
    ]
  );

  const updateDraggingEvent = useCallback((event?: DraggingEventType) => {
    setDraggingEvent(event);
  }, []);

  const updateDraggableDates = useCallback((indexes: number[]) => {
    setDraggableDates(indexes);
  }, []);

  const dragActionsContextValue: DragActionsContextType = useMemo(
    () => ({
      updateDraggingEvent,
      updateDraggableDates,
    }),
    [updateDraggingEvent, updateDraggableDates]
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
    () => draggingColumnIndex.value,
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

  const onEndDragging = () => {
    if (autoHScrollTimer.current) {
      clearInterval(autoHScrollTimer.current);
      autoHScrollTimer.current = undefined;
    }
  };

  useAnimatedReaction(
    () => isDraggingAnim.value,
    (value, previousValue) => {
      if (previousValue !== null && value !== previousValue) {
        if (value) {
          scrollTargetX.value = offsetX.value;
        } else {
          runOnJS(onEndDragging)();
        }
        runOnJS(setIsDragging)(value);
      }
    }
  );

  const _startAutoHScroll = (isNextPage: boolean) => {
    if (autoHScrollTimer.current || !gridListRef.current) {
      return;
    }

    const maxOffset = gridListRef.current.getMaxOffset() ?? 0;
    const shouldCancel = isNextPage ? offsetX.value === maxOffset : offsetX.value === 0;

    if (shouldCancel) {
      return;
    }

    const scrollInterval = () => {
      const scrollTargetDiff = Math.abs(scrollTargetX.value - offsetX.value);
      const hasScrolledToTarget = scrollTargetDiff < 2;
      if (!hasScrolledToTarget || !gridListRef.current) {
        return;
      }

      const currentIndex = gridListRef.current.getCurrentScrollIndex();
      let nextVisibleDayIndex = 0;
      let nextOffset = 0;
      const reverse = isNextPage ? 1 : -1;
      if (numberOfDays === 1 || scrollByDay) {
        const colWidth = numberOfDays === 1 ? calendarGridWidth : columnWidth;
        nextVisibleDayIndex = currentIndex + 1 * reverse;
        nextOffset = nextVisibleDayIndex * colWidth;
      } else {
        nextVisibleDayIndex = currentIndex + numberOfDays * reverse;
        const pageIndex = Math.floor(nextVisibleDayIndex / numberOfDays);
        nextOffset = pageIndex * (columnWidth * numberOfDays);
      }

      const isScrollable = gridListRef.current.isScrollable(nextOffset);
      if (!isScrollable) {
        triggerDateChanged.current = undefined;
        clearInterval(autoHScrollTimer.current);
        autoHScrollTimer.current = undefined;
        return;
      }

      const nextDateUnix = gridListRef.current.getItemByIndex(nextVisibleDayIndex);
      if (!nextDateUnix) {
        triggerDateChanged.current = undefined;
        return;
      }

      scrollType.value = ScrollType.calendarGrid;
      triggerDateChanged.current = nextDateUnix;
      if (isNextPage) {
        let lastIndex = nextVisibleDayIndex + (numberOfDays - 1);
        if (numberOfDays === 1 || scrollByDay) {
          lastIndex = nextVisibleDayIndex + (numberOfDays - 1);
        }
        if (lastIndex > gridListRef.current.maxScrollIndex) {
          lastIndex = gridListRef.current.maxScrollIndex;
        }
      }

      scrollTargetX.value = nextOffset;
      offsetX.value = nextOffset;
      if (Platform.OS === 'web') {
        headerListRef.current?.scrollToIndex({ index: nextVisibleDayIndex, animated: true });
      }
      gridListRef.current?.scrollToIndex({ index: nextVisibleDayIndex, animated: true });
    };

    autoHScrollTimer.current = setInterval(scrollInterval, AUTO_SCROLL_INTERVAL);
  };

  const _stopAutoHScroll = () => {
    if (autoHScrollTimer.current) {
      clearInterval(autoHScrollTimer.current);
      autoHScrollTimer.current = undefined;
    }
  };

  useAnimatedReaction(
    () => dragPosition.value?.x ?? -1,
    (curX, prevX) => {
      if (
        isDraggingAnim.value &&
        curX !== prevX &&
        curX !== -1 &&
        (!isDraggingToCreate.value || dragToCreateMode === 'date-time') &&
        draggingMode.value !== 'top' &&
        draggingMode.value !== 'bottom'
      ) {
        const width = columnWidth * numberOfDays + hourWidth;
        const isAtLeftEdge = curX <= hourWidth - 10;
        const isAtRightEdge = width - curX <= 24;
        const isStartAutoScroll = isAtLeftEdge || isAtRightEdge;
        if (isStartAutoScroll) {
          runOnJS(_startAutoHScroll)(isAtRightEdge);
        } else {
          runOnJS(_stopAutoHScroll)();
        }
      }
    },
    [columnWidth, dragToCreateMode, isDraggingToCreate, draggingMode, numberOfDays, hourWidth]
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
          if (!initialDragData.value) {
            return;
          }

          const { startMinutes: initialStart, duration: initialDuration } = initialDragData.value;
          const diffY = targetOffset - offsetY.value;
          const minutes = diffY / minuteHeight.value;

          // TODO: position is not correct when switching mode
          // if (draggingMode.value === 'top' && draggingDuration.value - minutes < dragStep) {
          //   draggingMode.value = 'bottom';
          //   draggingStartMinutes.value = initialStart + (initialDuration - dragStep);
          //   roundedDragStartMinutes.value = draggingStartMinutes.value;
          //   draggingDuration.value = dragStep;
          //   roundedDragDuration.value = dragStep;
          // } else if (
          //   draggingMode.value === 'bottom' &&
          //   draggingDuration.value + minutes < dragStep
          // ) {
          //   draggingMode.value = 'top';
          //   draggingDuration.value = dragStep;
          //   roundedDragDuration.value = dragStep;
          // }

          if (draggingMode.value === 'bottom') {
            const nextDuration = Math.max(dragStep, draggingDuration.value + minutes);
            const roundedEndMinutes =
              Math.round((initialStart + nextDuration) / dragStep) * dragStep;
            const roundedDuration = roundedEndMinutes - initialStart;

            draggingDuration.value = nextDuration;
            roundedDragDuration.value = roundedDuration;
          } else {
            let nextStart = draggingStartMinutes.value + minutes;
            let nextRoundedStart = Math.floor(nextStart / dragStep) * dragStep;
            if (draggingMode.value === 'top') {
              const diffRounded = nextRoundedStart - nextStart;
              const nextDuration = draggingDuration.value - minutes;
              const nextRoundedDuration = nextDuration - diffRounded;
              if (nextDuration < dragStep) {
                const minStart = initialStart + (initialDuration - dragStep);
                nextStart = minStart;
                nextRoundedStart = minStart;
              }
              draggingDuration.value = Math.max(dragStep, nextDuration);
              roundedDragDuration.value = Math.max(dragStep, nextRoundedDuration);
            }
            draggingStartMinutes.value = nextStart;
            roundedDragStartMinutes.value = nextRoundedStart;
          }
          extraMinutes.value += minutes;
          offsetY.value = targetOffset;
          setNativeProps(verticalListRef, { contentOffset: { y: targetOffset, x: 0 } });
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
    () => dragPosition.value?.y ?? -1,
    (currentY, prevY) => {
      if (isDraggingAnim.value && currentY !== prevY && currentY !== -1) {
        const isAtTopEdge = currentY <= SCROLL_THRESHOLD;
        const isAtBottomEdge = scrollVisibleHeightAnim.value - currentY <= SCROLL_THRESHOLD;
        const isStartAutoScroll = isAtBottomEdge || isAtTopEdge;
        if (isStartAutoScroll) {
          const distFromEdge = isAtTopEdge
            ? Math.max(0, currentY)
            : Math.max(0, scrollVisibleHeightAnim.value - currentY);
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

  return (
    <DragContext.Provider value={dragContextValue}>
      <DragActionsContext.Provider value={dragActionsContextValue}>
        {children}
      </DragActionsContext.Provider>
    </DragContext.Provider>
  );
};

export default DragProvider;

export const useDragContext = () => {
  const context = useContext(DragContext);
  if (context === undefined) {
    throw new Error('useDragContext must be used within a DragProvider');
  }
  return context;
};

export const useDragActions = () => {
  const context = useContext(DragActionsContext);
  if (context === undefined) {
    throw new Error('useDragActions must be used within a DragProvider');
  }
  return context;
};
