import React, { forwardRef, useMemo } from 'react';

import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated from 'react-native-reanimated';
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
  type RecyclerListViewProps,
} from 'recyclerlistview';
import type { RecyclerListViewState } from 'recyclerlistview/dist/reactnative/core/RecyclerListView';
import ExternalScrollView from './ExternalScrollView';

export interface RecyclerItem {
  item: any;
  index: number;
  extraData: any;
}

export interface RecyclerListProps {
  data: any[];
  renderItem: (props: RecyclerItem) => JSX.Element | JSX.Element[] | null;
  listSize: { width: number; height: number };
  scrollEnabled?: boolean;
  snapToInterval?: number;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  extraData?: any;
  bounces?: boolean;
  onTouchStart?: (event: GestureResponderEvent) => void;
  onVisibleIndicesChanged?: (
    all: number[],
    now: number[],
    notNow: number[]
  ) => void;
  onScrollBeginDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollEndDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd?: (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => void;
  onMomentumScrollBegin?: (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => void;
  isPagingEnabled?: boolean;
  style?: StyleProp<ViewStyle>;
  inverted?: boolean;
  snapToOffsets?: number[];
  scrollEventThrottle?: number;
  scrollsToTop?: boolean;
  initialOffset?: number;
  renderAheadItem?: number;
  animatedRef: React.RefObject<Animated.ScrollView>;
}

export type RecyclerListHandle = RecyclerListView<
  RecyclerListViewProps,
  RecyclerListViewState
>;

const RecyclerList: React.ForwardRefRenderFunction<
  RecyclerListHandle,
  RecyclerListProps
> = (
  {
    data,
    renderItem,
    listSize,
    scrollEnabled,
    onScroll,
    extraData,
    bounces,
    onTouchStart,
    onVisibleIndicesChanged,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollEnd = () => {},
    onMomentumScrollBegin,
    isPagingEnabled = true,
    inverted,
    snapToOffsets,
    scrollEventThrottle = 16,
    scrollsToTop,
    initialOffset = 0,
    renderAheadItem = 2,
    animatedRef,
  },
  ref
) => {
  const dataProvider = useMemo(() => dataProviderMaker(data), [data]);

  const layoutProvider = useMemo(
    () =>
      new LayoutProvider(
        () => 0,
        (_, dim) => {
          dim.width = listSize.width;
          dim.height = listSize.height;
        }
      ),
    [listSize.width, listSize.height]
  );
  layoutProvider.shouldRefreshWithAnchoring = false;

  const _renderItem = (
    _: string | number,
    item: any,
    index: number,
    extendedState?: object | undefined
  ) => renderItem({ item, index, extraData: extendedState });

  const _renderContainer = (
    props: ViewProps,
    _parentProps: object,
    children?: React.ReactNode
  ) => {
    return (
      <View
        {...props}
        style={StyleSheet.flatten([
          props.style,
          inverted ? styles.rtl : undefined,
        ])}
      >
        {children}
      </View>
    );
  };

  return (
    <RecyclerListView
      ref={ref}
      layoutProvider={layoutProvider}
      dataProvider={dataProvider}
      rowRenderer={_renderItem}
      layoutSize={listSize}
      scrollViewProps={{
        pagingEnabled: isPagingEnabled,
        snapToAlignment: isPagingEnabled ? undefined : 'start',
        decelerationRate: isPagingEnabled ? undefined : 'fast',
        snapToOffsets: isPagingEnabled ? undefined : snapToOffsets,
        showsHorizontalScrollIndicator: false,
        scrollEnabled,
        bounces,
        onTouchStart,
        scrollEventThrottle: scrollEventThrottle,
        onScrollBeginDrag,
        onScrollEndDrag,
        onMomentumScrollEnd,
        onMomentumScrollBegin,
        style: inverted ? styles.rtl : undefined,
        scrollsToTop,
        scrollRefExternal: animatedRef,
        _onScrollExternal: onScroll,
      }}
      isHorizontal
      initialOffset={initialOffset}
      renderAheadOffset={listSize.width * renderAheadItem}
      scrollThrottle={16}
      extendedState={extraData}
      onVisibleIndicesChanged={onVisibleIndicesChanged}
      renderItemContainer={_renderContainer}
      externalScrollView={ExternalScrollView}
    />
  );
};

const dataProviderMaker = (data: any) =>
  new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(data);

export default forwardRef(RecyclerList);

const styles = StyleSheet.create({
  rtl: { transform: [{ scaleX: -1 }] },
});
