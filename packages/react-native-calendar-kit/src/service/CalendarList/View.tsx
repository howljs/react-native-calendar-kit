import * as React from 'react';
import { Platform, View as RNView, type ViewProps } from 'react-native';

const RCTView = React.forwardRef<RNView, ViewProps>((props, ref) => {
  return React.createElement('RCTView', { ...props, ref });
});

RCTView.displayName = 'RCTView';

export const View =
  Platform.OS === 'android' || Platform.OS === 'ios' ? RCTView : RNView;
