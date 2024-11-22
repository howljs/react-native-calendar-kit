import {
  dateTimeToISOString,
  parseDateTime,
  useActions,
  useCalendar,
  useNotifyDateChanged,
} from '@calendar-kit/core';
import { useCallback, useEffect, useRef } from 'react';
import {
  runOnJS,
  scrollTo,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import { ScrollType } from '../constants';

const useSyncedList = ({ id }: { id: ScrollType }) => {
  const {
    scrollType,
    gridListRef,
    headerListRef,
    visibleDateUnix,
    offsetX,
    triggerDateChanged,
    visibleDateUnixAnim,
  } = useCalendar();
  const isTriggerMomentum = useRef(false);
  const notifyDateChanged = useNotifyDateChanged();
  const { onChange, onDateChanged } = useActions();
  const isDayBarListRefReady = useSharedValue(false);
  const isGridListRefReady = useSharedValue(false);
  const startDateUnix = useRef(0);
  const _updateScrolling = () => {
    startDateUnix.current = visibleDateUnix.current;
  };

  const onMomentumBegin = () => {
    isTriggerMomentum.current = true;
  };

  const _onMomentumEnd = () => {
    if (isTriggerMomentum.current && startDateUnix.current !== visibleDateUnix.current) {
      triggerDateChanged.current = undefined;
      onDateChanged?.(dateTimeToISOString(parseDateTime(visibleDateUnix.current)));
      notifyDateChanged(visibleDateUnix.current);
      isTriggerMomentum.current = false;
    }
  };

  useEffect(() => {
    isDayBarListRefReady.value = !!headerListRef?.current;
    isGridListRefReady.value = !!gridListRef?.current;
  }, [headerListRef, gridListRef, isDayBarListRefReady, isGridListRefReady]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (scrollType.value !== id) {
        return;
      }

      const x = event.contentOffset.x;
      offsetX.value = x;
      if (id === ScrollType.dayBar) {
        if (isGridListRefReady.value) {
          scrollTo(gridListRef, offsetX.value, 0, false);
        }
      } else if (id === ScrollType.calendarGrid) {
        if (isDayBarListRefReady.value) {
          scrollTo(headerListRef, offsetX.value, 0, false);
        }
      }
    },
    onBeginDrag: () => {
      scrollType.value = id;
      runOnJS(_updateScrolling)();
    },
    onMomentumBegin: () => {
      if (scrollType.value === id) {
        runOnJS(onMomentumBegin)();
      }
    },
    onMomentumEnd: () => {
      if (scrollType.value === id) {
        runOnJS(_onMomentumEnd)();
      }
    },
  });

  const onVisibleItemChanged = useCallback(
    (item: number) => {
      if (scrollType.value !== id) {
        return;
      }
      visibleDateUnix.current = item;
      visibleDateUnixAnim.value = item;

      // Update visible date and notify of change
      const dateIsoStr = dateTimeToISOString(parseDateTime(item));
      onChange?.(dateIsoStr);

      // Handle triggered date change if matches current date
      if (triggerDateChanged.current && triggerDateChanged.current === item) {
        triggerDateChanged.current = undefined;
        onDateChanged?.(dateIsoStr);
        notifyDateChanged(item);
      }
    },
    [
      id,
      notifyDateChanged,
      onChange,
      onDateChanged,
      scrollType,
      triggerDateChanged,
      visibleDateUnix,
      visibleDateUnixAnim,
    ]
  );

  return { onScroll, onVisibleItemChanged };
};

export default useSyncedList;
