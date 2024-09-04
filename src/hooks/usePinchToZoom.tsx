import { useRef } from 'react';
import { Gesture, type GestureType } from 'react-native-gesture-handler';
import { scrollTo, useSharedValue, withTiming } from 'react-native-reanimated';
import { useCalendar } from '../CalendarProvider';
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

  const startOffsetY = useSharedValue(offsetY.value);
  const pinchGestureRef = useRef<GestureType>();
  const startScale = useSharedValue(0);
  const pinchGesture = Gesture.Pinch()
    .onBegin(({ scale }) => {
      startScale.value = scale;
      startOffsetY.value = offsetY.value;
    })
    .onUpdate(({ focalY, scale, velocity }) => {
      if (velocity === 0) {
        startOffsetY.value = offsetY.value;
        return;
      }

      const diffScale = startScale.value - scale;
      const newScale = 1 - diffScale;
      const max = maxTimeIntervalHeight + 4;
      const min = minTimeIntervalHeight - 8;
      const nextHeight = newScale * timeIntervalHeight.value;
      const clampedHeight = clampValues(nextHeight, min, max);
      const clampedScale = clampedHeight / timeIntervalHeight.value;
      timeIntervalHeight.value = clampedHeight;
      const deltaY = startOffsetY.value + focalY;
      const newOffsetY = startOffsetY.value - deltaY * (1 - clampedScale);
      startOffsetY.value = newOffsetY;
      scrollTo(verticalListRef, 0, newOffsetY, false);
      startScale.value = scale;
    })
    .onEnd(({ focalY }) => {
      const clampedHeight = clampValues(
        timeIntervalHeight.value,
        minTimeIntervalHeight,
        maxTimeIntervalHeight
      );
      const clampedScale = clampedHeight / timeIntervalHeight.value;
      const deltaY = startOffsetY.value + focalY;
      const newOffsetY = startOffsetY.value - deltaY * (1 - clampedScale);
      scrollTo(verticalListRef, 0, newOffsetY, true);
      timeIntervalHeight.value = withTiming(clampedHeight, { duration: 250 });
    })
    .enabled(allowPinchToZoom)
    .withRef(pinchGestureRef);

  return { pinchGesture, pinchGestureRef };
};

export default usePinchToZoom;
