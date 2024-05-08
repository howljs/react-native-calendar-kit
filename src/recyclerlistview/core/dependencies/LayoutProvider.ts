import {
  LayoutManager,
  WrapLayoutManager,
} from '../layoutmanager/LayoutManager';

/**
 * Created by talha.naqvi on 05/04/17.
 * You can create a new instance or inherit and override default methods
 * You may need access to data provider here, it might make sense to pass a function which lets you fetch the latest data provider
 * Why only indexes? The answer is to allow data virtualization in the future. Since layouts are accessed much before the actual render assuming having all
 * data upfront will only limit possibilites in the future.
 *
 * By design LayoutProvider forces you to think in terms of view types. What that means is that you'll always be dealing with a finite set of view templates
 * with deterministic dimensions. We want to eliminate unnecessary re-layouts that happen when height, by mistake, is not taken into consideration.
 * This patters ensures that your scrolling is as smooth as it gets. You can always increase the number of types to handle non deterministic scenarios.
 *
 * NOTE: You can also implement features such as ListView/GridView switch by simple changing your layout provider.
 */

export abstract class BaseLayoutProvider {
  private _lastLayoutManager?: LayoutManager;

  public createLayoutManager(): LayoutManager {
    this._lastLayoutManager = this.toLayoutManager();
    return this._lastLayoutManager;
  }

  public getLayoutManager(): LayoutManager | undefined {
    return this._lastLayoutManager;
  }

  protected abstract toLayoutManager(): LayoutManager;

  public abstract getLayoutSize(): Dimension;
}

export class LayoutProvider extends BaseLayoutProvider {
  private _layoutSize: Dimension;

  constructor(dim: Dimension) {
    super();
    this._layoutSize = dim;
  }

  public toLayoutManager(): LayoutManager {
    return new WrapLayoutManager(this._layoutSize);
  }

  public getLayoutSize(): Dimension {
    return this._layoutSize;
  }
}

export interface Dimension {
  height: number;
  width: number;
}
