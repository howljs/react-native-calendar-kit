import { useCallback, useRef } from 'react';
import {
  runOnJS,
  scrollTo,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { MILLISECONDS_IN_DAY, ScrollType } from '../constants';
import { useActions } from '../context/ActionsProvider';
import { useCalendar } from '../context/CalendarProvider';
import { useNotifyDataChanged } from '../context/EventsProvider';
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
    numberOfDays,
    triggerDateChanged,
    visibleDateUnixAnim,
  } = useCalendar();
  const notifyDataChanged = useNotifyDataChanged();
  const { onChange, onDateChanged } = useActions();
  const minDate = calendarData.minDateUnix;

  const startDateUnix = useRef(0);
  const nextOffset = useRef(0);
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
      notifyDataChanged(visibleDateUnix.current);
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
        const { index: pageIndex, column, offset } = props;
        const columns = numberOfDays === 1 ? 1 : 7;
        const visibleStart =
          minDate +
          pageIndex * columns * MILLISECONDS_IN_DAY +
          column * MILLISECONDS_IN_DAY;
        if (onChange && visibleDateUnix.current !== visibleStart) {
          const dateIsoStr = dateTimeToISOString(parseDateTime(visibleStart));
          onChange(dateIsoStr);

          if (
            triggerDateChanged.current &&
            triggerDateChanged.current === visibleStart
          ) {
            triggerDateChanged.current = undefined;
            onDateChanged?.(dateIsoStr);
            notifyDataChanged(visibleStart);
          }
        }

        nextOffset.current = offset;
        visibleDateUnix.current = visibleStart;
        visibleDateUnixAnim.value = visibleStart;
      }
    },
    [
      id,
      minDate,
      notifyDataChanged,
      numberOfDays,
      onChange,
      onDateChanged,
      scrollType,
      triggerDateChanged,
      visibleDateUnix,
      visibleDateUnixAnim,
    ]
  );

  return { onScroll, onVisibleColumnChanged };
};

export default useSyncedList;
