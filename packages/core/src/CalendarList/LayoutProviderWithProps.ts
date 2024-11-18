import { LayoutProvider } from 'recyclerlistview';

import type { CalendarListProps } from './types';

export default class LayoutProviderWithProps<T> extends LayoutProvider {
  private props: CalendarListProps<T>;
  private _hasExpired = false;

  constructor(props: CalendarListProps<T>) {
    super(
      () => 'listItem',
      (_type, dimension, _index) => {
        dimension.width = props.layoutSize.width;
        dimension.height = props.layoutSize.height;
      }
    );
    this.props = props;
  }

  public updateProps(props: CalendarListProps<T>): LayoutProviderWithProps<T> {
    this._hasExpired =
      this._hasExpired ||
      this.props.layoutSize.width !== props.layoutSize.width ||
      this.props.layoutSize.height !== props.layoutSize.height;
    this.props = props;
    return this;
  }

  /**
   * This methods returns true if the layout provider has expired and needs to be recreated.
   * This can happen if the number of columns has changed or the render window size has changed in a way that cannot be handled by the layout provider internally.
   */
  public get hasExpired() {
    return this._hasExpired;
  }

  /**
   * Calling this method will mark the layout provider as expired. As a result, a new one will be created by FlashList and old cached layouts will be discarded.
   */
  public markExpired() {
    this._hasExpired = true;
  }
}
