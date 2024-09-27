import React from 'react';
import {
  GestureResponderEvent,
  TouchableOpacity,
  type TouchableWithoutFeedbackProps,
} from 'react-native';

interface TouchableProps extends TouchableWithoutFeedbackProps {}

const Touchable = ({
  children,
  onPress,
  onLongPress,
  ...props
}: TouchableProps) => {
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
      activeOpacity={1}
      onPress={onPress ? handlePress : undefined}
      onLongPress={onLongPress ? handleLongPress : undefined}>
      {children}
    </TouchableOpacity>
  );
};

export default Touchable;
