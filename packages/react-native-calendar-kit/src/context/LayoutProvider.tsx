import type { PropsWithChildren } from 'react';
import React, {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DEBOUNCE_TIME, DEFAULT_SIZE } from '../constants';

export type Size = {
  width: number;
  height: number;
};

const LayoutContext = createContext<Size>(DEFAULT_SIZE);

const LayoutProvider: React.FC<PropsWithChildren<object>> = ({ children }) => {
  const [layout, setLayout] = useState(DEFAULT_SIZE);

  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const { width, height } = event.nativeEvent.layout;
    if (width <= 0 || height <= 0) {
      return;
    }

    timerRef.current = setTimeout(() => {
      setLayout({ width, height });
    }, DEBOUNCE_TIME);
  }, []);

  const value = useMemo(
    () => ({ width: layout.width, height: layout.height }),
    [layout.height, layout.width]
  );

  const isValidLayout = layout.width > 0 && layout.height > 0;

  return (
    <LayoutContext.Provider value={value}>
      <GestureHandlerRootView>
        <View style={styles.flex} onLayout={onLayout}>
          {isValidLayout ? children : null}
        </View>
      </GestureHandlerRootView>
    </LayoutContext.Provider>
  );
};

export default LayoutProvider;

export const useLayout = () => {
  const value = React.useContext(LayoutContext);
  if (!value) {
    throw new Error('useLayout must be called from within LayoutProvider!');
  }
  return value;
};

const styles = StyleSheet.create({ flex: { flex: 1, overflow: 'hidden' } });
