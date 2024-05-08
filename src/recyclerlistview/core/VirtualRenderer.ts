import RecycleItemPool from '../utils/RecycleItemPool';
import TSCast from '../utils/TSCast';
import { isNullOrUndefined, valueWithDefault } from '../utils/utils';
import ViewabilityTracker, {
  TOnColumnChanged,
  TOnItemStatusChanged,
} from './ViewabilityTracker';
import { Dimension } from './dependencies/LayoutProvider';
import { LayoutManager, Point } from './layoutmanager/LayoutManager';

/***
 * Renderer which keeps track of recyclable items and the currently rendered items. Notifies list view to re render if something changes, like scroll offset
 */
export interface RenderStackItem {
  dataIndex?: number;
}
export interface StableIdMapItem {
  key: string;
}
export interface RenderStack {
  [key: string]: RenderStackItem;
}

export interface RenderStackParams {
  itemCount: number;
  initialOffset?: number;
  renderAheadOffset?: number;
  columnsPerPage?: number;
}

export type StableIdProvider = (index: number) => string;

export default class VirtualRenderer {
  private onVisibleItemsChanged: TOnItemStatusChanged | null;
  private onVisibleColumnChanged: TOnColumnChanged | null;

  private _scrollOnNextUpdate: (point: Point) => void;
  private _stableIdToRenderKeyMap: {
    [key: string]: StableIdMapItem | undefined;
  };
  private _engagedIndexes: { [key: number]: number | undefined };
  private _renderStack: RenderStack;
  private _renderStackChanged: (renderStack: RenderStack) => void;
  private _isViewTrackerRunning: boolean;
  private _markDirty: boolean;
  private _startKey: number;
  private _recyclePool: RecycleItemPool = TSCast.cast<RecycleItemPool>(null); //TSI

  private _params: RenderStackParams | null;
  private _layoutManager: LayoutManager | null = null;
  private _viewabilityTracker: ViewabilityTracker | null = null;
  private _dimensions: Dimension | null;

  constructor(
    renderStackChanged: (renderStack: RenderStack) => void,
    scrollOnNextUpdate: (point: Point) => void
  ) {
    //Keeps track of items that need to be rendered in the next render cycle
    this._renderStack = {};

    //Keeps track of keys of all the currently rendered indexes, can eventually replace renderStack as well if no new use cases come up
    this._stableIdToRenderKeyMap = {};
    this._engagedIndexes = {};
    this._renderStackChanged = renderStackChanged;
    this._scrollOnNextUpdate = scrollOnNextUpdate;
    this._dimensions = null;
    this._params = null;

    this._isViewTrackerRunning = false;
    this._markDirty = false;

    //Would be surprised if someone exceeds this
    this._startKey = 0;

    this.onVisibleItemsChanged = null;
    this.onVisibleColumnChanged = null;
  }

  public getLayoutDimension(): Dimension {
    if (this._layoutManager) {
      return this._layoutManager.getContentDimension();
    }
    return { height: 0, width: 0 };
  }

  public updateOffset(offsetX: number, isActual: boolean): void {
    if (this._viewabilityTracker) {
      const offset = offsetX;
      if (!this._isViewTrackerRunning) {
        if (isActual) {
          this._viewabilityTracker.setActualOffset(offset);
        }
        this.startViewabilityTracker();
      }
      this._viewabilityTracker.updateOffset(offset, isActual);
    }
  }

  public attachVisibleItemsListener(callback: TOnItemStatusChanged): void {
    this.onVisibleItemsChanged = callback;
  }

  public removeVisibleItemsListener(): void {
    this.onVisibleItemsChanged = null;

    if (this._viewabilityTracker) {
      this._viewabilityTracker.onVisibleRowsChanged = null;
    }
  }

  public attachVisibleColumnsListener(callback: TOnColumnChanged): void {
    this.onVisibleColumnChanged = callback;
  }

  public removeVisibleColumnsListener(): void {
    this.onVisibleColumnChanged = null;

    if (this._viewabilityTracker) {
      this._viewabilityTracker.onVisibleColumnChanged = null;
    }
  }

  public getLayoutManager(): LayoutManager | null {
    return this._layoutManager;
  }

  public setParamsAndDimensions(
    params: RenderStackParams,
    dim: Dimension
  ): void {
    this._params = params;
    this._dimensions = dim;
  }

  public setLayoutManager(layoutManager: LayoutManager): void {
    this._layoutManager = layoutManager;
    if (this._params) {
      this._layoutManager.relayout(this._params.itemCount);
    }
  }

  public getViewabilityTracker(): ViewabilityTracker | null {
    return this._viewabilityTracker;
  }

  public refreshWithOffset(offset: number): void {
    if (this._viewabilityTracker) {
      this._prepareViewabilityTracker();
      this._scrollOnNextUpdate({ x: offset, y: 0 });
      this._viewabilityTracker.forceRefreshWithOffset(offset);
    }
  }

  public refresh(): void {
    if (this._viewabilityTracker) {
      this._prepareViewabilityTracker();
      this._viewabilityTracker.forceRefresh();
    }
  }

  public getInitialOffset(): Point {
    let offset = { x: 0, y: 0 };
    if (this._params) {
      offset.x = valueWithDefault<number>(this._params.initialOffset, 0);
      offset.y = 0;
    }
    return offset;
  }

  public init(): void {
    this.getInitialOffset();
    this._recyclePool = new RecycleItemPool();
    if (this._params) {
      this._viewabilityTracker = new ViewabilityTracker(
        valueWithDefault<number>(this._params.renderAheadOffset, 0),
        valueWithDefault<number>(this._params.initialOffset, 0),
        this._params.columnsPerPage
      );
    } else {
      this._viewabilityTracker = new ViewabilityTracker(0, 0);
    }
    this._prepareViewabilityTracker();
  }

  public startViewabilityTracker(): void {
    if (this._viewabilityTracker) {
      this._isViewTrackerRunning = true;
      this._viewabilityTracker.init();
    }
  }

  public syncAndGetKey(index: number): string {
    const renderStack = this._renderStack;
    const stableIdItem = this._stableIdToRenderKeyMap[index];
    let key = stableIdItem ? stableIdItem.key : undefined;

    if (isNullOrUndefined(key)) {
      key = this._recyclePool.getRecycledObject();
      if (!isNullOrUndefined(key)) {
        const itemMeta = renderStack[key!];
        if (itemMeta) {
          const oldIndex = itemMeta.dataIndex!;
          itemMeta.dataIndex = index;
          if (!isNullOrUndefined(oldIndex) && oldIndex !== index) {
            delete this._stableIdToRenderKeyMap[oldIndex];
          }
        } else {
          renderStack[key!] = { dataIndex: index };
        }
      } else {
        key = `${index}`;
        if (renderStack[key]) {
          key = this._getCollisionAvoidingKey();
        }
        renderStack[key] = { dataIndex: index };
      }
      this._markDirty = true;
      this._stableIdToRenderKeyMap[index] = { key: key! };
    }
    if (!isNullOrUndefined(this._engagedIndexes[index])) {
      this._recyclePool.removeFromPool(key!);
    }
    const stackItem = renderStack[key!];
    if (stackItem && stackItem.dataIndex !== index) {
      //Probable collision, warn
      console.warn('Possible stableId collision @', index); //tslint:disable-line
    }
    return key!;
  }

  private _getCollisionAvoidingKey(): string {
    return '#' + this._startKey++ + '_rlv_c';
  }

  private _prepareViewabilityTracker(): void {
    if (
      this._viewabilityTracker &&
      this._layoutManager &&
      this._dimensions &&
      this._params
    ) {
      this._viewabilityTracker.onEngagedRowsChanged =
        this._onEngagedItemsChanged;
      if (this.onVisibleItemsChanged) {
        this._viewabilityTracker.onVisibleRowsChanged =
          this._onVisibleItemsChanged;
      }
      if (this.onVisibleColumnChanged) {
        this._viewabilityTracker.onVisibleColumnChanged =
          this._onVisibleColumnChanged;
      }
      this._viewabilityTracker.setLayout(
        this._layoutManager.getLayout(),
        this._layoutManager.getContentDimension().width,
        this._params.itemCount,
        this._params.columnsPerPage
      );
      this._viewabilityTracker.setDimensions({
        height: this._dimensions.height,
        width: this._dimensions.width,
      });
    } else {
      throw new Error(
        'Parameters required for initializing the module are missing'
      );
    }
  }

  private _onVisibleItemsChanged = (
    all: number[],
    now: number[],
    notNow: number[]
  ): void => {
    if (this.onVisibleItemsChanged) {
      this.onVisibleItemsChanged(all, now, notNow);
    }
  };

  private _onVisibleColumnChanged = (props: {
    index: number;
    column: number;
    offset: number;
  }): void => {
    if (this.onVisibleColumnChanged) {
      this.onVisibleColumnChanged(props);
    }
  };

  private _onEngagedItemsChanged = (
    _all: number[],
    now: number[],
    notNow: number[]
  ): void => {
    const count = notNow.length;
    let resolvedKey;
    let disengagedIndex = 0;
    for (let i = 0; i < count; i++) {
      disengagedIndex = notNow[i]!;
      delete this._engagedIndexes[disengagedIndex];
      if (this._params && disengagedIndex < this._params.itemCount) {
        //All the items which are now not visible can go to the recycle pool, the pool only needs to maintain keys since
        //react can link a view to a key automatically
        resolvedKey = this._stableIdToRenderKeyMap[disengagedIndex];
        if (!isNullOrUndefined(resolvedKey)) {
          this._recyclePool.putRecycledObject(resolvedKey!.key);
        }
      }
    }
    if (this._updateRenderStack(now)) {
      //Ask Recycler View to update itself
      this._renderStackChanged(this._renderStack);
    }
  };

  //Updates render stack and reports whether anything has changed
  private _updateRenderStack(itemIndexes: number[]): boolean {
    this._markDirty = false;
    const count = itemIndexes.length;
    let index = 0;
    let hasRenderStackChanged = false;
    for (let i = 0; i < count; i++) {
      index = itemIndexes[i]!;
      this._engagedIndexes[index] = 1;
      this.syncAndGetKey(index);
      hasRenderStackChanged = this._markDirty;
    }
    this._markDirty = false;
    return hasRenderStackChanged;
  }
}
