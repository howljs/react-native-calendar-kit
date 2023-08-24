import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import Animated, {
  SharedValue,
  useAnimatedRef,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { RecyclerListHandle } from '../components/Common/RecyclerList';
import { useCalendarKit } from './CalendarKitProvider';
import { useScrollController } from './ScrollControllerProvider';

export interface MultipleDayViewContextValue {
  dayBarRef: React.RefObject<RecyclerListHandle>;
  timelineRef: React.RefObject<RecyclerListHandle>;
  timelineAnimatedRef: React.RefObject<Animated.ScrollView>;
  dayBarAnimatedRef: React.RefObject<Animated.ScrollView>;
  columnWidth: SharedValue<number>;
  initialOffset: number;
  threeDayOffsets: number[];
  offsetX: SharedValue<number>;
}

export const MultipleDayViewContext = createContext<
  MultipleDayViewContextValue | undefined
>(undefined);

const MultipleDayViewProvider: React.FC = ({ children }) => {
  const { timelineWidth, numberOfColumns, viewMode, pages } = useCalendarKit();
  const { scrollPositions } = useScrollController();

  const dayBarRef = useRef<RecyclerListHandle>(null);
  const dayBarAnimatedRef = useAnimatedRef<Animated.ScrollView>();
  const timelineRef = useRef<RecyclerListHandle>(null);
  const timelineAnimatedRef = useAnimatedRef<Animated.ScrollView>();

  const columnWidth = useSharedValue(timelineWidth / numberOfColumns);

  const scrollPosition = scrollPositions.current[viewMode];
  const initialOffset =
    scrollPosition.index * timelineWidth +
    scrollPosition.extraColumns * (timelineWidth / numberOfColumns);
  const offsetX = useSharedValue(initialOffset);

  useEffect(() => {
    const newColumnWidth = timelineWidth / numberOfColumns;
    if (columnWidth.value === newColumnWidth) {
      return;
    }
    columnWidth.value = withTiming(newColumnWidth, {
      duration: 350,
    });
  }, [columnWidth, numberOfColumns, timelineWidth]);

  useEffect(() => {
    timelineAnimatedRef.current?.scrollTo({
      x: initialOffset,
      y: 0,
      animated: false,
    });
  }, [initialOffset, timelineAnimatedRef]);

  const threeDayOffsets = useMemo(() => {
    const snapInterval = timelineWidth / numberOfColumns;
    const cols = timelineWidth / snapInterval;
    const totalOffsets = pages.threeDays.data.length * cols;
    return Array.from({ length: totalOffsets }, (_, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      return row * timelineWidth + col * snapInterval;
    });
  }, [numberOfColumns, pages.threeDays.data.length, timelineWidth]);

  const value = useMemo(
    () => ({
      dayBarRef,
      timelineRef,
      columnWidth,
      initialOffset,
      threeDayOffsets,
      timelineAnimatedRef,
      dayBarAnimatedRef,
      offsetX,
    }),
    [
      columnWidth,
      dayBarAnimatedRef,
      initialOffset,
      threeDayOffsets,
      timelineAnimatedRef,
      offsetX,
    ]
  );

  return (
    <MultipleDayViewContext.Provider value={value}>
      {children}
    </MultipleDayViewContext.Provider>
  );
};

export default MultipleDayViewProvider;

export const useMultipleDayView = () => {
  const value = useContext(MultipleDayViewContext);
  if (!value) {
    throw new Error(
      'useMultipleDayView must be called from within MultipleDayViewProvider!'
    );
  }
  return value;
};
