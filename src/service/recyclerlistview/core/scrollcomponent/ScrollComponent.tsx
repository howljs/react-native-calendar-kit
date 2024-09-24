import * as React from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import BaseScrollComponent, {
  ScrollComponentProps,
} from './BaseScrollComponent';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default class ScrollComponent extends BaseScrollComponent {
  public static defaultProps = {
    contentHeight: 0,
    contentWidth: 0,
    scrollEventThrottle: 16,
  };

  private _width: number;
  private _offset: number;
  private _scrollViewRef: ScrollView | null = null;

  constructor(args: ScrollComponentProps) {
    super(args);
    this._width = (args.layoutSize && args.layoutSize.width) || 0;
    this._offset = 0;
  }

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
    const renderContentContainer = this.props.renderContentContainer
      ? this.props.renderContentContainer
      : this._defaultContainer;
    const contentContainerProps = {
      style: {
        height: this.props.contentHeight,
        width: this.props.contentWidth,
      },
      horizontal: true,
      scrollOffset: this._offset,
      renderAheadOffset: this.props.renderAheadOffset,
      windowSize: this._width + this.props.renderAheadOffset,
    };

    return (
      <AnimatedScrollView
        removeClippedSubviews={false}
        scrollEventThrottle={this.props.scrollEventThrottle}
        {...this.props}
        horizontal
        onScroll={this._onScroll}
        ref={this._getScrollViewRef}
      >
        <View style={styles.container}>
          {renderContentContainer(contentContainerProps, this.props.children)}
        </View>
      </AnimatedScrollView>
    );
  }

  private _defaultContainer(
    props: object,
    children: React.ReactNode
  ): React.ReactNode | null {
    return <View {...props}>{children}</View>;
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
      const contentOffset = event.nativeEvent.contentOffset;
      this._offset = contentOffset.x;
      this.props.onScroll(event);
    }
  };
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row' },
});
