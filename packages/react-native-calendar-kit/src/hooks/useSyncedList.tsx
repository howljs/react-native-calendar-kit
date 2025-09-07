import { useCallback, useRef } from 'react';
import {
  runOnJS,
  runOnUI,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { MILLISECONDS_IN_DAY, ScrollType } from '../constants';
import { useActions } from '../context/ActionsProvider';
import { useCalendar } from '../context/CalendarProvider';
import { useNotifyDateChanged } from '../context/VisibleDateProvider';
import { dateTimeToISOString, parseDateTime } from '../utils/dateUtils';

const useSyncedList = ({ id }: { id: ScrollType }) => {
  const {
    visibleDateUnix,
    isTriggerMomentum,
    triggerDateChanged,
    visibleDateUnixAnim,
    visibleWeeks,
    linkedScrollGroup,
  } = useCalendar();
  const notifyDateChanged = useNotifyDateChanged();
  const { onChange, onDateChanged } = useActions();
  const isDragging = useSharedValue(false);

  const startDateUnix = useRef(0);
  const _updateScrolling = () => {
    startDateUnix.current = visibleDateUnix.current;
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
    onBeginDrag: () => {
      isDragging.value = true;
      runOnJS(_updateScrolling)();
    },
    onMomentumBegin: () => {
      if (isDragging.value) {
        runOnJS(_updateMomentum)(true);
      }
    },
    onMomentumEnd: () => {
      if (isDragging.value) {
        isDragging.value = false;
        runOnJS(_onMomentumEnd)();
      }
    },
  });

  const onVisibleColumnChanged = useCallback(
    (props: {
      index: number;
      column: number;
      columns: number;
      offset: number;
      extraScrollData: Record<string, any>;
    }) => {
      const { index: pageIndex, column, columns, extraScrollData } = props;
      const { visibleColumns, visibleDates } = extraScrollData;

      const activeId =
        linkedScrollGroup.getActiveId() || ScrollType.calendarGrid;
      if (activeId === id.toString() && visibleColumns && visibleDates) {
        const dayIndex = pageIndex * columns + column;
        const visibleStart = visibleDates[pageIndex * columns];
        const visibleEnd =
          visibleDates[pageIndex * columns + column + visibleColumns];

        if (visibleStart && visibleEnd) {
          const diffDays = Math.floor(
            (visibleEnd - visibleStart) / MILLISECONDS_IN_DAY
          );
          if (diffDays <= 7) {
            visibleWeeks.value = [visibleStart];
          } else {
            const nextWeekStart = visibleDates[pageIndex * columns + 7];
            if (nextWeekStart) {
              visibleWeeks.value = [visibleStart, nextWeekStart];
            }
          }
        }

        const currentDate = visibleDates[dayIndex];
        if (!currentDate) {
          triggerDateChanged.current = undefined;
          return;
        }

        if (visibleDateUnix.current !== currentDate) {
          const dateIsoStr = dateTimeToISOString(parseDateTime(currentDate));
          onChange?.(dateIsoStr);
          if (
            triggerDateChanged.current &&
            triggerDateChanged.current === currentDate
          ) {
            triggerDateChanged.current = undefined;
            onDateChanged?.(dateIsoStr);
            notifyDateChanged(currentDate);
          }
          visibleDateUnix.current = currentDate;
          runOnUI(() => {
            visibleDateUnixAnim.value = currentDate;
          })();
        }
      }
    },
    [
      linkedScrollGroup,
      id,
      visibleDateUnix,
      visibleWeeks,
      triggerDateChanged,
      onChange,
      onDateChanged,
      notifyDateChanged,
      visibleDateUnixAnim,
    ]
  );

  return { onScroll, onVisibleColumnChanged };
};

export default useSyncedList;
