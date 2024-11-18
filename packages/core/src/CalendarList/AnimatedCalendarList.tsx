import Animated from 'react-native-reanimated';

import CalendarList from './CalendarList';
import type { CalendarListProps } from './types';

const AnimatedCalendarList = Animated.createAnimatedComponent<CalendarListProps<any>>(CalendarList);

export default AnimatedCalendarList;
