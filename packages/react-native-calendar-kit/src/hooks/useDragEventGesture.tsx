import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useCalendar } from '../context/CalendarProvider';
import { useDragEvent } from '../context/DragEventProvider';
import { clampValues, findNearestNumber, roundMinutes } from '../utils/utils';

const useDragEventGesture = () => {
  const {
    minuteHeight,
    columnWidthAnim,
    hourWidth,
    visibleDateUnixAnim,
    calendarData,
    columns,
  } = useCalendar();
  const {
    isDraggingAnim,
    isDragging,
    dragStartMinutes,
    dragStartUnix,
    roundedDragStartMinutes,
    dragStep,
    dragPosition,
    roundedDragStartUnix,
    roundedDragDuration,
    dragDuration,
    dragSelectedType,
    extraMinutes,
    initialDragState,
    isDraggingCreateAnim,
    dragX,
  } = useDragEvent();

  const initialX = useSharedValue(0);

  const findNearestIndex = (visibleUnix: number): number | undefined => {
    'worklet';
    let visibleIndex = calendarData.visibleDatesArray.indexOf(visibleUnix);
    if (visibleIndex === -1) {
      const nearestVisibleUnix = findNearestNumber(
        calendarData.visibleDatesArray,
        visibleUnix
      );
      const nearestVisibleIndex =
        calendarData.visibleDates[nearestVisibleUnix]?.index;
      if (nearestVisibleIndex === undefined) {
        return undefined;
      }
      visibleIndex = nearestVisibleIndex;
    }
    return visibleIndex;
  };

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

    dragDuration.value = nextDuration;
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

    dragStartMinutes.value = newDragStart;
    roundedDragStartMinutes.value = roundedDragStart;
    dragDuration.value = nextDuration;
    roundedDragDuration.value = nextRoundedDuration;
  };

  const updateDragStartPosition = (
    translationY: number,
    initialStart: number
  ) => {
    'worklet';
    const initialY = (initialStart + extraMinutes.value) * minuteHeight.value;
    const newY = initialY + translationY;
    const newDragStart = Math.floor(newY / minuteHeight.value);
    const roundedDragStart = roundMinutes(newDragStart, dragStep, 'floor');
    dragStartMinutes.value = newDragStart;
    roundedDragStartMinutes.value = roundedDragStart;
  };

  const updateDragPositionHorizontal = (
    translationX: number,
    initialDayUnix: number,
    initialXPosition: number
  ) => {
    'worklet';
    const initialDayUnixIndex = findNearestIndex(initialDayUnix);
    const visibleIndex = findNearestIndex(visibleDateUnixAnim.value);

    if (visibleIndex === undefined || initialDayUnixIndex === undefined) {
      return;
    }

    const dayIndexOffset = initialDayUnixIndex - visibleIndex;
    const extraX =
      initialXPosition - dayIndexOffset * columnWidthAnim.value - hourWidth;
    const initialOffset = dayIndexOffset * columnWidthAnim.value;
    const newX = initialOffset + translationX + extraX;
    const newDragDayIndex = Math.floor(newX / columnWidthAnim.value);
    const clampedDragDayIndex = clampValues(newDragDayIndex, 0, columns - 1);
    const nextDayIndex = visibleIndex + clampedDragDayIndex;
    const targetDayUnix = calendarData.visibleDatesArray[nextDayIndex];

    if (!targetDayUnix) {
      return;
    }

    dragStartUnix.value = targetDayUnix;
    roundedDragStartUnix.value = targetDayUnix;
  };

  const gesture = Gesture.Pan()
    .manualActivation(true)
    .onBegin(({ x }) => {
      initialX.value = x;
    })
    .onStart(() => {
      initialDragState.value = {
        dragStart: dragStartMinutes.value,
        dragStartUnix: dragStartUnix.value,
        dragDuration: dragDuration.value,
      };
    })
    .onUpdate(({ translationX, translationY, x, y }) => {
      dragPosition.value = { x, y, translationX, translationY };
      dragX.value = x;
      const {
        dragStart: initialStart,
        dragStartUnix: initialDayUnix,
        dragDuration: initialDuration,
      } = initialDragState.value;

      if (dragSelectedType.value === 'bottom') {
        updateDragDurationForBottom(
          translationY,
          initialStart,
          initialDuration
        );
      } else if (dragSelectedType.value === 'top') {
        updateDragDurationForTop(translationY, initialStart, initialDuration);
      } else {
        updateDragStartPosition(translationY, initialStart);
        updateDragPositionHorizontal(
          translationX,
          initialDayUnix,
          initialX.value
        );
      }
    })
    .onEnd(() => {
      dragStartMinutes.value = withTiming(roundedDragStartMinutes.value, {
        duration: 150,
      });
      dragDuration.value = withTiming(roundedDragDuration.value, {
        duration: 150,
      });
    })
    .onTouchesMove((_event, state) => {
      if (isDraggingAnim.value && !isDraggingCreateAnim.value) {
        state.activate();
      } else {
        state.fail();
      }
    })
    .onTouchesUp(() => {
      if (isDraggingAnim.value && !isDraggingCreateAnim.value) {
        isDraggingAnim.value = false;
        dragPosition.value = {
          x: -1,
          y: -1,
          translationX: -1,
          translationY: -1,
        };
      }
    });

  return { gesture, isDragging };
};

export default useDragEventGesture;
