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

export interface DayViewContextValue {
  dayBarRef: React.RefObject<RecyclerListHandle>;
  timelineRef: React.RefObject<RecyclerListHandle>;
  timelineAnimatedRef: React.RefObject<Animated.ScrollView>;
  dayBarAnimatedRef: React.RefObject<Animated.ScrollView>;
  columnWidth: SharedValue<number>;
  initialOffset: number;
  threeDayOffsets: number[];
  offsetX: SharedValue<number>;
}

export const DayViewContext = createContext<DayViewContextValue | undefined>(
  undefined
);

const DayViewProvider: React.FC = ({ children }) => {
  const { timelineWidth, calendarSize } = useCalendarKit();
  const { scrollPositions } = useScrollController();

  const dayBarRef = useRef<RecyclerListHandle>(null);
  const dayBarAnimatedRef = useAnimatedRef<Animated.ScrollView>();
  const timelineRef = useRef<RecyclerListHandle>(null);
  const timelineAnimatedRef = useAnimatedRef<Animated.ScrollView>();

  const columnWidth = useSharedValue(timelineWidth);

  useEffect(() => {
    if (columnWidth.value === timelineWidth) {
      return;
    }
    columnWidth.value = withTiming(timelineWidth, {
      duration: 250,
    });
  }, [columnWidth, timelineWidth]);

  const scrollPosition = scrollPositions.current.day;
  const initialOffset = scrollPosition.index * calendarSize.width;
  const offsetX = useSharedValue(initialOffset);

  const value = useMemo(
    () => ({
      dayBarRef,
      timelineRef,
      columnWidth,
      initialOffset,
      threeDayOffsets: [],
      dayBarAnimatedRef,
      timelineAnimatedRef,
      offsetX,
    }),
    [
      columnWidth,
      dayBarAnimatedRef,
      initialOffset,
      timelineAnimatedRef,
      offsetX,
    ]
  );

  return (
    <DayViewContext.Provider value={value}>{children}</DayViewContext.Provider>
  );
};

export default DayViewProvider;

export const useDayView = () => {
  const value = useContext(DayViewContext);
  if (!value) {
    throw new Error('useDayView must be called from within DayViewProvider!');
  }
  return value;
};
