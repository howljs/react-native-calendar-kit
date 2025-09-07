import React from 'react';
import { StyleSheet, View } from 'react-native';

interface VerticalLineProps {
  borderColor: string;
  index: number;
  columnWidth: number;
  childColumns: number;
}

const VerticalLine = ({
  index,
  borderColor,
  columnWidth,
  childColumns,
}: VerticalLineProps) => {
  const eventWidth =
    childColumns > 1 ? columnWidth / childColumns : columnWidth;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.verticalLine,
        { backgroundColor: borderColor, left: index * eventWidth },
      ]}
    />
  );
};

export default VerticalLine;

const styles = StyleSheet.create({
  verticalLine: {
    position: 'absolute',
    width: 1,
    backgroundColor: 'grey',
    height: '100%',
  },
});
