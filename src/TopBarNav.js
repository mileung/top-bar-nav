import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image
} from 'react-native';

let { width } = Dimensions.get('window');

const stylePropType = React.PropTypes.oneOfType([
  React.PropTypes.object,
  React.PropTypes.number
]);

export default class TopBarNav extends React.Component {
  static propTypes = {
    routeStack: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        label: React.PropTypes.oneOfType([
          React.PropTypes.string,
          React.PropTypes.number
        ])
      })
    ).isRequired,
    renderScene: React.PropTypes.func.isRequired,
    headerStyle: stylePropType,
    labelStyle: stylePropType,
    imageStyle: stylePropType,
    underlineStyle: stylePropType,
    sidePadding: React.PropTypes.number,
    inactiveOpacity: React.PropTypes.number
  };

  static defaultProps = {
    headerStyle: {
      height: 40,
      borderBottomWidth: 0.5,
      borderColor: '#888',
      backgroundColor: '#fff'
    },
    labelStyle: {
      fontSize: 17,
      fontWeight: '600',
      color: '#000'
    },
    imageStyle: {
      height: 30,
      width: 30
    },
    underlineStyle: {
      height: 1,
      backgroundColor: '#000'
    },
    sidePadding: 8,
    inactiveOpacity: 0.5
  };

  componentWillMount() {
    this.state = {
      index: 0
    };

    let { sidePadding, routeStack } = this.props;
    let { length } = routeStack;

    this.tabWidth = (width - sidePadding * 2) / length;
    this.underlineMarginLeft = new Animated.Value(0);

    this.maxInput = (length - 1) * width;
    this.maxRange = width - this.tabWidth - sidePadding * 2;
  }
  render() {
    let { index } = this.state;
    let {
      labels,
      views,
      routeStack,
      renderScene,
      headerStyle,
      underlineStyle,
      labelStyle,
      imageStyle,
      sidePadding,
      inactiveOpacity
    } = this.props;

    let marginLeft = this.underlineMarginLeft.interpolate({
      inputRange: [0, this.maxInput],
      outputRange: [0, this.maxRange]
    });

    return (
      <View style={{ flex: 1 }}>
        <View style={[headerStyle, { paddingHorizontal: sidePadding }]}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row'
            }}>
            {routeStack.map((route, i) => {
              let { label, image } = route;
              let marker = label
                ? <Text
                    style={[{ opacity: index === i ? 1 : inactiveOpacity }, labelStyle]}>
                    {label}
                  </Text>
                : <Image
                    style={[{ opacity: index === i ? 1 : inactiveOpacity }, imageStyle]}
                    source={image}
                  />;

              return (
                <TouchableOpacity
                  key={i}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onPress={() => this.scrollView.scrollTo({ x: i * width })}>
                  {marker}
                </TouchableOpacity>
              );
            })}
          </View>
          <View
            style={{
              width: width - 2 * sidePadding,
              overflow: 'hidden',
              alignSelf: 'center'
            }}>
            <Animated.View style={{ marginLeft, width: this.tabWidth }}>
              <View style={underlineStyle} />
            </Animated.View>
          </View>
        </View>
        <ScrollView
          ref={ref => this.scrollView = ref}
          style={{}}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: this.underlineMarginLeft } } }],
            { listener: this.onScroll }
          )}>
          {routeStack.map((route, i) => {
            return (
              <View key={i} style={{ width }}>
                {renderScene(route, i)}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  onScroll = ({ nativeEvent }) => {
    this.setState({ index: Math.round(nativeEvent.contentOffset.x / width) });
  };
}
