import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native';
import Animated, {
  AnimatedRef,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { ResourceItem } from '../../types';
import { ResourceContainer } from './ResourceContainers';

export interface DateResourceItem {
  date: number;
  resource: ResourceItem;
}

export interface ResourceListViewProps {
  animatedRef?: AnimatedRef<Animated.ScrollView>;
  width: number;
  height: number;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  resources?: ResourceItem[];
  items?: DateResourceItem[];
  resourcePerPage: number;
  drawDistance?: number;
  renderItem: (item: {
    items: ResourceItem[];
    index: number;
  }) => React.ReactNode;
  pagingEnabled?: boolean;
  scrollEnabled?: boolean;
  renderOverlay?: (props: {
    totalSize: number;
    resources: ResourceItem[];
  }) => React.ReactNode;
  onTouchStart?: (event: GestureResponderEvent) => void;
  scrollEventThrottle?: number;
  onWheel?: (event: WheelEvent) => void;
  snapToOffsets?: number[];
  onScrollOffsetChange?: (offset: number) => void;
  initialOffset?: number;
}

export interface ResourceListViewRef {
  setVisibleDate: (date: number) => void;
}

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const ResourceListView = forwardRef<Animated.ScrollView, ResourceListViewProps>(
  (
    {
      width,
      height,
      onScroll,
      resources,
      items,
      resourcePerPage,
      drawDistance = width * 2,
      renderItem,
      pagingEnabled = false,
      renderOverlay,
      scrollEnabled,
      onTouchStart,
      scrollEventThrottle = 16,
      onWheel,
      snapToOffsets,
      onScrollOffsetChange,
      initialOffset = 0,
    },
    ref
  ) => {
    const [viewportWidth, setViewportWidth] = useState(0);
    const [scrollOffset, setScrollOffset] = useState(initialOffset);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const scrollViewRef = useRef<Animated.ScrollView>(null);

    // Dual-axis mode (items provided): each item is a separate resource
    // Regular mode (resources only): items grouped into pages
    const isDualAxisMode = !!items;

    const itemsLength = items?.length ?? resources?.length ?? 0;
    const count = isDualAxisMode
      ? itemsLength
      : Math.ceil(itemsLength / resourcePerPage);

    const itemWidth = width / resourcePerPage;
    const totalSize = isDualAxisMode
      ? itemsLength * itemWidth
      : itemsLength * itemWidth;
    const snapToInterval = itemWidth;

    const visibleRange = useMemo(() => {
      if (viewportWidth === 0 || count === 0) {
        return { start: 0, end: 0 };
      }

      const buffer = drawDistance;
      const scrollStart = Math.max(0, scrollOffset - buffer);
      const scrollEnd = scrollOffset + viewportWidth + buffer;

      // In dual-axis mode, calculate range based on individual item width
      // In regular mode, calculate based on page width
      const positionWidth = isDualAxisMode ? itemWidth : width;
      const startIndex = Math.max(0, Math.floor(scrollStart / positionWidth));
      const endIndex = Math.min(count - 1, Math.floor(scrollEnd / positionWidth));
      return { start: startIndex, end: endIndex };
    }, [
      count,
      scrollOffset,
      viewportWidth,
      drawDistance,
      width,
      isDualAxisMode,
      itemWidth,
    ]);

    const animScrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollOffsetAnim = useScrollViewOffset(animScrollRef);

    const throttledSetScrollOffset = useCallback(
      (offset: number) => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          setScrollOffset(offset);
          onScrollOffsetChange?.(offset);
        }, 16);
      },
      [onScrollOffsetChange]
    );

    useAnimatedReaction(
      () => scrollOffsetAnim.value,
      (offset) => {
        runOnJS(throttledSetScrollOffset)(offset);
      }
    );

    useEffect(() => {
      return () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, []);

    useEffect(() => {
      if (initialOffset > 0 && scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: initialOffset,
            animated: false,
          });
        }, 0);
      }
    }, [initialOffset]);

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
      const { width: viewWidth } = event.nativeEvent.layout;
      setViewportWidth(viewWidth);
    }, []);

    const getItemPosition = useCallback(
      (index: number) => {
        // In dual-axis mode, position each item individually
        // In regular mode, position pages
        return isDualAxisMode ? index * itemWidth : index * width;
      },
      [isDualAxisMode, itemWidth, width]
    );

    return (
      <AnimatedScrollView
        ref={(node) => {
          if (node) {
            scrollViewRef.current = node as any;
            if (typeof ref === 'function') {
              ref(node as any);
            } else if (ref) {
              (ref as any).current = node;
            }
            animScrollRef(node as any);
          }
        }}
        horizontal
        onScroll={onScroll}
        onLayout={handleLayout}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        snapToOffsets={snapToOffsets}
        snapToInterval={
          snapToOffsets
            ? undefined
            : isDualAxisMode
              ? snapToInterval
              : pagingEnabled
                ? undefined
                : snapToInterval
        }
        pagingEnabled={isDualAxisMode ? false : pagingEnabled}
        disableIntervalMomentum={snapToOffsets ? true : isDualAxisMode ? true : !pagingEnabled}
        scrollEnabled={scrollEnabled}
        scrollEventThrottle={scrollEventThrottle}
        onTouchStart={onTouchStart}
        {...{ onWheel }}
        style={{ height }}>
        <View style={{ width: totalSize, height: '100%' }}>
          <ResourceContainer
            resources={resources}
            items={items}
            resourcePerPage={resourcePerPage}
            itemSize={isDualAxisMode ? itemWidth : width}
            visibleRange={visibleRange}
            totalSize={totalSize}
            getItemPosition={getItemPosition}
            renderItem={renderItem}
          />
          {!!renderOverlay && (
            <View
              id="overlay-view"
              style={[
                { position: 'absolute', height, width: totalSize, zIndex: 999 },
              ]}
              pointerEvents="box-none">
              {renderOverlay({ totalSize, resources: resources ?? [] })}
            </View>
          )}
        </View>
      </AnimatedScrollView>
    );
  }
);

export default ResourceListView;
