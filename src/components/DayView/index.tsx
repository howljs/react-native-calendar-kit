import React, { useImperativeHandle } from 'react';
import { SECONDS_IN_DAY } from '../../constants';
import { useCalendarKit } from '../../context/CalendarKitProvider';
import { useDayView } from '../../context/DayViewProvider';
import { useEventsController } from '../../context/EventsProvider';
import { CalendarInnerProps, CalendarKitHandle } from '../../types';
import { clampValues } from '../../utils/utils';
import DayViewBody from './DayViewBody';
import DayViewHeader from './DayViewHeader';
import { useScrollController } from '../../context/ScrollControllerProvider';
import { useNowIndicator } from '../../context/NowIndicatorProvider';

const DayView = (
  {
    onChange,
    onDateChanged,
    unavailableHours,
    holidays,
    locale = 'en',
    sendTimelineBorderToBack,
    onPressEvent,
    onPressDayNumber,
    onLongPressEvent,
  }: CalendarInnerProps,
  ref?: React.ForwardedRef<CalendarKitHandle>
) => {
  const {
    pages,
    calendarSize,
    start,
    timeIntervalHeight,
    scrollVisibleHeight,
    timelineIndex,
    verticalListRef,
  } = useCalendarKit();
  const { currentUnixTime } = useNowIndicator();
  const { timelineRef, timelineAnimatedRef } = useDayView();
  const headerProps = {
    onDateChanged,
    locale,
    onChange,
    onPressDayNumber,
    onPressEvent,
    onLongPressEvent,
  };
  const bodyProps = {
    onChange,
    onDateChanged,
    unavailableHours,
    holidays,
    sendTimelineBorderToBack,
    onPressEvent,
    onLongPressEvent,
  };
  const { notifyDataChanged } = useEventsController();
  const { syncPositionByDate } = useScrollController();

  useImperativeHandle(
    ref,
    () => ({
      goToDate: (props) => {
        const dateUnix = props?.date
          ? Math.floor(props.date.getTime() / 1000)
          : currentUnixTime.value;
        const pageIndex = Math.floor(
          (dateUnix - pages.day.minDate) / SECONDS_IN_DAY
        );
        let offsetX = pageIndex * calendarSize.width;
        const maxOffset = (pages.day.data.length - 1) * calendarSize.width;
        const clampedOffset = clampValues(offsetX, 0, maxOffset);
        const currentOffset = timelineRef.current?.getCurrentScrollOffset();
        if (currentOffset !== clampedOffset) {
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
          const position = (subtractMinutes * timeIntervalHeight.value) / 60;
          const offset = scrollVisibleHeight.value / 2;
          verticalListRef.current?.scrollTo({
            x: 0,
            y: position - offset,
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
          animated: animated,
        });
      },
      goToNextPage: (animated?: boolean) => {
        const nextIndex = timelineIndex.value + 1;
        if (nextIndex > pages.day.data.length - 1) {
          return;
        }

        const nextOffset = nextIndex * calendarSize.width;
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

        const nextOffset = prevIndex * calendarSize.width;
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
      calendarSize.width,
      currentUnixTime.value,
      notifyDataChanged,
      pages,
      scrollVisibleHeight.value,
      start,
      syncPositionByDate,
      timeIntervalHeight,
      timelineAnimatedRef,
      timelineIndex.value,
      timelineRef,
      verticalListRef,
    ]
  );

  return (
    <React.Fragment>
      <DayViewHeader {...headerProps} />
      <DayViewBody {...bodyProps} />
    </React.Fragment>
  );
};

export default React.forwardRef(DayView);
