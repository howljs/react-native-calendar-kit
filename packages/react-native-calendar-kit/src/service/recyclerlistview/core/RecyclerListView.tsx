import debounce from 'lodash.debounce';
import * as React from 'react';
import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewProps,
} from 'react-native';
import { ComponentCompat } from '../utils/ComponentCompat';
import { isNullOrUndefined } from '../utils/utils';
import type { Layout, LayoutManager, Point } from './LayoutManager';
import type { BaseLayoutProvider, Dimension } from './LayoutProvider';
import ScrollComponent from './ScrollComponent';
import type {
  TOnColumnChanged,
  TOnItemStatusChanged,
} from './ViewabilityTracker';
import ViewRenderer from './ViewRenderer';
import type {
  RenderStack,
  RenderStackItem,
  RenderStackParams,
} from './VirtualRenderer';
import VirtualRenderer from './VirtualRenderer';

export interface RecyclerListViewProps {
  layoutProvider: BaseLayoutProvider;
  itemCount: number;
  rowRenderer: (
    index: number,
    extendedState?: object
  ) => JSX.Element | JSX.Element[] | null;
  renderAheadOffset?: number;
  onScroll?: (rawEvent: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onVisibleIndicesChanged?: TOnItemStatusChanged;
  onVisibleColumnChanged?: TOnColumnChanged;
  initialOffset?: number;
  scrollEventThrottle?: number;
  extendedState?: object;
  style?: object | number;
  renderItemContainer?: (
    props: object,
    parentProps: object,
    children?: React.ReactNode
  ) => React.ReactNode;
  // For all props that need to be proxied to inner/external scrollview. Put them in an object and they'll be spread
  // and passed down. For better typescript support.
  scrollViewProps?: ScrollViewProps & Record<string, any>;
  columnsPerPage?: number;
  visibleColumns?: number;
  extraScrollData?: Record<string, any>;
  initialScroll?: (offsetX: number) => void;
  onLoad?: () => void;
}

export interface RecyclerListViewState {
  renderStack: RenderStack;
  internalSnapshot: Record<string, object>;
}

export default class RecyclerListView<
  P extends RecyclerListViewProps,
  S extends RecyclerListViewState,
> extends ComponentCompat<P, S> {
  public static defaultProps = {
    initialOffset: 0,
    renderAheadOffset: 250,
    scrollEventThrottle: 16,
  };

  public static propTypes = {};

  private refreshRequestDebouncer = debounce((executable: () => void) => {
    executable();
  });

  private _virtualRenderer: VirtualRenderer;
  private _initComplete = false;
  private _isMounted = true;
  private _params: RenderStackParams = {
    initialOffset: 0,
    itemCount: 0,
    renderAheadOffset: 250,
  };

  private _layout: Dimension = { height: 0, width: 0 };
  private _pendingScrollToOffset: Point | null = null;
  private _pendingRenderStack?: RenderStack;
  private _initialOffset = 0;
  private _scrollComponent: ScrollComponent | null = null;
  private _isFirstRender: boolean = true;

  constructor(props: P, context?: any) {
    super(props, context);
    this._virtualRenderer = new VirtualRenderer(
      this._renderStackWhenReady,
      (offset) => {
        this._pendingScrollToOffset = offset;
      }
    );

    const layoutSize = props.layoutProvider.getLayoutSize();
    this._layout.height = layoutSize.height;
    this._layout.width = layoutSize.width;
    this._initComplete = true;
    this._initTrackers(props);
  }

  public componentWillReceivePropsCompat(
    newProps: RecyclerListViewProps
  ): void {
    this._checkAndChangeLayouts(newProps);
    if (!newProps.onVisibleIndicesChanged) {
      this._virtualRenderer.removeVisibleItemsListener();
    }
    if (newProps.onVisibleIndicesChanged) {
      this._virtualRenderer.attachVisibleItemsListener(
        newProps.onVisibleIndicesChanged
      );
    }
    if (!newProps.onVisibleColumnChanged) {
      this._virtualRenderer.removeVisibleColumnsListener();
    }
    if (newProps.onVisibleColumnChanged) {
      this._virtualRenderer.attachVisibleColumnsListener(
        newProps.onVisibleColumnChanged
      );
    }
  }

  public componentDidUpdate(): void {
    this._processInitialOffset();
  }

  public componentDidMount(): void {
    if (this._initComplete) {
      this._processInitialOffset();
    }
  }

  public componentWillUnmount(): void {
    this._isMounted = false;
  }

  public scrollToIndex(index: number, animate?: boolean): void {
    const layoutManager = this._virtualRenderer.getLayoutManager();
    if (layoutManager) {
      const offsets = layoutManager.getOffsetForIndex(index);
      this.scrollToOffset(offsets.x, animate);
    } else {
      console.warn(
        'scrollTo was called before RecyclerListView was measured, please wait for the mount to finish'
      ); // tslint:disable-line
    }
  }

  public getLayout(index: number): Layout | undefined {
    const layoutManager = this._virtualRenderer.getLayoutManager();
    return layoutManager ? layoutManager.getLayout(index) : undefined;
  }

  public scrollToTop(animate?: boolean): void {
    this.scrollToOffset(0, animate);
  }

  public scrollToEnd(animate?: boolean): void {
    const lastIndex = this.props.itemCount - 1;
    this.scrollToIndex(lastIndex, animate);
  }

  public scrollToOffset = (x: number, animate: boolean = false): void => {
    if (this._scrollComponent) {
      this._scrollComponent.scrollTo(x, 0, animate);
    }
  };

  // You can use requestAnimationFrame callback to change renderAhead in multiple frames to enable advanced progressive
  // rendering when view types are very complex. This method returns a boolean saying if the update was committed. Retry in
  // the next frame if you get a failure (if mount wasn't complete). Value should be greater than or equal to 0;
  // Very useful when you have a page where you need a large renderAheadOffset. Setting it at once will slow down the load and
  // this will help mitigate that.
  public updateRenderAheadOffset(renderAheadOffset: number): boolean {
    const viewabilityTracker = this._virtualRenderer.getViewabilityTracker();
    if (viewabilityTracker) {
      viewabilityTracker.updateRenderAheadOffset(renderAheadOffset);
      return true;
    }
    return false;
  }

  public getCurrentRenderAheadOffset(): number {
    const viewabilityTracker = this._virtualRenderer.getViewabilityTracker();
    if (viewabilityTracker) {
      return viewabilityTracker.getCurrentRenderAheadOffset();
    }
    return this.props.renderAheadOffset!;
  }

  public getCurrentScrollOffset(): number {
    const viewabilityTracker = this._virtualRenderer.getViewabilityTracker();
    return viewabilityTracker ? viewabilityTracker.getLastActualOffset() : 0;
  }

  public getRenderedSize(): Dimension {
    return this._layout;
  }

  public getContentDimension(): Dimension {
    return this._virtualRenderer.getLayoutDimension();
  }

  public getMaxOffset(visibleColumns?: number): number {
    if (!visibleColumns || !this._params.columnsPerPage) {
      return (
        this._virtualRenderer.getLayoutDimension().width - this._layout.width
      );
    }

    const columnWidth = this._layout.width / this._params.columnsPerPage;
    return (
      this._virtualRenderer.getLayoutDimension().width -
      columnWidth * visibleColumns
    );
  }

  public isScrollable(offset: number, visibleColumns?: number): boolean {
    const maxOffset = this.getMaxOffset(visibleColumns);
    const currentOffset = this.getCurrentScrollOffset();
    return offset >= 0 && offset <= maxOffset && offset !== currentOffset;
  }

  // Force Rerender forcefully to update view renderer. Use this in rare circumstances
  public forceRerender(): void {
    this.setState({
      internalSnapshot: {},
    });
  }

  public getScrollableNode(): number | null {
    if (this._scrollComponent && this._scrollComponent.getScrollableNode) {
      return this._scrollComponent.getScrollableNode();
    }
    return null;
  }

  public renderCompat(): JSX.Element {
    return (
      <ScrollComponent
        ref={(scrollComponent) => (this._scrollComponent = scrollComponent)}
        {...this.props}
        {...this.props.scrollViewProps}
        onScroll={this._onScroll}
        contentHeight={
          this._initComplete
            ? this._virtualRenderer.getLayoutDimension().height
            : 0
        }
        contentWidth={
          this._initComplete
            ? this._virtualRenderer.getLayoutDimension().width
            : 0
        }
        renderAheadOffset={this.getCurrentRenderAheadOffset()}>
        {this._generateRenderStack()}
      </ScrollComponent>
    );
  }

  protected getVirtualRenderer(): VirtualRenderer {
    return this._virtualRenderer;
  }

  private _processInitialOffset(): void {
    if (this._pendingScrollToOffset) {
      setTimeout(() => {
        if (this._pendingScrollToOffset) {
          const offset = this._pendingScrollToOffset;
          this._pendingScrollToOffset = null;
          offset.y = 0;
          if (this.props.initialScroll) {
            this.props.initialScroll(offset.x);
          } else {
            this.scrollToOffset(offset.x, false);
          }
          if (this._pendingRenderStack) {
            this._renderStackWhenReady(this._pendingRenderStack);
            this._pendingRenderStack = undefined;
          }
        }
      }, 0);
    }
  }

  private _checkAndChangeLayouts(newProps: RecyclerListViewProps): void {
    this._params.itemCount = newProps.itemCount;
    this._params.columnsPerPage = newProps.columnsPerPage;
    this._params.extraScrollData = newProps.extraScrollData;
    this._params.initialOffset = newProps.initialOffset;
    const initialOffset =
      newProps.initialOffset ?? this.props.initialOffset ?? 0;

    this._virtualRenderer.setParamsAndDimensions(this._params, this._layout);
    if (this.props.layoutProvider !== newProps.layoutProvider) {
      const layoutSize = newProps.layoutProvider.getLayoutSize();
      this._layout.height = layoutSize.height;
      this._layout.width = layoutSize.width;
      this._virtualRenderer.setLayoutManager(
        newProps.layoutProvider.createLayoutManager()
      );
      this._refreshViewability(initialOffset);
    } else if (
      this.props.itemCount !== newProps.itemCount ||
      this.props.columnsPerPage !== newProps.columnsPerPage
    ) {
      this._virtualRenderer.setLayoutManager(
        this.props.layoutProvider.createLayoutManager()
      );
      this._refreshViewability(initialOffset);
    }
  }

  private _refreshViewability(initialOffset: number): void {
    this._virtualRenderer.refreshWithOffset(initialOffset);
    this._queueStateRefresh();
  }

  private _queueStateRefresh(): void {
    this.refreshRequestDebouncer(() => {
      if (this._isMounted) {
        this.setState((prevState) => {
          return prevState;
        });
      }
    });
  }

  private _initStateIfRequired(stack?: RenderStack): boolean {
    if (!this.state) {
      this.state = {
        internalSnapshot: {},
        renderStack: stack,
      } as S;
      return true;
    }
    return false;
  }

  private _renderStackWhenReady = (stack: RenderStack): void => {
    if (this._pendingScrollToOffset) {
      this._pendingRenderStack = stack;
      return;
    }
    if (!this._initStateIfRequired(stack)) {
      this.setState(
        () => {
          return { renderStack: stack };
        },
        () => {
          if (this._isFirstRender) {
            this._isFirstRender = false;
            this.props.onLoad?.();
          }
        }
      );
    }
  };

  private _initTrackers(props: RecyclerListViewProps): void {
    if (props.onVisibleIndicesChanged) {
      this._virtualRenderer.attachVisibleItemsListener(
        props.onVisibleIndicesChanged
      );
    }
    if (props.onVisibleColumnChanged) {
      this._virtualRenderer.attachVisibleColumnsListener(
        props.onVisibleColumnChanged
      );
    }
    this._params = {
      initialOffset: this._initialOffset
        ? this._initialOffset
        : props.initialOffset,
      itemCount: props.itemCount,
      renderAheadOffset: props.renderAheadOffset,
      columnsPerPage: props.columnsPerPage,
      extraScrollData: props.extraScrollData,
    };
    this._virtualRenderer.setParamsAndDimensions(this._params, this._layout);
    const layoutManager = props.layoutProvider.createLayoutManager();
    this._virtualRenderer.setLayoutManager(layoutManager);
    this._virtualRenderer.init();
    const offset = this._virtualRenderer.getInitialOffset();
    const contentDimension = layoutManager.getContentDimension();
    if (
      (offset.y > 0 && contentDimension.height > this._layout.height) ||
      (offset.x > 0 && contentDimension.width > this._layout.width)
    ) {
      this._pendingScrollToOffset = offset;
      if (!this._initStateIfRequired()) {
        this.setState({});
      }
    } else {
      this._virtualRenderer.startViewabilityTracker();
    }
  }

  private _renderRowUsingMeta(itemMeta: RenderStackItem): JSX.Element | null {
    const dataSize = this.props.itemCount;
    const dataIndex = itemMeta.dataIndex!;
    if (!isNullOrUndefined(dataIndex) && dataIndex < dataSize) {
      const itemRect = (
        this._virtualRenderer.getLayoutManager() as LayoutManager
      ).getLayout(dataIndex);
      const key = this._virtualRenderer.syncAndGetKey(dataIndex);

      return (
        <ViewRenderer
          key={key}
          x={itemRect.x}
          y={itemRect.y}
          index={dataIndex}
          layoutProvider={this.props.layoutProvider}
          childRenderer={this.props.rowRenderer}
          height={itemRect.height}
          width={itemRect.width}
          extendedState={this.props.extendedState}
          internalSnapshot={this.state.internalSnapshot}
          renderItemContainer={this.props.renderItemContainer}
        />
      );
    }
    return null;
  }

  private _generateRenderStack(): Array<JSX.Element | null> {
    const renderedItems = [];
    if (this.state) {
      for (const key in this.state.renderStack) {
        if (Object.prototype.hasOwnProperty.call(this.state.renderStack, key)) {
          renderedItems.push(
            this._renderRowUsingMeta(this.state.renderStack[key])
          );
        }
      }
    }

    return renderedItems;
  }

  private _onScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ): void => {
    const contentOffset = event.nativeEvent.contentOffset;
    this._virtualRenderer.updateOffset(contentOffset.x, true);

    if (this.props.onScroll) {
      this.props.onScroll(event);
    }
  };
}
