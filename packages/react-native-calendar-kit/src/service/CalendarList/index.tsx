import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { HorizontalVirtualizedList } from './HorizontalVirtualizedList';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
  AnimatedRef,
  useAnimatedRef,
  useScrollViewOffset,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface CalendarListProps {
  count: number;
  renderItem: (item: { item: number; index: number }) => React.ReactNode;
  keyExtractor?: (item: number, index: number) => string;
  itemSize: number;
  drawDistance?: number;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  style?: any;
  contentContainerStyle?: any;
  initialScrollIndex?: number;
  pagingEnabled?: boolean;
  snapToInterval?: number;
  initialOffset?: number;
  snapToOffsets?: number[];
  animatedRef?: AnimatedRef<Animated.ScrollView>;
  onVisibleColumnChanged?: (props: {
    index: number;
    column: number;
    columns: number;
    extraScrollData: Record<string, any>;
    offset: number;
  }) => void;
  columnsPerPage: number;
  extraScrollData: any;
  scrollEventThrottle?: number;
  scrollEnabled?: boolean;
  onLoad?: () => void;
}

export interface CalendarListRef {
  scrollToIndex: (index: number, animated?: boolean) => void;
  scrollToOffset: (offset: number, animated?: boolean) => void;
  getScrollableNode: () => ScrollView | null;
  getMaxOffset: (visibleColumns?: number) => number;
  isScrollable: (offset: number, visibleColumns?: number) => boolean;
}

const DEFAULT_DRAW_DISTANCE = 600; // Larger buffer for horizontal scrolling

export const CalendarList = React.forwardRef<
  CalendarListRef,
  CalendarListProps
>(
  (
    {
      count,
      animatedRef,
      renderItem,
      keyExtractor = (item) => item.toString(),
      itemSize,
      drawDistance = DEFAULT_DRAW_DISTANCE,
      onScroll,
      onLayout,
      style,
      contentContainerStyle,
      initialScrollIndex,
      pagingEnabled = false,
      snapToInterval,
      initialOffset,
      snapToOffsets,
      onVisibleColumnChanged,
      columnsPerPage,
      extraScrollData,
      scrollEventThrottle = 16,
      scrollEnabled = true,
      onLoad,
    },
    ref
  ) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [viewportWidth, setViewportWidth] = useState(0);
    const [scrollOffset, setScrollOffset] = useState(0);
    const isLoaded = useRef(false);

    const totalSize = useMemo(() => {
      return count * itemSize;
    }, [count, itemSize]);

    const visibleRange = useMemo(() => {
      if (viewportWidth === 0 || count === 0) {
        return { start: 0, end: 0 };
      }

      const buffer = drawDistance;
      const scrollStart = Math.max(0, scrollOffset - buffer);
      const scrollEnd = scrollOffset + viewportWidth + buffer;
      const startIndex = Math.max(0, Math.floor(scrollStart / itemSize));
      const endIndex = Math.min(count - 1, Math.floor(scrollEnd / itemSize));
      return { start: startIndex, end: endIndex };
    }, [count, scrollOffset, viewportWidth, drawDistance, itemSize]);

    const getItemPosition = useCallback(
      (index: number) => {
        return index * itemSize;
      },
      [itemSize]
    );

    const animScrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollOffsetAnim = useScrollViewOffset(animScrollRef);

    const handleColumnChanged = useCallback(
      (offset: number) => {
        const columnWidth = itemSize / columnsPerPage;
        const startIndex = Math.floor(
          Math.round(offset / columnWidth) / columnsPerPage
        );
        const startOffset = startIndex * itemSize;
        const column = Math.round((offset - startOffset) / columnWidth);

        onVisibleColumnChanged?.({
          index: startIndex,
          column,
          columns: columnsPerPage,
          extraScrollData,
          offset,
        });
      },
      [itemSize, columnsPerPage, onVisibleColumnChanged, extraScrollData]
    );

    useAnimatedReaction(
      () => scrollOffsetAnim.value,
      (offset) => {
        runOnJS(handleColumnChanged)(offset);
        runOnJS(setScrollOffset)(offset);
      }
    );

    const handleLayout = useCallback(
      (event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout;
        setViewportWidth(width);
        onLayout?.(event);
      },
      [onLayout]
    );

    useImperativeHandle(
      ref,
      () => ({
        scrollToIndex: (index: number, animated: boolean = true) => {
          if (index >= 0 && index < count) {
            const position = getItemPosition(index);
            scrollViewRef.current?.scrollTo({
              x: position,
              animated,
            });
          }
        },
        scrollToOffset: (offset: number, animated: boolean = true) => {
          scrollViewRef.current?.scrollTo({
            x: offset,
            animated,
          });
        },
        getScrollableNode: () => scrollViewRef.current,
        getMaxOffset: (visibleColumns?: number) => {
          if (!visibleColumns || !columnsPerPage) {
            return totalSize - itemSize;
          }

          const columnWidth = itemSize / columnsPerPage;
          return totalSize - columnWidth * visibleColumns;
        },
        isScrollable: (offset: number, visibleColumns?: number) => {
          let maxOffset: number;
          if (!visibleColumns || !columnsPerPage) {
            maxOffset = totalSize - itemSize;
          } else {
            const columnWidth = itemSize / columnsPerPage;
            maxOffset = totalSize - columnWidth * visibleColumns;
          }
          return offset >= 0 && offset <= maxOffset && offset !== scrollOffset;
        },
      }),
      [
        columnsPerPage,
        count,
        getItemPosition,
        itemSize,
        scrollOffset,
        totalSize,
      ]
    );

    useLayoutEffect(() => {
      if (viewportWidth > 0 && count > 0) {
        let offset = initialOffset;
        if (typeof initialScrollIndex === 'number') {
          const targetIndex = Math.min(initialScrollIndex, count - 1);
          offset = getItemPosition(targetIndex);
        }
        if (offset !== undefined) {
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({
              x: offset,
              animated: false,
            });
          }, 0);
        }
      }
    }, [
      initialScrollIndex,
      viewportWidth,
      count,
      getItemPosition,
      initialOffset,
    ]);

    useEffect(() => {
      setTimeout(() => {
        if (!isLoaded.current) {
          isLoaded.current = true;
          onLoad?.();
        }
      }, 0);
    }, [onLoad]);

    return (
      <AnimatedScrollView
        ref={(node: any) => {
          scrollViewRef.current = node;
          animScrollRef?.(node);
          animatedRef?.(node);
        }}
        horizontal={true}
        style={style}
        contentContainerStyle={[contentContainerStyle, { width: totalSize }]}
        onScroll={onScroll}
        onLayout={handleLayout}
        scrollEventThrottle={scrollEventThrottle}
        scrollEnabled={scrollEnabled}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        pagingEnabled={pagingEnabled}
        disableIntervalMomentum={!!snapToOffsets || !!snapToInterval}
        snapToInterval={snapToInterval}
        snapToOffsets={snapToOffsets}>
        <HorizontalVirtualizedList
          count={count}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          itemSize={itemSize}
          visibleRange={visibleRange}
          totalSize={totalSize}
          getItemPosition={getItemPosition}
        />
      </AnimatedScrollView>
    );
  }
);

CalendarList.displayName = 'CalendarList';
