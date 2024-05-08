/***
 * Computes the positions and dimensions of items that will be rendered by the list. The output from this is utilized by viewability tracker to compute the
 * lists of visible/hidden item.
 */
import { Dimension } from '../dependencies/LayoutProvider';

export abstract class LayoutManager {
  public getOffsetForIndex(index: number): Point {
    const layout = this.getLayout(index);
    return { x: layout.x, y: layout.y };
  }

  //You can ovveride this incase you want to override style in some cases e.g, say you want to enfore width but not height
  public getStyleOverridesForIndex(_index: number): object | undefined {
    return undefined;
  }

  //Return the dimension of entire content inside the list
  public abstract getContentDimension(): Dimension;

  //Return all computed layouts as an array, frequently called, you are expected to return a cached array. Don't compute here.
  public abstract getLayout(index?: number): Layout;

  //Recompute layouts from given index, compute heavy stuff should be here
  public abstract relayout(itemCount: number): void;
}

export class WrapLayoutManager extends LayoutManager {
  private _window: Dimension;
  private _totalHeight: number;
  private _totalWidth: number;

  constructor(renderWindowSize: Dimension) {
    super();
    this._window = renderWindowSize;
    this._totalHeight = 0;
    this._totalWidth = 0;
  }

  public getContentDimension(): Dimension {
    return { height: this._totalHeight, width: this._totalWidth };
  }

  public getLayout(index: number = 0): Layout {
    return {
      x: this._window.width * index,
      y: 0,
      width: this._window.width,
      height: this._window.height,
    };
  }

  public getOffsetForIndex(index: number): Point {
    const layout = this.getLayout(index);
    return { x: layout.x, y: layout.y };
  }

  public setMaxBounds(itemDim: Dimension): void {
    itemDim.height = Math.min(this._window.height, itemDim.height);
  }

  public relayout(itemCount: number): void {
    this._totalHeight = this._window.height;
    this._totalWidth = itemCount * this._window.width;
  }
}

export interface Layout extends Dimension, Point {}
export interface Point {
  x: number;
  y: number;
}
