import { useContext } from 'react';
import {
  runOnJS,
  scrollTo,
  useAnimatedReaction,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { ListType, SECONDS_IN_DAY } from '../constants';
import { useCalendarKit } from '../context/CalendarKitProvider';
import { DayViewContext } from '../context/DayViewProvider';
import { MultipleDayViewContext } from '../context/MultipleDayViewProvider';
import { parseUnixToDateStr } from '../utils/dateUtils';
import { isTwoFloatNumbersEqual } from '../utils/utils';

interface Props {
  id: ListType;
  onDateChanged?: (date: string) => void;
  onChange?: (date: string) => void;
}

const useSyncedLists = ({ id, onDateChanged, onChange }: Props) => {
  const {
    viewMode,
    pages,
    timelineIndex,
    numberOfColumns,
    isTriggerMomentum,
    visibleStartUnix,
    onChangeUnix,
  } = useCalendarKit();

  const { threeDayOffsets, dayBarAnimatedRef, timelineAnimatedRef, offsetX } =
    useContext(viewMode === 'day' ? DayViewContext : MultipleDayViewContext)!;

  const isPagingEnabled = viewMode !== 'threeDays';

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const newOffset = event.contentOffset.x;
      offsetX.value = newOffset;
      if (id === ListType.Timeline) {
        scrollTo(dayBarAnimatedRef, newOffset, 0, false);
      } else {
        scrollTo(timelineAnimatedRef, newOffset, 0, false);
      }

      const layoutWidth = event.layoutMeasurement.width;
      const pageIndex = Math.round(newOffset / layoutWidth);
      if (timelineIndex.value !== pageIndex) {
        timelineIndex.value = pageIndex;
      }
      const offsetByIndex = pageIndex * layoutWidth;
      const totalDays = viewMode === 'workWeek' ? 7 : numberOfColumns;
      const columnWidth = layoutWidth / totalDays;
      const columnIndex = Math.round(newOffset / columnWidth);
      const diffDays = Math.round(newOffset / columnWidth);
      const newStartUnix = pages[viewMode].minDate + diffDays * SECONDS_IN_DAY;
      const isSameUnix = onChangeUnix.value === newStartUnix;

      if (!isSameUnix) {
        onChangeUnix.value = newStartUnix;
      }

      let isFinished = isTwoFloatNumbersEqual(offsetByIndex, newOffset);
      if (viewMode === 'threeDays') {
        isFinished = isTwoFloatNumbersEqual(
          columnWidth * columnIndex,
          newOffset
        );
      }

      if (isFinished && isTriggerMomentum.value) {
        isTriggerMomentum.value = false;
        if (visibleStartUnix.value === newStartUnix) {
          return;
        }
        visibleStartUnix.value = newStartUnix;
      }
    },
    onMomentumBegin: () => {
      isTriggerMomentum.value = true;
    },
  });

  useAnimatedReaction(
    () => onChangeUnix.value,
    (next, prev) => {
      if (next !== prev && onChange) {
        const currentDateStr = parseUnixToDateStr(next);
        runOnJS(onChange)(currentDateStr);
      }
    }
  );

  useAnimatedReaction(
    () => visibleStartUnix.value,
    (next, prev) => {
      if (next !== prev && onDateChanged) {
        const currentDateStr = parseUnixToDateStr(next);
        runOnJS(onDateChanged)(currentDateStr);
      }
    }
  );

  return {
    onScroll,
    isPagingEnabled,
    snapToOffsets: threeDayOffsets,
  };
};

export default useSyncedLists;
