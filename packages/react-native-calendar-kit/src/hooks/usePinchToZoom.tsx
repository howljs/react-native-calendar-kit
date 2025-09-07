import { useCallback, useEffect, useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import type { GestureType } from 'react-native-gesture-handler';
import {
  scrollTo,
  setNativeProps,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useCalendar } from '../context/CalendarProvider';
import { clampValues } from '../utils/utils';
import { Platform } from 'react-native';

const SCALE_FACTOR = 0.5;
const SPRING_DAMPING = 15;
const SPRING_STIFFNESS = 100;
const BOUNDARY_PADDING = 8;

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
  const pinchGestureRef = useRef<GestureType | undefined>(undefined);
  const startScale = useSharedValue(1);
  const lastScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      startScale.value = lastScale.value;
      startOffsetY.value = offsetY.value;
    })
    .runOnJS(false)
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
      const scaleOrigin =
        (focalY + startOffsetY.value) / timeIntervalHeight.value;
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
        if (typeof setNativeProps === 'function') {
          setNativeProps(verticalListRef, {
            contentOffset: { y: newOffsetY, x: 0 },
          });
        } else {
          scrollTo(verticalListRef, 0, newOffsetY, true);
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
      const targetOffset = startOffsetY.value * scaleFactor;
      offsetY.value = targetOffset;
      if (typeof setNativeProps === 'function') {
        setNativeProps(verticalListRef, {
          contentOffset: { y: targetOffset, x: 0 },
        });
      } else {
        scrollTo(verticalListRef, 0, targetOffset, true);
      }
      // Reset scale values
      lastScale.value = 1;
      startScale.value = 1;
    })
    .enabled(allowPinchToZoom)
    .withRef(pinchGestureRef);

  const containerRef = useRef<HTMLElement | null>(null);
  const onWheel = useCallback(
    (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();

        // More stable scale calculation
        const scaleDelta = -event.deltaY * 0.01;
        const newScale = Math.max(0.1, lastScale.value + scaleDelta);

        // Get container bounds for proper focal point calculation
        const containerBounds = containerRef.current?.getBoundingClientRect();
        const containerTop = containerBounds?.top || 0;
        const focalY = event.clientY - containerTop;

        // Calculate height change based on scale difference
        const scaleFactor = newScale / lastScale.value;
        const newHeight = timeIntervalHeight.value * scaleFactor;

        // Clamp height within allowed bounds
        const clampedHeight = clampValues(
          newHeight,
          minTimeIntervalHeight,
          maxTimeIntervalHeight
        );

        // Only update if within bounds
        if (clampedHeight !== timeIntervalHeight.value) {
          const heightDiff = clampedHeight - timeIntervalHeight.value;

          // Calculate scaling origin point relative to current scroll position
          const scaleOrigin =
            (focalY + offsetY.value) / timeIntervalHeight.value;

          // Adjust scroll position to maintain focal point
          const newOffsetY = offsetY.value + heightDiff * scaleOrigin;

          timeIntervalHeight.value = clampedHeight;
          offsetY.value = newOffsetY;

          scrollTo(verticalListRef, 0, newOffsetY, false);
        }

        lastScale.value = newScale;
      }
    },
    [
      lastScale,
      offsetY,
      timeIntervalHeight,
      verticalListRef,
      minTimeIntervalHeight,
      maxTimeIntervalHeight,
    ]
  );

  useEffect(() => {
    if (!verticalListRef || Platform.OS !== 'web') {
      return;
    }

    const scrollNode = verticalListRef.current?.getScrollableNode?.();
    containerRef.current = scrollNode;
    scrollNode?.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      scrollNode?.removeEventListener('wheel', onWheel);
    };
  }, [onWheel, verticalListRef]);

  return { pinchGesture, pinchGestureRef };
};

export default usePinchToZoom;
