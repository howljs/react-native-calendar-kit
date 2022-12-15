import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTimelineCalendarContext } from '../context/TimelineProvider';
import useTimelineScroll from './useTimelineScroll';

const useZoomGesture = ({ enabled }: { enabled: boolean }) => {
  const {
    timeIntervalHeight,
    maxTimeIntervalHeight,
    minTimeIntervalHeight,
    isDragCreateActive,
    offsetY,
    pinchRef,
  } = useTimelineCalendarContext();
  const { goToOffsetY } = useTimelineScroll();
  const savedScale = useSharedValue(1);
  const startOffsetY = useSharedValue(0);

  const zoomGesture = Gesture.Pinch()
    .enabled(enabled)
    .withRef(pinchRef)
    .runOnJS(true)
    .onStart((event) => {
      const startY =
        offsetY.value + event.focalY - timeIntervalHeight.value * 2;
      startOffsetY.value = Math.max(0, startY / timeIntervalHeight.value);
    })
    .onUpdate((event) => {
      if (isDragCreateActive.value) {
        return;
      }
      const scale = 1 - (savedScale.value - event.scale);
      const newHeight = Math.max(
        minTimeIntervalHeight.value - 2,
        Math.min(timeIntervalHeight.value * scale, maxTimeIntervalHeight)
      );

      timeIntervalHeight.value = newHeight;
      if (
        newHeight < maxTimeIntervalHeight &&
        newHeight > minTimeIntervalHeight.value
      ) {
        const newOffsetY = startOffsetY.value * newHeight;
        runOnJS(goToOffsetY)(newOffsetY, false);
      }
      savedScale.value = event.scale;
    })
    .onEnd(() => {
      const newHeight = Math.max(
        minTimeIntervalHeight.value,
        Math.min(timeIntervalHeight.value, maxTimeIntervalHeight)
      );
      timeIntervalHeight.value = withTiming(newHeight);
      savedScale.value = 1;
      startOffsetY.value = 0;
    });

  return { zoomGesture };
};

export default useZoomGesture;
