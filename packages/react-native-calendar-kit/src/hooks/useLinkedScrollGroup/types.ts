import type { GestureResponderEvent } from 'react-native';
import type Animated from 'react-native-reanimated';
import type {
  AnimatedRef,
  ReanimatedEvent,
  SharedValue,
} from 'react-native-reanimated';

export interface IWorkletEventHandler<Event extends object> {
  updateEventHandler: (
    newWorklet: (event: ReanimatedEvent<Event>) => void,
    newEvents: string[]
  ) => void;
  registerForEvents: (viewTag: number, fallbackEventName?: string) => void;
  unregisterFromEvents: (viewTag: number) => void;
}

export type EventHandlerInternal<Event extends object> = {
  workletEventHandler: IWorkletEventHandler<Event>;
};
export type ScrollController = {
  onTouchStart?: (event: GestureResponderEvent) => void;
};

export type LinkedScrollController = {
  id: string;
  ref: AnimatedRef<Animated.ScrollView>;
  getScrollController: () => ScrollController;
};

export type LinkedScrollGroup = {
  offset: SharedValue<number>;
  addAndGet: (
    id: string,
    scrollRef: AnimatedRef<Animated.ScrollView>
  ) => ScrollController;
  remove: (id: string) => void;
  setOffset: (offset: number) => void;
  getActiveId: () => string | null;
  setActiveId: (id: string) => void;
};
