import * as React from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import TSCast from '../../utils/TSCast';
import BaseScrollComponent, {
  ScrollComponentProps,
} from './BaseScrollComponent';
/***
 * The responsibility of a scroll component is to report its size, scroll events and provide a way to scroll to a given offset.
 * RecyclerListView works on top of this interface and doesn't care about the implementation. To support web we only had to provide
 * another component written on top of web elements
 */

export default class ScrollComponent extends BaseScrollComponent {
  public static defaultProps = {
    contentHeight: 0,
    contentWidth: 0,
    externalScrollView: TSCast.cast(ScrollView), //TSI
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
    const Scroller: any = TSCast.cast<ScrollView>(
      this.props.externalScrollView
    ); //TSI
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
      <Scroller
        ref={this._getScrollViewRef}
        removeClippedSubviews={false}
        scrollEventThrottle={this.props.scrollEventThrottle}
        {...this.props}
        horizontal
        onScroll={this._onScroll}
      >
        <View style={styles.container}>
          {renderContentContainer(contentContainerProps, this.props.children)}
        </View>
      </Scroller>
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
  };

  private _onScroll = (
    event?: NativeSyntheticEvent<NativeScrollEvent>
  ): void => {
    if (event) {
      const contentOffset = event.nativeEvent.contentOffset;
      this._offset = contentOffset.x;
      this.props.onScroll(contentOffset.x, event);
    }
  };
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row' },
});
