import BinarySearch from '../utils/BinarySearch';
import { Dimension } from './dependencies/LayoutProvider';
import { Layout } from './layoutmanager/LayoutManager';
/***
 * Given an offset this utility can compute visible items. Also tracks previously visible items to compute items which get hidden or visible
 * Virtual renderer uses callbacks from this utility to main recycle pool and the render stack.
 * The utility optimizes finding visible indexes by using the last visible items. However, that can be slow if scrollToOffset is explicitly called.
 * We use binary search to optimize in most cases like while finding first visible item or initial offset. In future we'll also be using BS to speed up
 * scroll to offset.
 */
export interface Range {
  start: number;
  end: number;
}

export type TOnItemStatusChanged = (
  all: number[],
  now: number[],
  notNow: number[]
) => void;

export type TOnColumnChanged = (props: {
  index: number;
  column: number;
  offset: number;
}) => void;

export default class ViewabilityTracker {
  public onVisibleRowsChanged: TOnItemStatusChanged | null;
  public onEngagedRowsChanged: TOnItemStatusChanged | null;
  public onVisibleColumnChanged: TOnColumnChanged | null;

  private _currentOffset: number;
  private _maxOffset: number;
  private _renderAheadOffset: number;
  private _visibleWindow: Range;
  private _engagedWindow: Range;
  private _windowBound: number;
  private _visibleIndexes: number[];
  private _engagedIndexes: number[];
  private _startColumn: { index: number; columns: number } | undefined;
  private _layout: Layout;
  private _actualOffset: number;
  private _itemCount: number;
  private _columnsPerPage?: number;

  constructor(
    renderAheadOffset: number,
    initialOffset: number,
    columnsPerPage?: number
  ) {
    this._currentOffset = Math.max(0, initialOffset);
    this._maxOffset = 0;
    this._actualOffset = 0;
    this._renderAheadOffset = renderAheadOffset;
    this._visibleWindow = { start: 0, end: 0 };
    this._engagedWindow = { start: 0, end: 0 };
    this._windowBound = 0;
    this._layout = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
    this._itemCount = 0;
    this._columnsPerPage = columnsPerPage;

    this._visibleIndexes = []; //needs to be sorted
    this._engagedIndexes = []; //needs to be sorted

    this.onVisibleRowsChanged = null;
    this.onEngagedRowsChanged = null;
    this.onVisibleColumnChanged = null;
  }

  public init(): void {
    this._doInitialFit(this._currentOffset);
  }

  public setLayout(
    layout: Layout,
    maxOffset: number,
    itemCount: number,
    columnsPerPage?: number
  ): void {
    this._layout = layout;
    this._maxOffset = maxOffset;
    this._itemCount = itemCount;
    this._columnsPerPage = columnsPerPage;
  }

  public setDimensions(dimension: Dimension): void {
    this._windowBound = dimension.width;
  }

  public forceRefresh(): boolean {
    const shouldForceScroll =
      this._actualOffset >= 0 &&
      this._currentOffset >= this._maxOffset - this._windowBound;
    this.forceRefreshWithOffset(this._currentOffset);
    return shouldForceScroll;
  }

  public forceRefreshWithOffset(offset: number): void {
    this._currentOffset = -1;
    this.updateOffset(offset, false);
  }

  public updateOffset(offset: number, isActual: boolean): void {
    let correctedOffset = offset;
    if (isActual) {
      this._actualOffset = offset;
      correctedOffset = Math.min(this._maxOffset, Math.max(0, offset));
    }

    if (this._currentOffset !== correctedOffset) {
      this._currentOffset = correctedOffset;
      this._updateTrackingWindows(offset);
      let startIndex = 0;
      if (this._visibleIndexes.length > 0) {
        startIndex = this._visibleIndexes[0]!;
      }
      this._fitAndUpdate(startIndex);
    }
  }

  public getLastOffset(): number {
    return this._currentOffset;
  }

  public getLastActualOffset(): number {
    return this._actualOffset;
  }

  public getEngagedIndexes(): number[] {
    return this._engagedIndexes;
  }

  public updateRenderAheadOffset(renderAheadOffset: number): void {
    this._renderAheadOffset = Math.max(0, renderAheadOffset);
    this.forceRefreshWithOffset(this._currentOffset);
  }

  public getCurrentRenderAheadOffset(): number {
    return this._renderAheadOffset;
  }
  public setActualOffset(actualOffset: number): void {
    this._actualOffset = actualOffset;
  }

  private _getLayoutByIndex(index: number = 0) {
    return {
      x: this._layout.width * index,
      y: 0,
      width: this._layout.width,
      height: this._layout.height,
    };
  }

  private _fitAndUpdate(startIndex: number): void {
    const newVisibleItems: number[] = [];
    const newEngagedItems: number[] = [];
    this._fitIndexes(newVisibleItems, newEngagedItems, startIndex, true);
    this._fitIndexes(newVisibleItems, newEngagedItems, startIndex + 1, false);
    this._diffUpdateOriginalIndexesAndRaiseEvents(
      newVisibleItems,
      newEngagedItems
    );
  }

  private _doInitialFit(offset: number): void {
    offset = Math.min(this._maxOffset, Math.max(0, offset));
    this._updateTrackingWindows(offset);
    const firstVisibleIndex =
      Math.floor(this._visibleWindow.start / this._layout.width) - 1;

    this._fitAndUpdate(firstVisibleIndex);
  }

  private _fitIndexes(
    newVisibleIndexes: number[],
    newEngagedIndexes: number[],
    startIndex: number,
    isReverse: boolean
  ): void {
    const count = this._itemCount;
    const relevantDim: Range = { start: 0, end: 0 };
    let i = 0;
    let atLeastOneLocated = false;
    if (startIndex < count) {
      if (!isReverse) {
        for (i = startIndex; i < count; i++) {
          if (
            this._checkIntersectionAndReport(
              i,
              false,
              relevantDim,
              newVisibleIndexes,
              newEngagedIndexes
            )
          ) {
            atLeastOneLocated = true;
          } else {
            if (atLeastOneLocated) {
              break;
            }
          }
        }
      } else {
        for (i = startIndex; i >= 0; i--) {
          if (
            this._checkIntersectionAndReport(
              i,
              true,
              relevantDim,
              newVisibleIndexes,
              newEngagedIndexes
            )
          ) {
            atLeastOneLocated = true;
          } else {
            if (atLeastOneLocated) {
              break;
            }
          }
        }
      }
    }
  }

  private _checkIntersectionAndReport(
    index: number,
    insertOnTop: boolean,
    relevantDim: Range,
    newVisibleIndexes: number[],
    newEngagedIndexes: number[]
  ): boolean {
    const itemRect = this._getLayoutByIndex(index);
    let isFound = false;
    this._setRelevantBounds(itemRect, relevantDim);
    if (this._itemIntersectsVisibleWindow(relevantDim.start, relevantDim.end)) {
      if (insertOnTop) {
        newVisibleIndexes.splice(0, 0, index);
        newEngagedIndexes.splice(0, 0, index);
      } else {
        newVisibleIndexes.push(index);
        newEngagedIndexes.push(index);
      }
      isFound = true;
    } else if (
      this._itemIntersectsEngagedWindow(relevantDim.start, relevantDim.end)
    ) {
      //TODO: This needs to be optimized
      if (insertOnTop) {
        newEngagedIndexes.splice(0, 0, index);
      } else {
        newEngagedIndexes.push(index);
      }
      isFound = true;
    }
    return isFound;
  }

  private _setRelevantBounds(itemRect: Layout, relevantDim: Range): void {
    relevantDim.end = itemRect.x + itemRect.width;
    relevantDim.start = itemRect.x;
  }

  private _isItemInBounds(window: Range, itemBound: number): boolean {
    return window.start < itemBound && window.end > itemBound;
  }

  private _isItemBoundsBeyondWindow(
    window: Range,
    startBound: number,
    endBound: number
  ): boolean {
    return window.start >= startBound && window.end <= endBound;
  }

  private _isZeroHeightEdgeElement(
    window: Range,
    startBound: number,
    endBound: number
  ): boolean {
    return (
      startBound - endBound === 0 &&
      (window.start === startBound || window.end === endBound)
    );
  }

  private _itemIntersectsWindow(
    window: Range,
    startBound: number,
    endBound: number
  ): boolean {
    return (
      this._isItemInBounds(window, startBound) ||
      this._isItemInBounds(window, endBound) ||
      this._isItemBoundsBeyondWindow(window, startBound, endBound) ||
      this._isZeroHeightEdgeElement(window, startBound, endBound)
    );
  }

  private _itemIntersectsEngagedWindow(
    startBound: number,
    endBound: number
  ): boolean {
    return this._itemIntersectsWindow(
      this._engagedWindow,
      startBound,
      endBound
    );
  }

  private _itemIntersectsVisibleWindow(
    startBound: number,
    endBound: number
  ): boolean {
    return this._itemIntersectsWindow(
      this._visibleWindow,
      startBound,
      endBound
    );
  }

  private _updateTrackingWindows(offset: number): void {
    const startOffset = offset;
    const endOffset = offset + this._windowBound;

    this._engagedWindow.start = Math.max(
      0,
      startOffset - this._renderAheadOffset
    );
    this._engagedWindow.end = endOffset + this._renderAheadOffset;

    this._visibleWindow.start = startOffset;
    this._visibleWindow.end = endOffset;
  }

  //TODO:Talha optimize this
  private _diffUpdateOriginalIndexesAndRaiseEvents(
    newVisibleItems: number[],
    newEngagedItems: number[]
  ): void {
    this._diffArraysAndCallFunc(
      newVisibleItems,
      this._visibleIndexes,
      this.onVisibleRowsChanged
    );
    if (
      this.onVisibleColumnChanged &&
      newVisibleItems.length !== 0 &&
      !!this._columnsPerPage
    ) {
      const startIndex = newVisibleItems[0]!;
      const startOffset = startIndex * this._windowBound;
      const columnWidth = this._windowBound / this._columnsPerPage!;
      const column = Math.round(
        (this._currentOffset - startOffset) / columnWidth
      );
      if (
        this._startColumn?.index !== startIndex ||
        this._startColumn?.columns !== column
      ) {
        this.onVisibleColumnChanged({
          index: startIndex,
          column,
          offset: startOffset + column * columnWidth,
        });
        this._startColumn = { index: startIndex, columns: column };
      }
    }
    this._diffArraysAndCallFunc(
      newEngagedItems,
      this._engagedIndexes,
      this.onEngagedRowsChanged
    );
    this._visibleIndexes = newVisibleItems;
    this._engagedIndexes = newEngagedItems;
  }

  private _diffArraysAndCallFunc(
    newItems: number[],
    oldItems: number[],
    func: TOnItemStatusChanged | null
  ): void {
    if (func) {
      const now = this._calculateArrayDiff(newItems, oldItems);
      const notNow = this._calculateArrayDiff(oldItems, newItems);
      if (now.length > 0 || notNow.length > 0) {
        func([...newItems], now, notNow);
      }
    }
  }

  private _calculateArrayDiff(arr1: number[], arr2: number[]): number[] {
    const len = arr1.length;
    const diffArr: number[] = [];
    for (let i = 0; i < len; i++) {
      if (BinarySearch.findIndexOf(arr2, arr1[i]!) === -1) {
        diffArr.push(arr1[i]!);
      }
    }
    return diffArr;
  }
}
