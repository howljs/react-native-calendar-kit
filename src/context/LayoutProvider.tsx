import React, {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export type Size = {
  width: number;
  height: number;
};

const DEFAULT_SIZE = { width: 0, height: 0 };
const LayoutContext = createContext<Size>(DEFAULT_SIZE);

const DEBOUNCE_TIME = 300;

const LayoutProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [layout, setLayout] = useState(DEFAULT_SIZE);

  const timerRef = useRef<NodeJS.Timeout>();
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const { width, height } = event.nativeEvent.layout;
    timerRef.current = setTimeout(() => {
      setLayout({
        width: width,
        height: height,
      });
    }, DEBOUNCE_TIME);
  }, []);

  const value = useMemo(
    () => ({ width: layout.width, height: layout.height }),
    [layout.height, layout.width]
  );

  const isValidLayout = layout.width > 0 && layout.height > 0;

  return (
    <LayoutContext.Provider value={value}>
      <GestureHandlerRootView style={styles.flex} onLayout={onLayout}>
        {isValidLayout ? children : null}
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
