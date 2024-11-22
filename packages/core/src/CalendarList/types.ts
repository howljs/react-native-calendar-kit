import type React from 'react';
import type { ScrollViewProps } from 'react-native';

export interface ListRenderItemInfo {
  item: number;
  index: number;
  extraData?: any;
  columnIndex: number;
}

export interface ListRenderItemContainerInfo {
  item: number;
  index: number;
  extraData?: any;
  children: React.ReactNode;
}

export type ListRenderItem = (info: ListRenderItemInfo) => React.ReactElement | null;

export type ListRenderItemContainer = (
  info: ListRenderItemContainerInfo
) => React.ReactElement | null;

export interface CalendarListProps
  extends Omit<
    ScrollViewProps,
    'horizontal' | 'removeClippedSubviews' | 'style' | 'contentContainerStyle'
  > {
  data: readonly number[];

  layoutSize: { height: number; width: number };

  renderItem?: ListRenderItem | null | undefined;

  renderItemContainer?: ListRenderItemContainer | null | undefined;

  numColumns?: number | undefined;

  initialDate?: number | undefined;

  /**
   * Render ahead item count
   */
  renderAheadItem?: number;

  /**
   * A marker property for telling the list to re-render (since it implements PureComponent).
   * If any of your `renderItem`, Header, Footer, etc. functions depend on anything outside of the `data` prop,
   * stick it here and treat it immutably.
   */
  extraData?: any;

  /**
   * Used to extract a unique key for a given item at the specified index.
   * Key is used for optimizing performance. Defining `keyExtractor` is also necessary
   * when doing [layout animations](https://shopify.github.io/flash-list/docs/guides/layout-animation)
   * to uniquely identify animated components.
   */
  keyExtractor?: ((item: number, index: number) => string) | undefined;

  /**
   * This event is raised once the list has drawn items on the screen. It also reports @param elapsedTimeInMs which is the time it took to draw the items.
   * This is required because FlashList doesn't render items in the first cycle. Items are drawn after it measures itself at the end of first render.
   * If you're using ListEmptyComponent, this event is raised as soon as ListEmptyComponent is rendered.
   */
  onLoad?: () => void;

  onVisibleItemChanged?: (item: number) => void;
}
