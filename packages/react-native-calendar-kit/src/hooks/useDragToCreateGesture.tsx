import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useCalendar } from '../context/CalendarProvider';
import { useDragEvent } from '../context/DragEventProvider';
import { roundMinutes } from '../utils/utils';

const useDragToCreateGesture = () => {
  const { offsetY, minuteHeight, spaceFromTop, start } = useCalendar();
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
  } = useDragEvent();

  const initialStartY = useSharedValue(0);

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

  const gesture = Gesture.Pan()
    .enabled(allowDragToCreate)
    .manualActivation(true)
    .onBegin((event) => {
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

      const initialStart = initialDragState.value.dragStart;
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
