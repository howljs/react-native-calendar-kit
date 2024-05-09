import { useRef } from 'react';
import { Gesture, type GestureType } from 'react-native-gesture-handler';
import { scrollTo, useSharedValue, withTiming } from 'react-native-reanimated';
import { useCalendar } from '../context/CalendarProvider';
import { clampValues } from '../utils/utils';

const usePinchToZoom = () => {
  const {
    verticalListRef,
    maxTimeIntervalHeight,
    minTimeIntervalHeight,
    timeIntervalHeight,
    offsetY,
    allowPinchToZoom,
  } = useCalendar();

  const pinchGestureRef = useRef<GestureType>();
  const startScale = useSharedValue(0);
  const pinchGesture = Gesture.Pinch()
    .onBegin(({ scale }) => {
      startScale.value = scale;
    })
    .onUpdate(({ focalY, scale, velocity }) => {
      const diffScale = startScale.value - scale;
      const newScale = 1 - diffScale;
      const max = maxTimeIntervalHeight + 16;
      const min = minTimeIntervalHeight - 16;
      const nextHeight = newScale * timeIntervalHeight.value;
      startScale.value = scale;
      if (nextHeight > max || nextHeight < min || velocity === 0) {
        return;
      }
      timeIntervalHeight.value = nextHeight;
      const deltaY = offsetY.value + focalY;
      const newOffsetY = offsetY.value - deltaY * (1 - newScale);
      scrollTo(verticalListRef, 0, newOffsetY, false);
    })
    .onEnd(({ focalY }) => {
      const nextHeight = clampValues(
        timeIntervalHeight.value,
        minTimeIntervalHeight,
        maxTimeIntervalHeight
      );
      const newScale = nextHeight / timeIntervalHeight.value;
      if (newScale === 1) {
        return;
      }
      timeIntervalHeight.value = withTiming(nextHeight, { duration: 250 });
      const deltaY = offsetY.value + focalY;
      const newOffsetY = offsetY.value - deltaY * (1 - newScale);
      scrollTo(verticalListRef, 0, newOffsetY, true);
    })
    .enabled(allowPinchToZoom)
    .withRef(pinchGestureRef);

  return { pinchGesture, pinchGestureRef };
};

export default usePinchToZoom;
