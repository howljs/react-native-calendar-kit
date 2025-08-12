import React, { useMemo } from 'react';
import { View } from 'react-native';
import { ResourceItem } from '../../types';

interface ResourceContainerProps {
  resources?: ResourceItem[];
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
    renderItem,
    itemSize,
    visibleRange,
    totalSize,
    resourcePerPage,
    getItemPosition,
  }: ResourceContainerProps) => {
    const renderItems = useMemo(() => {
      const items: React.ReactNode[] = [];
      if (!resources) {
        return items;
      }

      const firstVisiblePosition = getItemPosition(visibleRange.start);
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

          items.push(
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

      return items;
    }, [
      visibleRange.start,
      visibleRange.end,
      resources,
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
