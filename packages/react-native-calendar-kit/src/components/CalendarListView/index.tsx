import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { AnimatedRef } from 'react-native-reanimated';
import type Animated from 'react-native-reanimated';
import {
  LayoutProvider,
  RecyclerListView,
} from '../../service/recyclerlistview';
import type {
  RecyclerListViewProps,
  RecyclerListViewState,
} from '../../service/recyclerlistview';

interface CalendarListViewProps {
  count: number;
  width: number;
  height: number;
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
  onVisibleIndicesChanged?: (
    all: number[],
    now: number[],
    notNow: number[]
  ) => void;
  snapToInterval?: number;
  inverted?: boolean;
  onVisibleColumnChanged?: (props: {
    index: number;
    column: number;
    columns: number;
    extraScrollData: Record<string, any>;
    offset: number;
  }) => void;
  columnsPerPage: number;
  extraScrollData?: Record<string, any>;
  onLoad?: () => void;
}

export type CalendarListViewHandle = RecyclerListView<
  RecyclerListViewProps,
  RecyclerListViewState
>;

const MAX_OFFSETS = 180537;

const CalendarListView = forwardRef<
  CalendarListViewHandle,
  CalendarListViewProps
>((props, ref) => {
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
    onVisibleIndicesChanged,
    snapToInterval,
    inverted,
    onVisibleColumnChanged,
    columnsPerPage,
    extraScrollData,
    onLoad,
  } = props;

  const layoutProvider = useMemo(
    () => new LayoutProvider({ width, height }),
    [width, height]
  );

  const _renderItem = (index: number, extendedState?: object | undefined) =>
    renderItem(index, extendedState);

  const _renderItemContainer = (
    containerProps: any,
    _parentProps: any,
    children?: React.ReactNode
  ) => {
    const style = StyleSheet.flatten([
      containerProps.style,
      inverted ? styles.invertedTransform : {},
    ]);
    return <View style={style}>{children}</View>;
  };

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

  return (
    <RecyclerListView
      ref={ref}
      layoutProvider={layoutProvider}
      rowRenderer={_renderItem}
      itemCount={count}
      renderItemContainer={_renderItemContainer}
      scrollViewProps={{
        pagingEnabled: !_snapToOffsets,
        snapToAlignment: !_snapToOffsets ? undefined : 'start',
        decelerationRate: !_snapToOffsets ? undefined : 'fast',
        snapToOffsets: _snapToOffsets,
        showsHorizontalScrollIndicator: false,
        scrollEnabled,
        bounces: false,
        scrollEventThrottle,
        scrollRefExternal: animatedRef,
        overScrollMode: 'never',
        onScrollExternal: onScroll,
        disableIntervalMomentum: !!_snapToOffsets,
        onMomentumScrollBegin: () => {},
        style: inverted ? styles.invertedTransform : {},
      }}
      initialOffset={initialOffset}
      renderAheadOffset={width * renderAheadItem}
      scrollEventThrottle={16}
      extendedState={extraData}
      onVisibleIndicesChanged={onVisibleIndicesChanged}
      columnsPerPage={columnsPerPage}
      onVisibleColumnChanged={onVisibleColumnChanged}
      extraScrollData={extraScrollData}
      onLoad={onLoad}
    />
  );
});

export default React.memo(CalendarListView);

const styles = StyleSheet.create({
  invertedTransform: { transform: [{ scaleX: -1 }] },
});
