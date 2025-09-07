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

export interface ResourceListViewProps {
  animatedRef?: AnimatedRef<Animated.ScrollView>;
  width: number;
  height: number;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  resources?: ResourceItem[];
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
      resourcePerPage,
      drawDistance = width * 2,
      renderItem,
      pagingEnabled = false,
      renderOverlay,
      scrollEnabled,
      onTouchStart,
    },
    ref
  ) => {
    const [viewportWidth, setViewportWidth] = useState(0);
    const [scrollOffset, setScrollOffset] = useState(0);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const count = Math.ceil((resources?.length ?? 0) / resourcePerPage);

    const totalSize = (resources?.length ?? 0) * (width / resourcePerPage);
    const snapToInterval = width / resourcePerPage;

    const visibleRange = useMemo(() => {
      if (viewportWidth === 0 || count === 0) {
        return { start: 0, end: 0 };
      }

      const buffer = drawDistance;
      const scrollStart = Math.max(0, scrollOffset - buffer);
      const scrollEnd = scrollOffset + viewportWidth + buffer;
      const startIndex = Math.max(0, Math.floor(scrollStart / width));
      const endIndex = Math.min(count - 1, Math.floor(scrollEnd / width));
      return { start: startIndex, end: endIndex };
    }, [count, scrollOffset, viewportWidth, drawDistance, width]);

    const animScrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollOffsetAnim = useScrollViewOffset(animScrollRef);

    const throttledSetScrollOffset = useCallback((offset: number) => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setScrollOffset(offset);
      }, 16);
    }, []);

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

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
      const { width: viewWidth } = event.nativeEvent.layout;
      setViewportWidth(viewWidth);
    }, []);

    const getItemPosition = useCallback(
      (index: number) => {
        return index * width;
      },
      [width]
    );

    return (
      <AnimatedScrollView
        ref={(node) => {
          if (node) {
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
        snapToInterval={pagingEnabled ? undefined : snapToInterval}
        pagingEnabled={pagingEnabled}
        disableIntervalMomentum={!pagingEnabled}
        scrollEnabled={scrollEnabled}
        onTouchStart={onTouchStart}
        style={{ height }}>
        <View style={{ width: totalSize, height: '100%' }}>
          <ResourceContainer
            resources={resources}
            resourcePerPage={resourcePerPage}
            itemSize={width}
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
