import type { PropsWithChildren } from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { createStore } from '../store/storeBuilder';
import { useSelector } from '../store/useSelector';

const DEFAULT_SIZE = { width: 0, height: 0 };
const DEBOUNCE_TIME = 200;

export type Size = {
  width: number;
  height: number;
};

const layoutStore = createStore(DEFAULT_SIZE);

const LayoutProvider: React.FC<
  PropsWithChildren<{
    calendarWidth?: number;
  }>
> = ({ children, calendarWidth }) => {
  const [isMounted, setIsMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<View>(null);

  useLayoutEffect(() => {
    if (containerRef.current && !isMounted) {
      containerRef.current.measure((_x, _y, layoutWidth, layoutHeight) => {
        const width = calendarWidth ?? layoutWidth;
        if (width === 0 || layoutHeight === 0) {
          throw new Error('Container width or height is 0');
        }
        layoutStore.setState({ width, height: layoutHeight });
        setIsMounted(true);
      });
    }
  }, [calendarWidth, isMounted]);

  if (!isMounted) {
    return <View style={styles.flex} ref={containerRef} />;
  }

  const onLayout = (event: LayoutChangeEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const { width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
    const width = calendarWidth ?? layoutWidth;
    if (width === 0 || layoutHeight === 0) {
      throw new Error('Container width or height is 0');
    }

    timerRef.current = setTimeout(() => {
      layoutStore.setState({ width, height: layoutHeight });
    }, DEBOUNCE_TIME);
  };

  return (
    <GestureHandlerRootView style={styles.flex} onLayout={onLayout}>
      {children}
    </GestureHandlerRootView>
  );
};

export default LayoutProvider;

export const useLayout = <T,>(selector: (state: Size) => T): T => {
  const state = useSelector(layoutStore.subscribe, layoutStore.getState, selector);
  return state;
};

const styles = StyleSheet.create({ flex: { flex: 1, overflow: 'hidden' } });
