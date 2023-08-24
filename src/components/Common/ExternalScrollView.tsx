import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { BaseScrollView } from 'recyclerlistview';
import { ScrollViewDefaultProps } from 'recyclerlistview/dist/reactnative/core/scrollcomponent/BaseScrollView';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default class ExternalScrollView extends BaseScrollView {
  constructor(props: ScrollViewDefaultProps) {
    super(props);
  }

  scrollTo(...args: any[]) {
    (this.props as any).scrollRefExternal?.current?.scrollTo(...args);
  }

  render() {
    return (
      <AnimatedScrollView
        {...(this.props as any)}
        ref={(this.props as any)?.scrollRefExternal}
      >
        {this.props.children}
      </AnimatedScrollView>
    );
  }
}
