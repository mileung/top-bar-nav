# top-bar-nav

A top bar navigator for React Native that is super light, simple, and customizable.

## Install

`npm install --save top-bar-nav`

## Import

`import TopBarNav from 'top-bar-nav';`

## Usage

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TopBarNav from 'top-bar-nav';

const Scene = ({ index }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>{index}</Text>
  </View>
);

const ROUTES = {
  Scene,
  // ideally you would have a ROUTES object with multiple React component scenes
};

const ROUTESTACK = [
  { label: 'React', title: 'Scene' }, // label is what you see in the top bar
  { label: 'Native', title: 'Scene' }, // title is just the name of the Component being rendered.  See the renderScene property below
  { label: 'Is', title: 'Scene' },
  { label: 'Cool', title: 'Scene' }
];

// const ROUTESTACK = [
//   { image: require('./home.png'), title: 'Scene' },
//   { image: require('./search.png'), title: 'Scene' },
//   { image: require('./bell.png'), title: 'Scene' }
// ];

export default class Example extends React.Component {
  render() {
    return (
      <View style={{ flex: 1}}>
        <TopBarNav
          // routeStack and renderScene are required props
          routeStack={ROUTESTACK}
          renderScene={(route, i) => {
            // This is a lot like the now deprecated Navigator component
            let Component = ROUTES[route.title];
            return <Component index={i} />;
          }}
          // Below are optional props
          headerStyle={[styles.headerStyle, { paddingTop: 20 }]} // probably want to add paddingTop: 20 if using TopBarNav for the  entire height of screen on iOS
          labelStyle={styles.labelStyle}
          underlineStyle={styles.underlineStyle}
          imageStyle={styles.imageStyle}
          sidePadding={40} // Can't set sidePadding in headerStyle because it's needed to calculate the width of the tabs
          inactiveOpacity={1}
          fadeLabels={false}
        />
      </View>
    );
  }

  anotherRender() { // if rendering the nav bar at the bottom is your thing
    return (
      <View style={{ flex: 1}}>
        <View style={{ flex: 1, transform: [{ scaleY: -1 }] }}>
          <TopBarNav
            // routeStack and renderScene are required props
            routeStack={ROUTESTACK}
            renderScene={(route, i) => {
              // This is a lot like the now deprecated Navigator component
              let Component = ROUTES[route.title];
              return (
                <View style={{ flex: 1, transform: [{ scaleY: -1 }] }}>
                  <Component index={i} />
                </View>
              );
            }}
            // Below are optional props
            headerStyle={{ paddingTop: 20, transform: [{ scaleY: -1 }] }} // probably want to add paddingTop: 20 if using TopBarNav for the  entire height of screen on iOS
            underlineStyle={{ height: 3 }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerStyle: {
    borderBottomWidth: 1,
    borderColor: '#e6faff',
    backgroundColor: '#3385ff'
  },
  labelStyle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff'
  },
  imageStyle: {
    height: 20,
    width: 20,
    tintColor: '#e6faff'
  },
  underlineStyle: {
    height: 3.6,
    backgroundColor: '#e6faff'
  }
});
```


## Demo

![](https://media.giphy.com/media/3o7btUgPGcfdiQSL4Y/giphy.gif)

![](https://media.giphy.com/media/xUA7aY6XnuNXEWXC5G/giphy.gif)

![](https://media.giphy.com/media/xUA7aKY4kc84gJIgdG/giphy.gif)

## Props

```javascript
const stylePropType = PropTypes.oneOfType([
  PropTypes.object,
  PropTypes.array,
  PropTypes.number
]);

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
  fadeLabels: PropTypes.bool,
  scrollViewProps: PropTypes.object,
  onPage: PropTypes.func, // only called with the index changes
  onScroll: PropTypes.func // you could do animations with this if you want; passed { nativeEvent }
}

static defaultProps = {
  sidePadding: 8,
  inactiveOpacity: 0.5,
  fadeLabels: true,
  scrollViewProps: {},
  onPage: () => {},
