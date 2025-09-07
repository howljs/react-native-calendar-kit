import { useCallback, useEffect, useRef } from 'react';
import { type GestureResponderEvent } from 'react-native';
import type Animated from 'react-native-reanimated';
import {
  type AnimatedRef,
  type SharedValue,
  useSharedValue,
} from 'react-native-reanimated';

import type {
  LinkedScrollController,
  LinkedScrollGroup,
  ScrollController,
} from './types';

export const useLinkedScrollGroup = (
  providedOffset?: SharedValue<number>
): LinkedScrollGroup => {
  const allControllers = useRef<LinkedScrollController[]>([]);
  const scrollListeners = useRef<
    Map<string, (triggerId: string, offset: { x: number; y: number }) => void>
  >(new Map());
  const internalOffset = useSharedValue(0);
  const offset = useRef<SharedValue<number>>(
    providedOffset ?? internalOffset
  ).current;
  const activeController = useRef<AnimatedRef<Animated.ScrollView> | null>(
    null
  );
  const listenersInitialized = useRef(false);
  const peers = useRef<AnimatedRef<Animated.ScrollView>[]>([]);
  const abortController = useRef<AbortController | null>(null);

  const eventHandler = useCallback(() => {
    if (!activeController.current?.current) {
      return;
    }

    try {
      const element = getWebScrollableElement(activeController.current.current);
      if (!element) {
        return;
      }

      const newOffset =
        element.scrollLeft === 0 ? element.scrollTop : element.scrollLeft;
      offset.value = newOffset;

      peers.current.forEach((peer) => {
        if (!peer?.current) {
          return;
        }
        const peerElement = getWebScrollableElement(peer.current);
        if (peerElement && peerElement !== element) {
          peerElement.scrollLeft = newOffset;
        }
      });
    } catch (error) {
      console.warn('Error in scroll event handler:', error);
    }
  }, [offset]);

  const cleanupEventListeners = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
  }, []);

  const onTouchStartHandler = useCallback(
    (triggerId: string) => {
      cleanupEventListeners();

      const peerRefs = allControllers.current
        .filter((controller) => controller.id !== triggerId)
        .map((controller) => controller.ref);
      peers.current = peerRefs;

      const controller = allControllers.current.find((c) => c.id === triggerId);

      if (controller?.ref?.current) {
        activeController.current = controller.ref;
        const element = getWebScrollableElement(controller.ref.current);

        if (element) {
          abortController.current = new AbortController();
          element.addEventListener('scroll', eventHandler, {
            signal: abortController.current.signal,
            passive: true,
          });
        }
      }
    },
    [eventHandler, cleanupEventListeners]
  );

  const onWheelHandler = useCallback(
    (triggerId: string) => {
      cleanupEventListeners();

      const peerRefs = allControllers.current
        .filter((controller) => controller.id !== triggerId)
        .map((controller) => controller.ref);
      peers.current = peerRefs;

      const controller = allControllers.current.find((c) => c.id === triggerId);

      if (controller?.ref?.current) {
        activeController.current = controller.ref;
        const element = getWebScrollableElement(controller.ref.current);

        if (element) {
          eventHandler();
        }
      }
    },
    [eventHandler, cleanupEventListeners]
  );

  const initializeListeners = useCallback(() => {
    if (listenersInitialized.current) {
      return;
    }

    scrollListeners.current.set('onTouchStart', onTouchStartHandler);
    scrollListeners.current.set('onWheel', onWheelHandler);
    listenersInitialized.current = true;
  }, [onTouchStartHandler, onWheelHandler]);

  const addAndGet = useCallback(
    (
      id: string,
      scrollRef: AnimatedRef<Animated.ScrollView>
    ): ScrollController => {
      initializeListeners();

      const existingController = allControllers.current.find(
        (c) => c.id === id
      );
      if (existingController) {
        return existingController.getScrollController();
      }

      const controller = createLinkedScrollController({
        id,
        scrollRef,
        scrollListeners,
      });
      allControllers.current.push(controller);
      return controller.getScrollController();
    },
    [initializeListeners]
  );

  const remove = useCallback(
    (id: string) => {
      const controllerToRemove = allControllers.current.find(
        (controller) => controller.id === id
      );

      if (
        controllerToRemove &&
        activeController.current === controllerToRemove.ref
      ) {
        cleanupEventListeners();
        activeController.current = null;
      }

      allControllers.current = allControllers.current.filter(
        (controller) => controller.id !== id
      );
    },
    [cleanupEventListeners]
  );

  const setOffset = useCallback(
    (initialOffset: number) => {
      offset.value = initialOffset;
    },
    [offset]
  );

  useEffect(() => {
    return () => {
      cleanupEventListeners();
    };
  }, [cleanupEventListeners]);

  return { offset, addAndGet, remove, setOffset };
};

type ControllerGroup = {
  id: string;
  scrollRef: AnimatedRef<Animated.ScrollView>;
  scrollListeners: React.RefObject<
    Map<string, (triggerId: string, offset: { x: number; y: number }) => void>
  >;
};

const createLinkedScrollController = ({
  id,
  scrollRef,
  scrollListeners,
}: ControllerGroup) => {
  const onTouchStart = (_event: GestureResponderEvent) => {
    scrollListeners.current.forEach((listener, key) => {
      if (key === 'onTouchStart') {
        listener(id, { x: 0, y: 0 });
      }
    });
  };

  const onWheel = (_event: WheelEvent) => {
    scrollListeners.current?.forEach((listener, key) => {
      if (key === 'onWheel') {
        listener(id, { x: 0, y: 0 });
      }
    });
  };

  const instance = {
    id,
    ref: scrollRef,
    getScrollController: () => ({
      onTouchStart,
      onWheel,
    }),
  };

  return instance;
};

export default useLinkedScrollGroup;

function getWebScrollableElement(
  scrollComponent: Animated.ScrollView | null
): HTMLElement | null {
  if (!scrollComponent) {
    return null;
  }

  try {
    const scrollableNode = scrollComponent.getScrollableNode?.();
    return (scrollableNode as unknown as HTMLElement) || null;
  } catch (error) {
    console.warn('Failed to get scrollable element:', error);
    return null;
  }
}
