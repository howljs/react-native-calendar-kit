import { useRef } from 'react';
import type { GestureType } from 'react-native-gesture-handler';
import { Gesture } from 'react-native-gesture-handler';
import { scrollTo, setNativeProps, useSharedValue, withSpring } from 'react-native-reanimated';

import { useCalendar } from '../context/CalendarContext';
import { clampValues } from '../utils';

// Constants for gesture behavior
const SCALE_FACTOR = 0.5; // Controls how much the pinch affects the zoom
const SPRING_DAMPING = 15; // Controls bounce-back animation damping
const SPRING_STIFFNESS = 100; // Controls bounce-back animation stiffness
const BOUNDARY_PADDING = 8; // Extra padding for zoom boundaries

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
      // Calculate new scale and height values
      const newScale = startScale.value * scale;
      const scaledDiff = (newScale - lastScale.value) * SCALE_FACTOR;
      const newHeight = timeIntervalHeight.value * (1 + scaledDiff);
      // Calculate scaling origin point and height difference
      const scaleOrigin = (focalY + startOffsetY.value) / timeIntervalHeight.value;
      const heightDiff = newHeight - timeIntervalHeight.value;
      // Clamp height within allowed bounds
      const clampedHeight = clampValues(
        newHeight,
        minTimeIntervalHeight - BOUNDARY_PADDING,
        maxTimeIntervalHeight + BOUNDARY_PADDING
      );

      timeIntervalHeight.value = clampedHeight;
      if (
        clampedHeight > minTimeIntervalHeight - BOUNDARY_PADDING &&
        clampedHeight < maxTimeIntervalHeight + BOUNDARY_PADDING
      ) {
        const newOffsetY = startOffsetY.value + heightDiff * scaleOrigin;
        startOffsetY.value = newOffsetY;
        offsetY.value = newOffsetY;
        if (setNativeProps) {
          setNativeProps(verticalListRef, { contentOffset: { y: newOffsetY, x: 0 } });
        } else {
          scrollTo(verticalListRef, 0, newOffsetY, false);
        }
      }
      lastScale.value = newScale;
    })
    .onEnd(() => {
      // When gesture ends, animate to final values within bounds
      const finalHeight = clampValues(
        timeIntervalHeight.value,
        minTimeIntervalHeight,
        maxTimeIntervalHeight
      );
      timeIntervalHeight.value = withSpring(finalHeight, {
        damping: SPRING_DAMPING,
        stiffness: SPRING_STIFFNESS,
      });
      const scaleFactor = finalHeight / timeIntervalHeight.value;
      const newOffsetY = startOffsetY.value * scaleFactor;
      offsetY.value = newOffsetY;
      setNativeProps(verticalListRef, { contentOffset: { y: newOffsetY, x: 0 } });

      // Reset scale values
      lastScale.value = 1;
      startScale.value = 1;
    })
    .enabled(allowPinchToZoom)
    .withRef(pinchGestureRef);

  return { pinchGesture, pinchGestureRef };
};

export default usePinchToZoom;
