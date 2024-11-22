import { forwardRef, type ForwardRefRenderFunction } from 'react';
import {
  type GestureResponderEvent,
  TouchableOpacity,
  type TouchableWithoutFeedbackProps,
} from 'react-native';

type TouchableProps = TouchableWithoutFeedbackProps;

const Touchable: ForwardRefRenderFunction<
  React.ElementRef<typeof TouchableOpacity>,
  TouchableProps
> = ({ children, onPress, onLongPress, ...props }, ref) => {
  const handlePress = (e: GestureResponderEvent) => {
    const event = {
      ...e,
      nativeEvent: {
        ...e.nativeEvent,
        locationX: e.nativeEvent.locationX || (e.nativeEvent as any).offsetX,
        locationY: e.nativeEvent.locationY || (e.nativeEvent as any).offsetY,
      },
    };
    onPress?.(event);
  };

  const handleLongPress = (e: GestureResponderEvent) => {
    const event = {
      ...e,
      nativeEvent: {
        ...e.nativeEvent,
        locationX: e.nativeEvent.locationX || (e.nativeEvent as any).offsetX,
        locationY: e.nativeEvent.locationY || (e.nativeEvent as any).offsetY,
      },
    };
    onLongPress?.(event);
  };

  return (
    <TouchableOpacity
      {...props}
      ref={ref}
      activeOpacity={1}
      onPress={onPress ? handlePress : undefined}
      onLongPress={onLongPress ? handleLongPress : undefined}>
      {children}
    </TouchableOpacity>
  );
};

export default forwardRef(Touchable);
