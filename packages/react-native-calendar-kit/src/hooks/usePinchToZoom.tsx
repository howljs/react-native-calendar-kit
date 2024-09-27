import { useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import type { GestureType } from 'react-native-gesture-handler';
import { scrollTo, useSharedValue, withSpring } from 'react-native-reanimated';
import { useCalendar } from '../context/CalendarProvider';
import { clampValues } from '../utils/utils';

const SCALE_FACTOR = 0.5;

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
  const startScale = useSharedValue(1);
  const lastScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      startScale.value = lastScale.value;
      startOffsetY.value = offsetY.value;
    })
    .onUpdate(({ focalY, scale, velocity }) => {
      if (velocity === 0) {
        startOffsetY.value = offsetY.value;
        return;
      }

      const newScale = startScale.value * scale;
      const scaledDiff = (newScale - lastScale.value) * SCALE_FACTOR;
      const newHeight = timeIntervalHeight.value * (1 + scaledDiff);

      const scaleOrigin =
        (focalY + startOffsetY.value) / timeIntervalHeight.value;
      const heightDiff = newHeight - timeIntervalHeight.value;

      const clampedHeight = clampValues(
        newHeight,
        minTimeIntervalHeight - 8,
        maxTimeIntervalHeight + 8
      );

      timeIntervalHeight.value = clampedHeight;

      if (
        clampedHeight > minTimeIntervalHeight - 8 &&
        clampedHeight < maxTimeIntervalHeight + 8
      ) {
        const newOffsetY = startOffsetY.value + heightDiff * scaleOrigin;
        startOffsetY.value = newOffsetY;
        scrollTo(verticalListRef, 0, newOffsetY, false);
      }
      lastScale.value = newScale;
    })
    .onEnd(() => {
      const finalHeight = clampValues(
        timeIntervalHeight.value,
        minTimeIntervalHeight,
        maxTimeIntervalHeight
      );
      timeIntervalHeight.value = withSpring(finalHeight, {
        damping: 15,
        stiffness: 100,
      });
      const scaleFactor = finalHeight / timeIntervalHeight.value;
      const newOffsetY = startOffsetY.value * scaleFactor;
      scrollTo(verticalListRef, 0, newOffsetY, true);

      lastScale.value = 1;
      startScale.value = 1;
    })
    .enabled(allowPinchToZoom)
    .withRef(pinchGestureRef);

  return { pinchGesture, pinchGestureRef };
};

export default usePinchToZoom;
