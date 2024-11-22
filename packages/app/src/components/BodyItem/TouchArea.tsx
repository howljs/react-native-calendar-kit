import { parseDateTime, useTimezone } from '@calendar-kit/core';
import { memo, useRef } from 'react';
import { type GestureResponderEvent, StyleSheet, TouchableOpacity } from 'react-native';

import { useBody } from '../../context/BodyContext';
import Touchable from '../Touchable';

const TouchArea = () => {
  const {
    gridListRef,
    columnWidth,
    minuteHeight,
    start,
    onLongPressBackground,
    onPressBackground,
    bodyStartX,
  } = useBody();
  const touchAreaRef = useRef<TouchableOpacity>(null);
  const { timeZone } = useTimezone();

  const onPress = (event: GestureResponderEvent) => {
    if (!gridListRef.current) {
      return;
    }
    const posX = event.nativeEvent.pageX - bodyStartX.current;
    const columnIndex = Math.floor(posX / columnWidth);
    const currentIndex = gridListRef.current.getCurrentScrollIndex();
    const dayUnix = gridListRef.current.getItemByIndex(currentIndex + columnIndex);
    if (!dayUnix) {
      return;
    }

    const minutes = event.nativeEvent.locationY / minuteHeight.value + start;
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const dateTimeObj = parseDateTime(dayUnix, { zone: 'utc' })
      .setZone(timeZone)
      .set({ hour, minute });
    const newProps: { dateTime: string } = {
      dateTime: dateTimeObj.toISO(),
    };
    onPressBackground(newProps, event);
  };

  const onLongPress = (event: GestureResponderEvent) => {
    if (!gridListRef.current) {
      return;
    }
    const posX = event.nativeEvent.pageX - bodyStartX.current;
    const columnIndex = Math.floor(posX / columnWidth);
    const currentIndex = gridListRef.current.getCurrentScrollIndex();
    const dayUnix = gridListRef.current.getItemByIndex(currentIndex + columnIndex);
    if (!dayUnix) {
      return;
    }

    const minutes = event.nativeEvent.locationY / minuteHeight.value + start;
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    const dateTimeObj = parseDateTime(dayUnix, { zone: 'utc' })
      .setZone(timeZone)
      .set({ hour, minute });
    const newProps: { dateTime: string } = {
      dateTime: dateTimeObj.toISO(),
    };
    onLongPressBackground(newProps, event);
  };

  return (
    <Touchable
      ref={touchAreaRef}
      style={StyleSheet.absoluteFill}
      onPress={onPress}
      onLongPress={onLongPress}
    />
  );
};

export default memo(TouchArea);
