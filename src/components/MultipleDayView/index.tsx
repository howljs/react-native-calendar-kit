import React, { useImperativeHandle } from 'react';
import { SECONDS_IN_DAY } from '../../constants';
import { useCalendarKit } from '../../context/CalendarKitProvider';
import { useEventsController } from '../../context/EventsProvider';
import { useMultipleDayView } from '../../context/MultipleDayViewProvider';
import { useScrollController } from '../../context/ScrollControllerProvider';
import { CalendarInnerProps, CalendarKitHandle } from '../../types';
import { clampValues } from '../../utils/utils';
import MultipleDayBody from './MultipleDayBody';
import MultipleDayHeader from './MultipleDayHeader';
import { useNowIndicator } from '../../context/NowIndicatorProvider';

const MultipleDayView = (
  {
    onDateChanged,
    locale = 'en',
    OutsideDateRangeComponent,
    unavailableHours,
    holidays,
    sendTimelineBorderToBack,
    onChange,
    onPressEvent,
    onLongPressEvent,
    onPressDayNumber,
  }: CalendarInnerProps,
  ref?: React.ForwardedRef<CalendarKitHandle>
) => {
  const {
    pages,
    numberOfColumns,
    viewMode,
    timelineWidth,
    start,
    timeIntervalHeight,
    scrollVisibleHeight,
    timelineIndex,
    verticalListRef,
    isTriggerMomentum,
  } = useCalendarKit();
  const { currentUnixTime } = useNowIndicator();
  const { timelineAnimatedRef, timelineRef } = useMultipleDayView();
  const { notifyDataChanged } = useEventsController();
  const headerProps = {
    locale,
    onChange,
    onPressDayNumber,
    onPressEvent,
    onLongPressEvent,
  };
  const bodyProps = {
    OutsideDateRangeComponent,
    unavailableHours,
    holidays,
    sendTimelineBorderToBack,
    onChange,
    onPressEvent,
    onDateChanged,
    onLongPressEvent,
  };
  const { syncPositionByDate } = useScrollController();

  useImperativeHandle(
    ref,
    () => ({
      goToDate: (props) => {
        const numOfDays = viewMode === 'workWeek' ? 7 : numberOfColumns;
        const dateUnix = props?.date
          ? Math.floor(props.date.getTime() / 1000)
          : currentUnixTime.value;
        const pageIndex = Math.floor(
          (dateUnix - pages[viewMode].minDate) / SECONDS_IN_DAY / numOfDays
        );
        let offsetX = pageIndex * timelineWidth;

        if (viewMode === 'threeDays') {
          const dateByIndex = pages.threeDays.data[pageIndex] ?? 0;
          const diffDays = Math.floor(
            (dateUnix - dateByIndex) / SECONDS_IN_DAY
          );
          const columnWidth = timelineWidth / numberOfColumns;
          offsetX = offsetX + diffDays * columnWidth;
        }
        const maxOffset = (pages[viewMode].data.length - 1) * timelineWidth;
        const clampedOffset = clampValues(offsetX, 0, maxOffset);
        const currentOffset = timelineRef.current?.getCurrentScrollOffset();
        if (currentOffset !== clampedOffset) {
          isTriggerMomentum.value = true;
          timelineAnimatedRef.current?.scrollTo({
            x: clampedOffset,
            y: 0,
            animated: props?.animatedDate ?? false,
          });
        }

        if (props?.hourScroll) {
          const selectedDate = props?.date
            ? props?.date
            : new Date(currentUnixTime.value * 1000);
          const minutes =
            selectedDate.getHours() * 60 + selectedDate.getMinutes();
          const subtractMinutes = minutes - start * 60;
          const yFromMinutes =
            (subtractMinutes * timeIntervalHeight.value) / 60;
          const newOffsetY = yFromMinutes - scrollVisibleHeight.value / 2;
          verticalListRef.current?.scrollTo({
            x: 0,
            y: newOffsetY,
            animated: props.animatedHour,
          });
        }
      },
      goToHour: (hour: number, animated?: boolean) => {
        const minutes = (hour - start) * 60;
        const position = (minutes * timeIntervalHeight.value) / 60;
        verticalListRef.current?.scrollTo({
          x: 0,
          y: position,
          animated: animated || false,
        });
      },
      goToNextPage: (animated?: boolean) => {
        const nextIndex = timelineIndex.value + 1;
        if (nextIndex > pages[viewMode].data.length - 1) {
          return;
        }
        isTriggerMomentum.value = true;
        const nextOffset = nextIndex * timelineWidth;
        timelineAnimatedRef.current?.scrollTo({
          x: nextOffset,
          y: 0,
          animated: animated || false,
        });
      },
      goToPrevPage: (animated?: boolean) => {
        const prevIndex = timelineIndex.value - 1;
        if (prevIndex < 0) {
          return;
        }
        isTriggerMomentum.value = true;
        const nextOffset = prevIndex * timelineWidth;
        timelineAnimatedRef.current?.scrollTo({
          x: nextOffset,
          y: 0,
          animated: animated || false,
        });
      },
      notifyDataChanged: notifyDataChanged,
      syncDate: syncPositionByDate,
    }),
    [
      currentUnixTime.value,
      isTriggerMomentum,
      notifyDataChanged,
      numberOfColumns,
      pages,
      scrollVisibleHeight.value,
      start,
      syncPositionByDate,
      timeIntervalHeight,
      timelineAnimatedRef,
      timelineIndex.value,
      timelineRef,
      timelineWidth,
      verticalListRef,
      viewMode,
    ]
  );

  return (
    <React.Fragment>
      <MultipleDayHeader {...headerProps} />
      <MultipleDayBody {...bodyProps} />
    </React.Fragment>
  );
};

export default React.forwardRef(MultipleDayView);
