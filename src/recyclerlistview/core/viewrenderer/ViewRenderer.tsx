import * as React from 'react';
import { View, ViewProps } from 'react-native';
import { LayoutManager } from '../layoutmanager/LayoutManager';
import { BaseLayoutProvider } from '../dependencies/LayoutProvider';
import { ComponentCompat } from '../../utils/ComponentCompat';
export interface ViewRendererProps<T> {
  x: number;
  y: number;
  height: number;
  width: number;
  childRenderer: (
    index: number,
    extendedState?: object
  ) => JSX.Element | JSX.Element[] | null;
  index: number;
  extendedState?: object;
  internalSnapshot?: object;
  layoutProvider?: BaseLayoutProvider;
  renderItemContainer?: (
    props: object,
    parentProps: ViewRendererProps<T>,
    children?: React.ReactNode
  ) => React.ReactNode;
}

/***
 * View renderer is responsible for creating a container of size provided by LayoutProvider and render content inside it.
 * Also enforces a logic to prevent re renders. RecyclerListView keeps moving these ViewRendereres around using transforms to enable recycling.
 * View renderer will only update if its position, dimensions or given data changes. Make sure to have a relevant shouldComponentUpdate as well.
 * This is second of the two things recycler works on. Implemented both for web and react native.
 */
export default class ViewRenderer extends ComponentCompat<
  ViewRendererProps<any>,
  {}
> {
  public isRendererMounted: boolean = true;

  public shouldComponentUpdate(newProps: ViewRendererProps<any>): boolean {
    const hasMoved = this.props.x !== newProps.x || this.props.y !== newProps.y;

    const hasSizeChanged =
      this.props.width !== newProps.width ||
      this.props.height !== newProps.height ||
      this.props.layoutProvider !== newProps.layoutProvider;

    const hasExtendedStateChanged =
      this.props.extendedState !== newProps.extendedState;
    const hasInternalSnapshotChanged =
      this.props.internalSnapshot !== newProps.internalSnapshot;
    let shouldUpdate =
      hasSizeChanged ||
      hasExtendedStateChanged ||
      hasInternalSnapshotChanged ||
      hasMoved;

    return shouldUpdate;
  }
  public componentWillMountCompat(): void {}
  public componentWillUnmount(): void {
    this.isRendererMounted = false;
  }

  protected renderChild(): JSX.Element | JSX.Element[] | null {
    return this.props.childRenderer(this.props.index, this.props.extendedState);
  }

  private _viewRef: React.Component<ViewProps, React.ComponentState> | null =
    null;
  private _layoutManagerRef?: LayoutManager;
  public renderCompat(): JSX.Element {
    const props = {
      ref: this._setRef,
      style: {
        left: this.props.x,
        position: 'absolute',
        top: this.props.y,
        height: this.props.height,
        width: this.props.width,
      },
    };
    return this._renderItemContainer(
      props,
      this.props,
      this.renderChild()
    ) as JSX.Element;
  }

  public componentDidUpdate(): void {
    if (this.props.layoutProvider && this._layoutManagerRef) {
      if (
        this.props.layoutProvider.getLayoutManager() !== this._layoutManagerRef
      ) {
        this._layoutManagerRef = this.props.layoutProvider.getLayoutManager();
      }
    }
  }

  public componentDidMount(): void {
    if (this.props.layoutProvider) {
      this._layoutManagerRef = this.props.layoutProvider.getLayoutManager();
    }
  }

  protected getRef(): object | null {
    return this._viewRef;
  }

  private _renderItemContainer(
    props: object,
    parentProps: ViewRendererProps<any>,
    children: React.ReactNode
  ): React.ReactNode {
    return (
      (this.props.renderItemContainer &&
        this.props.renderItemContainer(props, parentProps, children)) || (
        <View {...props}>{children}</View>
      )
    );
  }

  private _setRef = (
    view: React.Component<ViewProps, React.ComponentState> | null
  ): void => {
    this._viewRef = view;
  };
}
