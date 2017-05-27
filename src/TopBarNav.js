import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  ScrollView,
  Animated,
  TouchableOpacity,
  Image
} from 'react-native';

const stylePropType = PropTypes.oneOfType([
  PropTypes.object,
  PropTypes.array,
  PropTypes.number
]);

let defaultStyles = {
  header: {
    borderBottomWidth: 0.5,
    borderColor: '#888',
    backgroundColor: '#fff',
     justifyContent: 'flex-end'
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000'
  },
  image: {
    height: 30,
    width: 30
  },
  underline: {
    height: 1,
    marginTop: 5,
    backgroundColor: '#000'
  }
};

export default class TopBarNav extends React.Component {
  static propTypes = {
    routeStack: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number
        ])
      })
    ).isRequired,
    renderScene: PropTypes.func.isRequired,
    headerStyle: stylePropType,
    labelStyle: stylePropType,
    imageStyle: stylePropType,
    underlineStyle: stylePropType,
    sidePadding: PropTypes.number,
    inactiveOpacity: PropTypes.number,
    fadeLabels: PropTypes.bool
  };

  static defaultProps = {
    sidePadding: 8,
    inactiveOpacity: 0.5,
    fadeLabels: true
  };

  state = {
    width: 1, // 1 to prevent dividing by zero later on
    tabWidth: 0,
    scrollX: new Animated.Value(0),
    maxInput: 0,
    maxRange: 0,
    previousWidth: null
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

    let { width, tabWidth, scrollX, maxInput, maxRange } = this.state;


    let position = Animated.divide(scrollX, width);

    let underlineX = position.interpolate({
      inputRange: [0, routeStack.length - 1],
      outputRange: [0, maxRange]
    });

    headerStyle = Array.isArray(headerStyle) ? headerStyle : [headerStyle]
    underlineStyle = Array.isArray(underlineStyle) ? underlineStyle : [underlineStyle]
    labelStyle = Array.isArray(labelStyle) ? labelStyle : [labelStyle]
    imageStyle = Array.isArray(imageStyle) ? imageStyle : [imageStyle]

    return (
      <View
        onLayout={this.calibrate}
        style={{ flex: 1 }}
        >
        <View style={[defaultStyles.header, ...headerStyle, { paddingHorizontal: sidePadding }]}>
          <View
            style={{ flexDirection: 'row' }}>
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
                ? <Animated.Text style={[{ opacity }, defaultStyles.label, ...labelStyle]}> {label}</Animated.Text>
                : <Animated.Image style={[{ opacity }, defaultStyles.image, ...imageStyle]} source={image} />;

              return (
                <TouchableOpacity
                  key={i}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
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
              alignSelf: 'center',
            }}>
            <Animated.View style={{ marginLeft: underlineX, width: tabWidth }}>
              <View style={[defaultStyles.underline, ...underlineStyle, ]}></View>
            </Animated.View>
          </View>
        </View>
        <ScrollView
          ref={ref => this.scrollView = ref}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }]
          )}>
          {routeStack.map((route, i) => (
            <View key={i} style={{ width }}>
              {renderScene(route, i)}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  calibrate = ({ nativeEvent }) => {
    let index = Math.ceil(this.state.scrollX._value / this.state.previousWidth);
    let { width } = nativeEvent.layout;
    let { sidePadding, routeStack } = this.props;
    let { length } = routeStack;

    let tabWidth = (width - sidePadding * 2) / length;
    let maxInput = (length - 1) * width;
    let maxRange = width - tabWidth - sidePadding * 2;

    this.setState({
      width,
      tabWidth,
      maxInput,
      maxRange,
      previousWidth: width
    }, () => setTimeout(() => this.scrollView.scrollTo({ x: index * width }), 1));
  }
}
