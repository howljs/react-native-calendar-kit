/* eslint-disable @eslint-react/no-unused-class-component-members */
import React from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
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

export interface CalendarListState {
  dataProvider: DataProvider;
  numColumns: number;
  layoutProvider: LayoutProviderWithProps;
  data?: readonly number[] | null;
  extraData?: any;
  renderItem?: CalendarListProps['renderItem'];
}

class CalendarList extends React.PureComponent<CalendarListProps, CalendarListState> {
  private rlvRef?: RecyclerListView<RecyclerListViewProps, any>;
  private _layoutSize = { width: 0, height: 0 };
  private _currentDate: any = 0;
  private _isFirstMount = true;

  constructor(props: CalendarListProps) {
    super(props);
    this._layoutSize = props.layoutSize;
    this.state = CalendarList.getInitialMutableState(this);
    this._currentDate = props.initialDate ?? 0;
  }

  static getDerivedStateFromProps(
    nextProps: Readonly<CalendarListProps>,
    prevState: CalendarListState
  ): CalendarListState {
    const newState = { ...prevState };
    if (!prevState.layoutProvider) {
      newState.layoutProvider = new LayoutProviderWithProps(nextProps);
    } else if (prevState.layoutProvider.updateProps(nextProps).hasExpired) {
      newState.layoutProvider = new LayoutProviderWithProps(nextProps);
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

  componentDidMount() {
    if (this._isFirstMount) {
      this._isFirstMount = false;
      this.props.onLoad?.();
    }
  }

  componentDidUpdate(prevProps: CalendarListProps) {
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

  private static getInitialMutableState(calendarList: CalendarList): CalendarListState {
    let getStableId: ((index: number) => string) | undefined;
    if (calendarList.props.keyExtractor !== null && calendarList.props.keyExtractor !== undefined) {
      getStableId = (index) =>
        calendarList.props.keyExtractor!(calendarList.props.data[index], index).toString();
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
      scrollEventThrottle = 16,
      showsHorizontalScrollIndicator = false,
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
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        scrollViewProps={{
          onScrollBeginDrag: this.onScrollBeginDrag,
          onLayout: this.handleSizeChange,
          removeClippedSubviews: false,
        }}
        bounces={false}
        scrollEventThrottle={scrollEventThrottle}
        renderItemContainer={this.itemContainer}
        extendedState={this.state.extraData}
        layoutSize={layoutSize}
        renderAheadOffset={renderAheadItem * layoutSize.width}
        initialOffset={this.getInitialOffset(initialDate)}
        onScroll={this.onScroll}
      />
    );
  }

  private getInitialOffset(initialDate: number | undefined) {
    if (!initialDate) {
      return 0;
    }

    const index = this.props.data?.findIndex((item) => item === initialDate);
    if (this.isScrollByDay) {
      return index ? index * this.columnWidth : 0;
    }
    return this.getPageIndex(index) * this._layoutSize.width;
  }

  private emptyRowRenderer = () => {
    return null;
  };

  private onScrollBeginDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    this.props.onScrollBeginDrag?.(event);
  };

  private onScroll = (event: ScrollEvent) => {
    const currentIndex = Math.floor(
      Math.round(event.nativeEvent.contentOffset.x / this.columnWidth)
    );
    const newDate = this.props.data[currentIndex];
    if (newDate && newDate !== this._currentDate) {
      this._currentDate = newDate;
      this.props.onVisibleItemChanged?.(newDate);
    }
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

  private _renderItem = (item: number, parentIndex: number, columnIndex: number) => {
    return (
      <View
        style={{
          position: 'absolute',
          left: columnIndex * this.columnWidth,
        }}
        key={`${item}-${columnIndex}`}>
        {this.props.renderItem?.({
          item,
          index: parentIndex * this.state.numColumns + columnIndex,
          columnIndex,
          extraData: this.state.extraData?.value,
        })}
      </View>
    );
  };

  private _renderItems = (parentProps: any) => {
    if (!this.props.renderItem) {
      return null;
    }

    const startIndex = parentProps.index * this.state.numColumns;
    const endIndex = startIndex + this.state.numColumns;
    const items = this.props.data?.slice(startIndex, endIndex) ?? [];
    return items.map((item, columnIndex) => this._renderItem(item, parentProps.index, columnIndex));
  };

  private itemContainer = (props: any, parentProps: any) => {
    return (
      <View
        {...props}
        style={{
          ...props.style,
          top: props.style.top,
          flexDirection: 'row',
          alignItems: 'stretch',
        }}>
        {this.props.renderItemContainer
          ? this.props.renderItemContainer({
              item: this.props.data[parentProps.index * this.state.numColumns],
              index: parentProps.index * this.state.numColumns,
              extraData: this.state.extraData?.value,
              children: this._renderItems(parentProps),
            })
          : this._renderItems(parentProps)}
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

  public get recyclerlistview() {
    return this.rlvRef;
  }

  public get numColumns() {
    return this.props.numColumns || 1;
  }

  public get columnWidth() {
    return this._layoutSize.width / this.numColumns;
  }

  public get extraColumns() {
    return this.props.data?.length % this.numColumns;
  }

  public get maxScrollIndex() {
    const totalItems = this.props.data?.length ?? 0;
    return totalItems - this.numColumns;
  }

  public get maxPageIndex() {
    return Math.ceil(this.maxScrollIndex / this.numColumns);
  }

  public get isScrollByDay() {
    return !!this.props.snapToOffsets;
  }

  public getCurrentOffset() {
    return this.rlvRef?.getCurrentScrollOffset() ?? 0;
  }

  public getCurrentScrollIndex() {
    const currentOffset = this.getCurrentOffset();
    return Math.floor(Math.round(currentOffset / this.columnWidth));
  }

  public getNextScrollIndex(forceScrollByDay: boolean) {
    const currentIndex = this.getCurrentScrollIndex();
    const maxIndex = this.maxScrollIndex;
    let nextIndex = currentIndex + 1;
    if (!this.isScrollByDay || (this.isScrollByDay && !forceScrollByDay)) {
      nextIndex = this.getCurrentPageIndex() * this.numColumns + this.numColumns;
    }
    const roundedIndex = Math.min(nextIndex, maxIndex);
    return roundedIndex;
  }

  public getPrevScrollIndex(forceScrollByDay: boolean) {
    const currentIndex = this.getCurrentScrollIndex();
    let nextIndex = currentIndex - 1;
    if (!this.isScrollByDay || (this.isScrollByDay && !forceScrollByDay)) {
      nextIndex = this.getCurrentPageIndex() * this.numColumns - this.numColumns;
    }
    const roundedIndex = Math.max(nextIndex, 0);
    return roundedIndex;
  }

  public scrollToIndex(params: { animated?: boolean | null | undefined; index: number }) {
    const listSize = this.rlvRef?.getRenderedSize();
    if (listSize) {
      let itemIndex = params.index;
      if (!this.isScrollByDay) {
        itemIndex = this.getPageIndex(itemIndex) * this.numColumns;
      }
      const itemOffset = itemIndex * this.columnWidth;
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

  public getNode() {
    return this.rlvRef?.getNativeScrollRef?.();
  }

  public getCurrentPageIndex() {
    const currentOffset = this.getCurrentOffset();
    return Math.floor(Math.round(currentOffset / this._layoutSize.width));
  }

  public getPageIndex(childIndex: number) {
    return Math.floor(childIndex / this.numColumns);
  }

  public isScrollable(offset: number) {
    return offset >= 0 && offset <= this.maxScrollIndex * this.columnWidth;
  }

  public isScrollableByIndex(index: number) {
    return index <= this.maxScrollIndex;
  }

  public getMaxOffset() {
    return this.maxScrollIndex * this.columnWidth;
  }

  public getFirstVisibleItem() {
    const currentIndex = this.getCurrentScrollIndex();
    return this.props.data[currentIndex];
  }

  public getDates() {
    return this.props.data;
  }

  public getGroupedDates() {
    return this.state.dataProvider.getAllData();
  }

  public getItemByIndex(index: number) {
    return this.props.data[index];
  }

  public getIndexByItem(item: number) {
    return this.props.data.indexOf(item);
  }

  public getVisibleDates(startDate: number, endDate: number) {
    const startIndex = this.getIndexByItem(startDate);
    if (startIndex === -1) {
      return [];
    }
    let endIndex = this.getIndexByItem(endDate);
    if (endIndex === -1) {
      endIndex = this.props.data.findIndex((item) => item > startDate && item < endDate);
      if (endIndex === -1) {
        return [];
      }
    }
    return this.props.data.slice(startIndex, endIndex + 1);
  }
}

export default CalendarList;
