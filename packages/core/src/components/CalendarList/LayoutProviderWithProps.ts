import { LayoutProvider } from 'recyclerlistview';

import type { CalendarListProps } from './types';

export default class LayoutProviderWithProps extends LayoutProvider {
  private props: CalendarListProps;
  private _hasExpired = false;

  constructor(props: CalendarListProps) {
    super(
      () => 'listItem',
      (_type, dimension, index) => {
        const { numColumns = 1, data, layoutSize } = props;
        const { width, height } = layoutSize;

        // Calculate dimensions
        const totalPages = Math.floor(data.length / numColumns);
        const extraColumns = data.length % numColumns;
        const isLastPage = totalPages === index;

        // Set height consistently
        dimension.height = height;

        // Handle width calculation
        if (isLastPage && extraColumns > 0) {
          const columnWidth = width / numColumns;
          dimension.width = width - (numColumns - extraColumns) * columnWidth;
        } else {
          dimension.width = width;
        }
      }
    );
    this.props = props;
  }

  public updateProps(props: CalendarListProps): LayoutProviderWithProps {
    this._hasExpired =
      this._hasExpired ||
      this.props.layoutSize.width !== props.layoutSize.width ||
      this.props.numColumns !== props.numColumns ||
      this.props.data.length !== props.data.length ||
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
