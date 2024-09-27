import * as React from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import type { Dimension } from './LayoutProvider';

export interface ScrollComponentProps {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  contentHeight: number;
  contentWidth: number;
  scrollEventThrottle?: number;
  renderAheadOffset: number;
  layoutSize?: Dimension;
  children: any;
}

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default class ScrollComponent extends React.Component<
  ScrollComponentProps,
  object
> {
  public static defaultProps = {
    contentHeight: 0,
    contentWidth: 0,
    scrollEventThrottle: 16,
  };

  private _scrollViewRef: ScrollView | null = null;

  public scrollTo(x: number, y: number, isAnimated: boolean): void {
    if (this._scrollViewRef) {
      this._scrollViewRef.scrollTo({ x, y, animated: isAnimated });
    }
  }

  public getScrollableNode(): number | null {
    if (this._scrollViewRef && this._scrollViewRef.getScrollableNode) {
      return this._scrollViewRef.getScrollableNode();
    }
    return null;
  }

  public render(): JSX.Element {
    return (
      <AnimatedScrollView
        removeClippedSubviews={false}
        scrollEventThrottle={this.props.scrollEventThrottle}
        {...this.props}
        horizontal
        onScroll={this._onScroll}
        ref={this._getScrollViewRef}>
        <View style={styles.container}>
          <View
            style={{
              height: this.props.contentHeight,
              width: this.props.contentWidth,
            }}>
            {this.props.children}
          </View>
        </View>
      </AnimatedScrollView>
    );
  }

  private _getScrollViewRef = (scrollView: any) => {
    this._scrollViewRef = scrollView as ScrollView | null;
    (this.props as any)?.scrollRefExternal(scrollView);
    return scrollView;
  };

  private _onScroll = (
    event?: NativeSyntheticEvent<NativeScrollEvent>
  ): void => {
    if (event) {
      this.props.onScroll(event);
    }
  };
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row' },
});
