import { useCallback, useRef } from 'react';
import { runOnUI } from 'react-native-reanimated';
import { MILLISECONDS_IN_DAY, ScrollType } from '../constants';
import { useActions } from '../context/ActionsProvider';
import { useCalendar } from '../context/CalendarProvider';
import {
  useDateChangedListener,
  useNotifyDateChanged,
} from '../context/VisibleDateProvider';
import { dateTimeToISOString, parseDateTime } from '../utils/dateUtils';

const useSyncedList = ({ id }: { id: ScrollType }) => {
  const {
    visibleDateUnix,
    triggerDateChanged,
    visibleDateUnixAnim,
    visibleWeeks,
    linkedScrollGroup,
  } = useCalendar();
  const currentUnix = useDateChangedListener();
  const notifyDateChanged = useNotifyDateChanged();
  const { onChange, onDateChanged } = useActions();
  const isDragging = useRef(false);
  const isPendingDateChanged = useRef<boolean>(false);

  const onScrollBeginDrag = useCallback(() => {
    isDragging.current = true;
  }, []);

  const onMomentumScrollBegin = useCallback(() => {
    if (isDragging.current) {
      isPendingDateChanged.current = true;
      isDragging.current = false;
    }
  }, []);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

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

        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }

        const currentDate = visibleDates[dayIndex];
        if (!currentDate) {
          triggerDateChanged.current = undefined;
          return;
        }

        if (visibleDateUnix.current !== currentDate) {
          const dateIsoStr = dateTimeToISOString(parseDateTime(currentDate));
          onChange?.(dateIsoStr);
          visibleDateUnix.current = currentDate;
          runOnUI(() => {
            visibleDateUnixAnim.value = currentDate;
          })();
        }

        debounceTimer.current = setTimeout(() => {
          const isSamePrevUnix = currentUnix === currentDate;
          if (isSamePrevUnix) {
            return;
          }

          if (
            (triggerDateChanged.current &&
              triggerDateChanged.current === currentDate) ||
            isPendingDateChanged.current
          ) {
            const dateIsoStr = dateTimeToISOString(parseDateTime(currentDate));
            triggerDateChanged.current = undefined;
            onDateChanged?.(dateIsoStr);
            notifyDateChanged(currentDate);
          }
          isPendingDateChanged.current = false;
        }, 150);
      }
    },
    [
      linkedScrollGroup,
      id,
      visibleDateUnix,
      visibleWeeks,
      triggerDateChanged,
      onChange,
      visibleDateUnixAnim,
      currentUnix,
      onDateChanged,
      notifyDateChanged,
    ]
  );

  return {
    onScrollBeginDrag,
    onMomentumScrollBegin,
    onVisibleColumnChanged,
  };
};

export default useSyncedList;
