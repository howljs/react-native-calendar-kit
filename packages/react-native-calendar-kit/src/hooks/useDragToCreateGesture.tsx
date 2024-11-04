import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useCalendar } from '../context/CalendarProvider';
import { useDragEvent } from '../context/DragEventProvider';
import { clampValues, findNearestNumber, roundMinutes } from '../utils/utils';

const useDragToCreateGesture = ({
  mode,
}: {
  mode: 'duration' | 'date-time';
}) => {
  const {
    offsetY,
    minuteHeight,
    spaceFromTop,
    start,
    columnWidthAnim,
    hourWidth,
    calendarData,
    visibleDateUnixAnim,
    columns,
  } = useCalendar();
  const {
    allowDragToCreate,
    dragStartMinutes,
    dragStartUnix,
    roundedDragStartMinutes,
    dragStep,
    dragPosition,
    roundedDragDuration,
    dragDuration,
    dragSelectedType,
    initialDragState,
    isDraggingCreateAnim,
    isDraggingCreate,
    isDraggingAnim,
    extraMinutes,
    dragX,
    roundedDragStartUnix,
  } = useDragEvent();

  const initialStartY = useSharedValue(0);
  const initialStartX = useSharedValue(0);

  const computeDragValues = (
    initialStart: number,
    newMinutes: number,
    step: number
  ) => {
    'worklet';
    let newDragSelectedType: 'top' | 'bottom' | undefined;
    let newDragStart = initialStart;
    let newRoundedDragStart = initialStart;
    let newDragDuration = step;
    let newRoundedDragDuration = step;

    if (newMinutes > initialStart + step) {
      newDragSelectedType = 'bottom';
      newDragStart = initialStart;
      newDragDuration = newMinutes - initialStart;
      newRoundedDragDuration = roundMinutes(newMinutes, step) - initialStart;
    } else if (newMinutes < initialStart) {
      newDragSelectedType = 'top';
      newDragStart = newMinutes;
      newRoundedDragStart = Math.floor(newMinutes / step) * step;
      newDragDuration = initialStart - newMinutes + step;
      newRoundedDragDuration = initialStart - newRoundedDragStart + step;
    }

    return {
      newDragSelectedType,
      newDragStart,
      newRoundedDragStart,
      newDragDuration,
      newRoundedDragDuration,
    };
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
    .enabled(allowDragToCreate)
    .manualActivation(true)
    .onBegin((event) => {
      initialStartX.value = event.x;
      initialStartY.value = event.translationY;
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
      const initialStart = initialDragState.value.dragStart;

      if (mode === 'duration') {
        const newMinutes =
          Math.floor((offsetY.value + y - spaceFromTop) / minuteHeight.value) +
          start;

        const {
          newDragSelectedType,
          newDragStart,
          newRoundedDragStart,
          newDragDuration,
          newRoundedDragDuration,
        } = computeDragValues(initialStart, newMinutes, dragStep);

        dragSelectedType.value = newDragSelectedType;
        dragStartMinutes.value = newDragStart;
        roundedDragStartMinutes.value = newRoundedDragStart;
        dragDuration.value = newDragDuration;
        roundedDragDuration.value = newRoundedDragDuration;
      } else {
        updateDragStartPosition(translationY, initialStart);
        updateDragPositionHorizontal(
          translationX,
          initialDragState.value.dragStartUnix,
          initialStartX.value
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
      if (isDraggingCreateAnim.value && isDraggingAnim.value) {
        state.activate();
      } else {
        state.fail();
      }
    })
    .onTouchesUp(() => {
      if (isDraggingCreateAnim.value && isDraggingAnim.value) {
        isDraggingCreateAnim.value = false;
        isDraggingAnim.value = false;
        dragPosition.value = {
          x: -1,
          y: -1,
          translationX: -1,
          translationY: -1,
        };
      }
    });

  return {
    gesture,
    isDragging: isDraggingCreate,
  };
};

export default useDragToCreateGesture;
