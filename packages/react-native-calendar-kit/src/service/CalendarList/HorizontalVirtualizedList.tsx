import React, { useMemo } from 'react';
import { View } from 'react-native';

interface HorizontalVirtualizedListProps {
  count: number;
  renderItem: (item: { item: number; index: number }) => React.ReactNode;
  keyExtractor: (item: number, index: number) => string;
  itemSize: number;
  visibleRange: { start: number; end: number };
  totalSize: number;
  getItemPosition: (index: number) => number;
}

export const HorizontalVirtualizedList = React.memo(
  ({
    count,
    renderItem,
    keyExtractor,
    itemSize,
    visibleRange,
    totalSize,
    getItemPosition,
  }: HorizontalVirtualizedListProps) => {
    const renderItems = useMemo(() => {
      const items: React.ReactNode[] = [];

      const firstVisiblePosition = getItemPosition(visibleRange.start);

      for (let i = visibleRange.start; i <= visibleRange.end; i++) {
        if (i < count) {
          const key = keyExtractor(i, i);
          const absolutePosition = getItemPosition(i);
          const relativePosition = Math.round(
            absolutePosition - firstVisiblePosition
          );

          items.push(
            <View
              key={key}
              style={{
                position: 'absolute',
                left: relativePosition,
                width: itemSize,
                height: '100%',
              }}
            >
              {renderItem({ item: i, index: i })}
            </View>
          );
        }
      }

      return items;
    }, [
      visibleRange.start,
      visibleRange.end,
      count,
      keyExtractor,
      getItemPosition,
      renderItem,
      itemSize,
    ]);

    // Calculate container transform to handle large offsets
    const firstVisiblePosition =
      visibleRange.start > 0 ? getItemPosition(visibleRange.start) : 0;

    return (
      <View
        style={{
          position: 'relative',
          width: totalSize,
          height: '100%',
          // Use transform to handle large offsets instead of large absolute positions
          transform: [{ translateX: firstVisiblePosition }],
        }}
      >
        {renderItems}
      </View>
    );
  }
);

HorizontalVirtualizedList.displayName = 'HorizontalVirtualizedList';
