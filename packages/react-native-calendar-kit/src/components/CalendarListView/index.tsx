import React, { forwardRef, useCallback, useMemo } from 'react';
import type Animated from 'react-native-reanimated';
import type { AnimatedRef } from 'react-native-reanimated';
import { CalendarList, CalendarListRef } from '../../service/CalendarList';
import {
  DimensionValue,
  GestureResponderEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

const MAX_OFFSETS = 180537;

interface CalendarListViewProps {
  count: number;
  width: number;
  height?: DimensionValue;
  extraData?: any;
  renderItem: (
    index: number,
    extraData?: any
  ) => JSX.Element | JSX.Element[] | null;
  initialOffset?: number;
  renderAheadItem?: number;
  animatedRef?: AnimatedRef<Animated.ScrollView>;
  scrollEventThrottle?: number;
  scrollEnabled?: boolean;
  onScroll?: any;
  snapToInterval?: number;
  inverted?: boolean;
  onVisibleColumnChanged?: (props: {
    index: number;
    column: number;
    columns: number;
    extraScrollData: Record<string, any>;
    offset: number;
  }) => void;
  extraScrollData?: any;
  columnsPerPage: number;
  onLoad?: () => void;
  onTouchStart?: (event: GestureResponderEvent) => void;

  /**
   * Fires if a user initiates a scroll gesture.
   */
  onScrollBeginDrag?:
    | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
    | undefined;

  /**
   * Fires when a user has finished scrolling.
   */
  onScrollEndDrag?:
    | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
    | undefined;

  /**
   * Fires when scroll view has finished moving
   */
  onMomentumScrollEnd?:
    | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
    | undefined;

  /**
   * Fires when scroll view has begun moving
   */
  onMomentumScrollBegin?:
    | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
    | undefined;

  onWheel?: (event: WheelEvent) => void;
}

export type CalendarListViewHandle = {
  scrollToIndex: (index: number, animated?: boolean) => void;
  scrollToOffset: (offset: number, animated?: boolean) => void;
  getMaxOffset: (visibleColumns?: number) => number;
  isScrollable: (offset: number, visibleColumns?: number) => boolean;
};

const CalendarListView = forwardRef<CalendarListRef, CalendarListViewProps>(
  (props, ref) => {
    const {
      count,
      width,
      height,
      extraData,
      renderItem,
      initialOffset = 0,
      renderAheadItem = 2,
      scrollEventThrottle = 16,
      scrollEnabled,
      animatedRef,
      onScroll,
      snapToInterval,
      // inverted,
      columnsPerPage,
      ...rest
    } = props;

    const _renderItem = useCallback(
      ({ item }: { item: number }) => renderItem(item, extraData),
      [renderItem, extraData]
    );

    const baseOffsets = useMemo(() => {
      if (!snapToInterval || !width) {
        return undefined;
      }

      return Array.from(
        { length: columnsPerPage },
        (_, col) => col * snapToInterval
      );
    }, [columnsPerPage, snapToInterval, width]);

    const _snapToOffsets = useMemo(() => {
      if (!baseOffsets) {
        return undefined;
      }
      const offsets = [];
      for (let page = 0; page < count; page++) {
        offsets.push(...baseOffsets.map((offset) => offset + page * width));
      }
      if (offsets.length > MAX_OFFSETS) {
        console.warn('The number of days to display is too large');
      }
      return offsets;
    }, [baseOffsets, count, width]);

    const keyExtractor = useCallback((item: number) => item.toString(), []);

    return (
      <CalendarList
        ref={ref}
        animatedRef={animatedRef}
        count={count}
        renderItem={_renderItem}
        itemSize={width}
        style={{ height }}
        pagingEnabled={!snapToInterval}
        initialOffset={initialOffset}
        snapToOffsets={_snapToOffsets}
        drawDistance={width * renderAheadItem}
        columnsPerPage={columnsPerPage}
        keyExtractor={keyExtractor}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        scrollEnabled={scrollEnabled}
        {...rest}
      />
    );
  }
);

export default React.memo(CalendarListView);
