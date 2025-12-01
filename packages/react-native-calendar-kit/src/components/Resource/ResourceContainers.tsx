import React, { useMemo } from 'react';
import { View } from 'react-native';
import { ResourceItem } from '../../types';
import { DateResourceItem } from './ResourceListView';

interface ResourceContainerProps {
  resources?: ResourceItem[];
  items?: DateResourceItem[];
  renderItem: (item: {
    items: ResourceItem[];
    index: number;
  }) => React.ReactNode;
  itemSize: number;
  visibleRange: { start: number; end: number };
  totalSize: number;
  getItemPosition: (index: number) => number;
  resourcePerPage: number;
}

export const ResourceContainer = React.memo(
  ({
    resources,
    items,
    renderItem,
    itemSize,
    visibleRange,
    totalSize,
    resourcePerPage,
    getItemPosition,
  }: ResourceContainerProps) => {
    const renderItems = useMemo(() => {
      const renderedItems: React.ReactNode[] = [];
      const firstVisiblePosition = getItemPosition(visibleRange.start);

      // Dual-axis mode: items provided (date+resource pairs)
      // Each item is rendered individually, one resource per position
      if (items) {
        for (
          let itemIndex = visibleRange.start;
          itemIndex <= Math.min(visibleRange.end, items.length - 1);
          itemIndex++
        ) {
          const item = items[itemIndex];
          const absolutePosition = getItemPosition(itemIndex);
          const relativePosition = absolutePosition - firstVisiblePosition;
          const key = `item-${itemIndex}`;

          renderedItems.push(
            <View
              key={key}
              style={{
                position: 'absolute',
                left: relativePosition,
                width: itemSize,
                height: '100%',
              }}>
              {renderItem({
                items: [item.resource],
                index: itemIndex,
              })}
            </View>
          );
        }
        return renderedItems;
      }

      // Regular mode: resources grouped into pages
      if (!resources) {
        return renderedItems;
      }

      const pageCount = Math.ceil(resources.length / resourcePerPage);
      for (
        let pageIndex = visibleRange.start;
        pageIndex <= Math.min(visibleRange.end, pageCount - 1);
        pageIndex++
      ) {
        const startIndex = pageIndex * resourcePerPage;
        const endIndex = Math.min(
          startIndex + resourcePerPage,
          resources.length
        );
        const pageResources = resources.slice(startIndex, endIndex);

        if (pageResources.length > 0) {
          const absolutePosition = getItemPosition(pageIndex);
          const relativePosition = absolutePosition - firstVisiblePosition;
          const key = `page-${pageIndex}`;

          renderedItems.push(
            <View
              key={key}
              style={{
                position: 'absolute',
                left: relativePosition,
                width: itemSize,
                height: '100%',
              }}>
              {renderItem({
                items: pageResources,
                index: pageIndex,
              })}
            </View>
          );
        }
      }

      return renderedItems;
    }, [
      visibleRange.start,
      visibleRange.end,
      resources,
      items,
      resourcePerPage,
      getItemPosition,
      itemSize,
      renderItem,
    ]);

    const firstVisiblePosition =
      visibleRange.start > 0 ? getItemPosition(visibleRange.start) : 0;

    return (
      <View
        style={{
          position: 'relative',
          width: totalSize,
          height: '100%',
          transform: [{ translateX: firstVisiblePosition }],
        }}>
        {renderItems}
      </View>
    );
  }
);

ResourceContainer.displayName = 'ResourceContainer';
