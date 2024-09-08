import { useCallback, useRef } from 'react';
import {
  runOnJS,
  runOnUI,
  scrollTo,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { ScrollType } from '../constants';
import { useActions } from '../context/ActionsProvider';
import { useCalendar } from '../context/CalendarProvider';
import { useNotifyDateChanged } from '../context/VisibleDateProvider';
import { dateTimeToISOString, parseDateTime } from '../utils/dateUtils';

const useSyncedList = ({ id }: { id: ScrollType }) => {
  const {
    scrollType,
    gridListRef,
    dayBarListRef,
    visibleDateUnix,
    calendarData,
    offsetX,
    isTriggerMomentum,
    triggerDateChanged,
    visibleDateUnixAnim,
    columns,
  } = useCalendar();
  const notifyDateChanged = useNotifyDateChanged();
  const { onChange, onDateChanged } = useActions();

  const startDateUnix = useRef(0);
  const _updateScrolling = (isScrolling: boolean) => {
    startDateUnix.current = visibleDateUnix.current;
    scrollType.current = isScrolling ? id : null;
  };

  const _updateMomentum = (isTrigger: boolean) => {
    isTriggerMomentum.current = isTrigger;
  };

  const _onMomentumEnd = () => {
    if (
      isTriggerMomentum.current &&
      startDateUnix.current !== visibleDateUnix.current
    ) {
      triggerDateChanged.current = undefined;
      onDateChanged?.(
        dateTimeToISOString(parseDateTime(visibleDateUnix.current))
      );
      notifyDateChanged(visibleDateUnix.current);
      isTriggerMomentum.current = false;
    }
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const x = event.contentOffset.x;
      offsetX.value = x;
      if (id === ScrollType.dayBar) {
        scrollTo(gridListRef, offsetX.value, 0, false);
      } else {
        scrollTo(dayBarListRef, offsetX.value, 0, false);
      }
    },
    onBeginDrag: () => {
      runOnJS(_updateScrolling)(true);
    },
    onMomentumBegin: () => {
      runOnJS(_updateMomentum)(true);
    },
    onMomentumEnd: () => {
      runOnJS(_onMomentumEnd)();
    },
  });

  const onVisibleColumnChanged = useCallback(
    (props: { index: number; column: number; offset: number }) => {
      if (scrollType.current !== null && scrollType.current === id) {
        const { index: pageIndex, column } = props;
        const dayIndex = pageIndex * columns + column;
        const visibleStart = calendarData.visibleDatesArray[dayIndex];
        if (!visibleStart) {
          triggerDateChanged.current = undefined;
          return;
        }

        if (visibleDateUnix.current !== visibleStart) {
          const dateIsoStr = dateTimeToISOString(parseDateTime(visibleStart));
          onChange?.(dateIsoStr);
          if (triggerDateChanged.current === visibleStart) {
            triggerDateChanged.current = undefined;
            onDateChanged?.(dateIsoStr);
            notifyDateChanged(visibleStart);
          }
          visibleDateUnix.current = visibleStart;
          runOnUI(() => {
            visibleDateUnixAnim.value = visibleStart;
          })();
        }
      }
    },
    [
      scrollType,
      id,
      columns,
      calendarData.visibleDatesArray,
      visibleDateUnix,
      visibleDateUnixAnim,
      onChange,
      triggerDateChanged,
      onDateChanged,
      notifyDateChanged,
    ]
  );

  return { onScroll, onVisibleColumnChanged };
};

export default useSyncedList;
