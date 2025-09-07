import React, { FC, useMemo } from 'react';
import { SharedValue } from 'react-native-reanimated';

import { Defs, Line, Pattern, Rect, Svg } from 'react-native-svg';

const CustomUnavailableHour: FC<{
  height: SharedValue<number>;
  width: SharedValue<number>;
}> = ({ width, height }) => {
  const patternSize = 5;

  const originalWidth = useMemo(() => width.get(), []);
  const originalHeight = useMemo(() => height.get(), []);

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${originalWidth} ${originalHeight}`}
      preserveAspectRatio="none">
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
      <Rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="url(#stripe-pattern)"
      />
    </Svg>
  );
};

export default CustomUnavailableHour;
