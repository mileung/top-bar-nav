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
    inactiveOpacity: React.PropTypes.number,
    fadeLabels: React.PropTypes.bool
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
    inactiveOpacity: 0.5,
    fadeLabels: true
  };

  componentWillMount() {
    let { sidePadding, routeStack } = this.props;
    let { length } = routeStack;

    this.tabWidth = (width - sidePadding * 2) / length;
    this.scrollX = new Animated.Value(0);

    this.maxInput = (length - 1) * width;
    this.maxRange = width - this.tabWidth - sidePadding * 2;
  }
  render() {
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
      inactiveOpacity,
      fadeLabels
    } = this.props;


    let position = Animated.divide(this.scrollX, width);

    let underlineX = position.interpolate({
      inputRange: [0, routeStack.length - 1],
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
              let opacity = fadeLabels ? position.interpolate({
                inputRange: [i - 1, i, i + 1],
                outputRange: [inactiveOpacity, 1, inactiveOpacity],
                extrapolate: 'clamp'
              }) : position.interpolate({
                inputRange: [i - 0.5, i - 0.499999999, i, i + 0.499999999, i + 0.5],
                outputRange: [inactiveOpacity, 1, 1, 1, inactiveOpacity],
                extrapolate: 'clamp'
              });

              let marker = label
                ? <Animated.Text
                    style={[
                      { opacity },
                      labelStyle
                    ]}>
                    {label}
                  </Animated.Text>
                : <Animated.Image
                    style={[
                      { opacity },
                      imageStyle
                    ]}
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
            <Animated.View style={{ marginLeft: underlineX, width: this.tabWidth }}>
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
            [{ nativeEvent: { contentOffset: { x: this.scrollX } } }]
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
}
