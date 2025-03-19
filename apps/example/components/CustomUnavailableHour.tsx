import type { UnavailableHourProps } from '@howljs/calendar-kit';
import { type FC } from 'react';
import Animated, { type SharedValue, useAnimatedProps } from 'react-native-reanimated';
import { Defs, Line, Pattern, Rect, Svg } from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CustomUnavailableHour: FC<
  UnavailableHourProps & {
    width: SharedValue<number>;
    height: SharedValue<number>;
  }
> = (props) => {
  const patternSize = 5;

  const rectProps = useAnimatedProps(() => ({
    height: props.height.value,
    width: props.width.value,
  }));

  return (
    <Svg>
      <Defs>
        <Pattern
          id="stripe-pattern"
          patternUnits="userSpaceOnUse"
          width={patternSize}
          height={patternSize}
          patternTransform="rotate(-45)">
          <Line
            x1={0}
            y={0}
            x2={0}
            y2={patternSize + 5}
            stroke="#ccc"
            strokeWidth={1.5}
            strokeLinecap="butt"
          />
        </Pattern>
      </Defs>
      <AnimatedRect
        x="0"
        y="0"
        width="100%"
        fill="url(#stripe-pattern)"
        animatedProps={rectProps}
      />
    </Svg>
  );
};

export default CustomUnavailableHour;
