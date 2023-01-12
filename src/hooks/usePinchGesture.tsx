import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTimelineCalendarContext } from '../context/TimelineProvider';
import { clampValues } from '../utils';
import useTimelineScroll from './useTimelineScroll';

const useZoomGesture = ({ enabled }: { enabled: boolean }) => {
  const {
    timeIntervalHeight,
    maxTimeIntervalHeight,
    minTimeIntervalHeight,
    isDragCreateActive,
    offsetY,
    pinchRef,
    isPinchActive,
    spaceFromTop,
  } = useTimelineCalendarContext();
  const { goToOffsetY } = useTimelineScroll();
  const focalY = useSharedValue(0);

  const _handleScrollView = (currentHeight: number, prevHeight: number) => {
    const pinchYNormalized =
      (focalY.value + offsetY.value + spaceFromTop) / prevHeight;
    const pinchYScale = currentHeight * pinchYNormalized;
    const y = pinchYScale - focalY.value;
    goToOffsetY(y, false);
  };

  useAnimatedReaction(
    () => timeIntervalHeight.value,
    (current, prev) => {
      if (!isPinchActive.value || !prev || current === prev) {
        return;
      }
      runOnJS(_handleScrollView)(current, prev);
    }
  );

  const startHeight = useSharedValue(timeIntervalHeight.value);
  const zoomGesture = Gesture.Pinch()
    .enabled(enabled)
    .onStart(() => {
      isPinchActive.value = true;
      startHeight.value = timeIntervalHeight.value;
    })
    .onUpdate((event) => {
      if (isDragCreateActive.value) {
        return;
      }
      const newHeight = startHeight.value * event.scale;
      const clampedHeight = clampValues(
        newHeight,
        minTimeIntervalHeight.value - 2,
        maxTimeIntervalHeight + 5
      );
      focalY.value = event.focalY;
      timeIntervalHeight.value = clampedHeight;
    })
    .onEnd(() => {
      const clampedHeight = clampValues(
        timeIntervalHeight.value,
        minTimeIntervalHeight.value,
        maxTimeIntervalHeight
      );
      timeIntervalHeight.value = withTiming(clampedHeight, undefined, () => {
        isPinchActive.value = false;
      });
    })
    .withRef(pinchRef);

  return { zoomGesture };
};

export default useZoomGesture;
