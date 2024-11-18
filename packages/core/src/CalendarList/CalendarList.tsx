/* eslint-disable @eslint-react/no-unused-class-component-members */
import React from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import {
  DataProvider,
  type Dimension,
  RecyclerListView,
  type RecyclerListViewProps,
} from 'recyclerlistview';

import LayoutProviderWithProps from './LayoutProviderWithProps';
import type { CalendarListProps } from './types';

type ScrollEvent = {
  nativeEvent: {
    contentOffset: {
      x: number;
      y: number;
    };
    layoutMeasurement?: Dimension;
    contentSize?: Dimension;
  };
};

export interface CalendarListState<T> {
  dataProvider: DataProvider;
  numColumns: number;
  layoutProvider: LayoutProviderWithProps<T>;
  data?: readonly T[] | null;
  extraData?: ExtraData<unknown>;
  renderItem?: CalendarListProps<T>['renderItem'];
}

interface ExtraData<T> {
  value?: T;
}

class CalendarList<T> extends React.PureComponent<CalendarListProps<T>, CalendarListState<T>> {
  private rlvRef?: RecyclerListView<RecyclerListViewProps, any>;
  private _layoutSize = { width: 0, height: 0 };
  private loadStartTime = 0;
  private _isMounted = false;

  constructor(props: CalendarListProps<T>) {
    super(props);
    this.loadStartTime = Date.now();
    this._layoutSize = props.layoutSize;
    this.state = CalendarList.getInitialMutableState(this);
  }

  static getDerivedStateFromProps<T>(
    nextProps: Readonly<CalendarListProps<T>>,
    prevState: CalendarListState<T>
  ): CalendarListState<T> {
    const newState = { ...prevState };
    if (!prevState.layoutProvider) {
      newState.layoutProvider = new LayoutProviderWithProps<T>(nextProps);
    } else if (prevState.layoutProvider.updateProps(nextProps).hasExpired) {
      newState.layoutProvider = new LayoutProviderWithProps<T>(nextProps);
    }
    newState.layoutProvider.shouldRefreshWithAnchoring = false;

    if (nextProps.data !== prevState.data || nextProps.numColumns !== prevState.numColumns) {
      newState.numColumns = nextProps.numColumns ?? 1;
      const nextData = nextProps.data ?? [];
      newState.data = nextData;
      let data: any = [];
      if (newState.numColumns > 1) {
        for (let i = 0; i < nextData.length; i += newState.numColumns) {
          data.push(nextData[i]);
        }
      } else {
        data = nextData;
      }
      newState.dataProvider = prevState.dataProvider.cloneWithRows(data);
      if (nextProps.renderItem !== prevState.renderItem) {
        newState.extraData = { ...prevState.extraData };
      }
    }
    if (nextProps.extraData !== prevState.extraData?.value) {
      newState.extraData = { value: nextProps.extraData };
    }
    newState.renderItem = nextProps.renderItem;
    return newState;
  }

  componentDidMount(): void {
    if (!this._isMounted) {
      this.props.onLoad?.({
        elapsedTimeInMs: Date.now() - this.loadStartTime,
      });
      this._isMounted = true;
    }
  }

  componentDidUpdate(prevProps: CalendarListProps<T>) {
    const isColumnsChanged =
      this.props.numColumns && prevProps.numColumns !== this.props.numColumns;
    const isLayoutSizeChanged = prevProps.layoutSize.width !== this.props.layoutSize.width;
    if (isColumnsChanged || isLayoutSizeChanged) {
      setTimeout(() => {
        this.scrollToItem({
          item: this.props.initialDate ?? 0,
          animated: false,
        });
      });
    }
  }

  private static getInitialMutableState<T>(calendarList: CalendarList<T>): CalendarListState<T> {
    let getStableId: ((index: number) => string) | undefined;
    if (calendarList.props.keyExtractor !== null && calendarList.props.keyExtractor !== undefined) {
      getStableId = (index) =>
        calendarList.props.keyExtractor!(calendarList.props.data![index], index).toString();
    }
    return {
      data: null,
      layoutProvider: null!,
      dataProvider: new DataProvider((r1, r2) => {
        return r1 !== r2;
      }, getStableId),
      numColumns: 0,
    };
  }

  render() {
    const {
      renderAheadItem = 7,
      layoutSize,
      initialDate,
      renderScrollComponent,
      numColumns = 1,
      ...restProps
    } = this.props;

    return (
      <RecyclerListView
        {...restProps}
        ref={this.recyclerRef}
        layoutProvider={this.state.layoutProvider}
        dataProvider={this.state.dataProvider}
        rowRenderer={this.emptyRowRenderer}
        canChangeSize
        isHorizontal
        scrollViewProps={{
          onScrollBeginDrag: this.onScrollBeginDrag,
          onLayout: this.handleSizeChange,
          removeClippedSubviews: false,
        }}
        renderItemContainer={this.itemContainer}
        extendedState={this.state.extraData}
        layoutSize={layoutSize}
        renderAheadOffset={renderAheadItem * (layoutSize.width / numColumns)}
        initialRenderIndex={this.getInitialRenderIndex(initialDate)}
        onScroll={this.onScroll}
        externalScrollView={renderScrollComponent as RecyclerListViewProps['externalScrollView']}
      />
    );
  }

  private getInitialRenderIndex(initialDate: number | undefined) {
    if (!initialDate) {
      return 0;
    }

    const index = this.props.data?.findIndex((item) => item === initialDate);
    return index ? Math.floor(index / this.state.numColumns) : 0;
  }

  private emptyRowRenderer = () => {
    return null;
  };

  private onScrollBeginDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    this.props.onScrollBeginDrag?.(event);
  };

  private onScroll = (event: ScrollEvent) => {
    this.props.onScroll?.(event as NativeSyntheticEvent<NativeScrollEvent>);
  };

  private handleSizeChange = (event: LayoutChangeEvent) => {
    const newSize = event.nativeEvent.layout;
    const oldSize = this._layoutSize;
    this._layoutSize = {
      width: newSize.width,
      height: newSize.height,
    };

    // >0 check is to avoid rerender on mount where it would be redundant
    if (oldSize.width > 0 && oldSize.width !== newSize.width) {
      this.rlvRef?.forceRerender();
    }
    if (this.props.onLayout) {
      this.props.onLayout(event);
    }
  };

  private _renderContainer = (parentProps: any) => {
    if (!this.props.renderPageItem) {
      return null;
    }

    return (
      <View style={StyleSheet.absoluteFill}>
        {this.props.renderPageItem({
          item: this.props.data![parentProps.index * this.state.numColumns],
          index: parentProps.index,
          extraData: this.state.extraData?.value,
        })}
      </View>
    );
  };

  private _renderItem = (item: T, parentIndex: number, columnIndex: number) => {
    if (!this.props.renderItem) {
      return null;
    }

    return (
      <View
        style={{
          position: 'absolute',
          left: columnIndex * (this._layoutSize.width / this.state.numColumns),
          width: this._layoutSize.width / this.state.numColumns,
          height: this._layoutSize.height,
        }}
        key={`${parentIndex}-${columnIndex}`}>
        {this.props.renderItem({
          item,
          index: parentIndex * this.state.numColumns + columnIndex,
          extraData: this.state.extraData?.value,
        })}
      </View>
    );
  };

  private itemContainer = (props: any, parentProps: any) => {
    const startIndex = parentProps.index * this.state.numColumns;
    const endIndex = startIndex + this.state.numColumns;
    const items = this.props.data?.slice(startIndex, endIndex) ?? [];

    return (
      <View
        {...props}
        style={{
          ...props.style,
          top: props.style.top,
          flexDirection: 'row',
          alignItems: 'stretch',
        }}>
        {this._renderContainer(parentProps)}
        {items.map((item, columnIndex) => this._renderItem(item, parentProps.index, columnIndex))}
      </View>
    );
  };

  private recyclerRef = (ref: any) => {
    this.rlvRef = ref;
  };

  public prepareForLayoutAnimationRender(): void {
    if (this.props.keyExtractor === null || this.props.keyExtractor === undefined) {
      console.warn('KeyExtractor is required for layout animations');
    } else {
      this.rlvRef?.prepareForLayoutAnimationRender();
    }
  }

  public scrollToEnd(params?: { animated?: boolean | null | undefined }) {
    this.rlvRef?.scrollToEnd(Boolean(params?.animated));
  }

  public getCurrentOffset() {
    return this.rlvRef?.getCurrentScrollOffset();
  }

  public getMaxScrollIndex() {
    const totalItems = this.props.data?.length ?? 0;
    const totalColumns = this.props.numColumns ?? 1;
    return totalItems - totalColumns;
  }

  public getCurrentScrollIndex() {
    return this.rlvRef?.findApproxFirstVisibleIndex();
  }

  public scrollToIndex(params: { animated?: boolean | null | undefined; index: number }) {
    const listSize = this.rlvRef?.getRenderedSize();

    if (listSize) {
      const itemOffset = params.index * (this._layoutSize.width / this.state.numColumns);
      const scrollOffset = Math.max(0, itemOffset);
      this.rlvRef?.scrollToOffset(scrollOffset, scrollOffset, Boolean(params.animated), true);
    }
  }

  public scrollToItem(params: { animated?: boolean | null | undefined; item: any }) {
    const index = this.props.data?.indexOf(params.item) ?? -1;
    if (index >= 0) {
      this.scrollToIndex({ ...params, index });
    }
  }

  public scrollToOffset(params: { animated?: boolean | null | undefined; offset: number }) {
    this.rlvRef?.scrollToOffset(params.offset, 0, Boolean(params.animated));
  }

  public getScrollableNode(): number | null {
    return this.rlvRef?.getScrollableNode?.() || null;
  }

  public get recyclerlistview() {
    return this.rlvRef;
  }

  public getNumColumns() {
    return this.props.numColumns || 1;
  }
}

export default CalendarList;
