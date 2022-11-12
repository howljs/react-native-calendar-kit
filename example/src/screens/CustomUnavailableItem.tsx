import type { UnavailableItemProps } from '@howljs/calendar-kit';
import React from 'react';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CustomUnavailableItem = (props: UnavailableItemProps) => {
  const patternSize = 5;

  const rectProps = useAnimatedProps(() => ({
    height: props.hour * props.timeIntervalHeight.value,
  }));

  return (
    <Svg>
      <Defs>
        <Pattern
          id="stripe-pattern"
          patternUnits="userSpaceOnUse"
          width={patternSize}
          height={patternSize}
          patternTransform="rotate(-45)"
        >
          <Line
            x1={0}
            y={0}
            x2={0}
            y2={patternSize + 5}
            stroke="#e8e8e8"
            strokeWidth={1.5}
            strokeLinecap="butt"
          />
        </Pattern>
      </Defs>
      <AnimatedRect
        x="0"
        y="0"
        width={props.width}
        fill="url(#stripe-pattern)"
        animatedProps={rectProps}
      />
    </Svg>
  );
};

export default CustomUnavailableItem;
