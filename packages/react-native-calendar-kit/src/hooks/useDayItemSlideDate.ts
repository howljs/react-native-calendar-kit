import { useCallback, useRef, useState } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import {
  runOnJS,
  runOnUI,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface DayItemSlideDateProps {
  /** Track date changes only while the day item is rendered */
  enabled: boolean;
  /** Instant visible date (unix), updated as the visible column changes */
  visibleDateUnixAnim: SharedValue<number>;
}

/**
 * Date for the day item overlay, derived from the instant (non-debounced)
 * visible date shared value to avoid stale-then-flash updates. Dips the
 * overlay opacity once per real date change.
 */
const useDayItemSlideDate = ({
  enabled,
  visibleDateUnixAnim,
}: DayItemSlideDateProps) => {
  const dateRef = useRef<number | undefined>(visibleDateUnixAnim.value);
  const [date, setDate] = useState<number | undefined>(
    visibleDateUnixAnim.value
  );
  const opacity = useSharedValue(1);

  const updateDate = useCallback(
    (nextDate: number) => {
      if (nextDate === dateRef.current) {
        return;
      }
      dateRef.current = nextDate;
      setDate(nextDate);
      runOnUI(() => {
        opacity.value = 0;
        opacity.value = withTiming(1, { duration: 300 });
      })();
    },
    [opacity]
  );

  useAnimatedReaction(
    () => (enabled ? visibleDateUnixAnim.value : -1),
    (nextDate, prevDate) => {
      if (prevDate !== null && nextDate !== prevDate) {
        runOnJS(updateDate)(nextDate);
      }
    },
    [enabled, updateDate]
  );
  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return { date, fadeStyle };
};

export default useDayItemSlideDate;
