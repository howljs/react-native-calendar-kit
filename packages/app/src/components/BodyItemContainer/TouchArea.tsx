import { memo, useRef } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { useBody } from '../../context/BodyContext';
import Touchable from '../Touchable';

const TouchArea = () => {
  const { onLongPressBackground, onPressBackground } = useBody();
  const touchAreaRef = useRef<TouchableOpacity>(null);

  return (
    <Touchable
      ref={touchAreaRef}
      style={StyleSheet.absoluteFill}
      onPress={onPressBackground}
      onLongPress={onLongPressBackground}
    />
  );
};

export default memo(TouchArea);
