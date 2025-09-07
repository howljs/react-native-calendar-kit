import React from 'react';
import { StyleSheet, View } from 'react-native';

interface HorizontalLineProps {
  borderColor: string;
  index: number;
  totalSlots: number;
  renderCustomHorizontalLine?: (props: {
    index: number;
    borderColor: string;
  }) => React.ReactNode;
}

const HorizontalLine = ({
  index,
  borderColor,
  totalSlots,
  renderCustomHorizontalLine,
}: HorizontalLineProps) => {
  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.horizontalLine,
        !renderCustomHorizontalLine ? { backgroundColor: borderColor } : {},
        { top: `${(index / totalSlots) * 100}%` },
      ]}>
      {renderCustomHorizontalLine?.({ index, borderColor })}
    </View>
  );
};
export default HorizontalLine;

const styles = StyleSheet.create({
  horizontalLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
  },
});
