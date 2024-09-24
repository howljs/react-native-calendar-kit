import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ApiListModal from './ApiListModal';
import useApiDebugger from './useApiDebugger';

function clampToValues({
  value,
  bottom,
  top,
}: {
  value: number;
  bottom: number;
  top: number;
}) {
  'worklet';
  return Math.max(bottom, Math.min(value, top));
}

const ITEM_SIZE = 50;
const SPACING = 8;

function useOffsetAnimatedValue() {
  return {
    x: useSharedValue(0),
    y: useSharedValue(0),
  };
}

const ApiDebugger = () => {
  const { bottom: safeBottom, top: safeTop } = useSafeAreaInsets();
  const { requests, clearRequests } = useApiDebugger();
  const [isShowApiList, setIsShowApiList] = useState(false);
  const panOffset = useOffsetAnimatedValue();
  const mainPosition = useOffsetAnimatedValue();
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const initPosition = {
    x: layout.width - ITEM_SIZE - SPACING,
    y: layout.height - ITEM_SIZE - safeBottom - SPACING,
  };

  const opacity = useSharedValue(1);

  const panHandler = Gesture.Pan()
    .onUpdate(({ translationX, translationY }) => {
      'worklet';
      panOffset.x.value = mainPosition.x.value + translationX;
      panOffset.y.value = mainPosition.y.value + translationY;
    })
    .onEnd(({ absoluteX, absoluteY, velocityX, velocityY }) => {
      'worklet';
      const velocityDragX = clampToValues({
        value: velocityX * 0.05,
        bottom: -100,
        top: 100,
      });
      const velocityDragY = clampToValues({
        value: velocityY * 0.05,
        bottom: -100,
        top: 100,
      });

      const distFromTop = absoluteY + velocityDragY - safeTop;
      const distFromBottom = layout.height + velocityDragY - absoluteY;
      const distFromLeft = absoluteX + velocityDragX;
      const distFromRight = layout.width - absoluteX + velocityDragX;

      const minDist = Math.min(
        distFromTop,
        distFromBottom,
        distFromLeft,
        distFromRight
      );

      const minX = -initPosition.x + SPACING;
      const xWithVelocity = panOffset.x.value + velocityDragX;
      const panX = xWithVelocity < SPACING ? Math.max(xWithVelocity, minX) : 0;

      const minY = -initPosition.y + SPACING + safeTop;
      const yWithVelocity = panOffset.y.value + velocityDragY;
      const panY = yWithVelocity < SPACING ? Math.max(yWithVelocity, minY) : 0;

      switch (minDist) {
        case distFromLeft: {
          panOffset.x.value = withSpring(minX);
          panOffset.y.value = withSpring(panY);
          mainPosition.x.value = minX;
          mainPosition.y.value = panY;
          break;
        }

        case distFromRight: {
          panOffset.x.value = withSpring(0);
          panOffset.y.value = withSpring(panY);
          mainPosition.x.value = 0;
          mainPosition.y.value = panY;
          break;
        }

        case distFromTop: {
          panOffset.x.value = withSpring(panX);
          panOffset.y.value = withSpring(minY);
          mainPosition.x.value = panX;
          mainPosition.y.value = minY;
          break;
        }

        case distFromBottom: {
          panOffset.x.value = withSpring(panX);
          panOffset.y.value = withSpring(0);
          mainPosition.x.value = panX;
          mainPosition.y.value = 0;
          break;
        }
      }
    })
    .onTouchesUp(() => {
      opacity.value = withTiming(1);
    });

  const animatedStyle = useAnimatedStyle<any>(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: panOffset.x.value },
        { translateY: panOffset.y.value },
      ],
    };
  });

  const singleTap = Gesture.Tap()
    .runOnJS(true)
    .onTouchesDown(() => {
      opacity.value = withTiming(0.7);
    })
    .onTouchesUp(() => {
      opacity.value = withTiming(1);
    })
    .onEnd((_event, success) => {
      if (success) {
        runOnJS(setIsShowApiList)(true);
      }
    });

  const gesture = Gesture.Exclusive(panHandler, singleTap);

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="box-none"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setLayout({ width, height });
      }}
    >
      <Animated.View
        style={[
          styles.container,
          { top: initPosition.y, left: initPosition.x },
          animatedStyle,
        ]}
      >
        <GestureDetector gesture={gesture}>
          <Animated.View style={styles.btn}>
            <Text style={styles.text}>API</Text>
          </Animated.View>
        </GestureDetector>
        <ApiListModal
          visible={isShowApiList}
          requests={requests}
          onRequestClose={() => setIsShowApiList(false)}
          onPressClear={clearRequests}
        />
      </Animated.View>
    </View>
  );
};

export default ApiDebugger;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderColor: '#FFF',
    backgroundColor: '#FFF',
    borderRadius: ITEM_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  btn: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontWeight: 'bold' },
});
