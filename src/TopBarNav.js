import React from 'react';
import PropTypes from 'prop-types';
import {
	View,
	Text,
	ScrollView,
	Animated,
	TouchableOpacity,
	Image,
	ViewStylePropTypes,
	TextStylePropTypes,
	StyleSheet,
	Dimensions
} from 'react-native';

const stylePropType = PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]);

const defaultStyles = StyleSheet.create({
	header: {
		borderBottomWidth: StyleSheet.hairlineWidth,
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
		backgroundColor: '#000',
		width: '100%'
	}
});

const { width: INITIAL_WINDOW_WIDTH } = Dimensions.get('window');

export default class TopBarNav extends React.Component {
	static propTypes = {
		routeStack: PropTypes.array.isRequired,
		initialIndex: PropTypes.number,
		renderScene: PropTypes.func,
		headerStyle: stylePropType,
		textStyle: stylePropType,
		imageStyle: stylePropType,
		underlineStyle: stylePropType,
		sidePadding: PropTypes.number,
		inactiveOpacity: PropTypes.number,
		fadeLabels: PropTypes.bool,
		scrollViewProps: PropTypes.object
	};

	static defaultProps = {
		initialIndex: 0,
		sidePadding: 0,
		inactiveOpacity: 0.5,
		fadeLabels: false,
		scrollViewProps: {}
	};

	constructor(props) {
		super(props);
		this.state = {
			width: INITIAL_WINDOW_WIDTH,
			tabWidth: 0,
			maxInput: 0,
			maxRange: 0
		};

		this.index = props.initialIndex;
		this.initialScrollTo = this.index * INITIAL_WINDOW_WIDTH;
		this.scrollX = new Animated.Value(this.initialScrollTo);
		this.scrollXValue = this.initialScrollTo;
		this.previousWidth = INITIAL_WINDOW_WIDTH;

		this.scrollX.addListener(({ value }) => (this.scrollXValue = value));
	}

	render() {
		let {
			labels,
			views,
			routeStack,
			renderScene,
			headerStyle,
			underlineStyle,
			textStyle,
			imageStyle,
			sidePadding,
			inactiveOpacity,
			fadeLabels,
			scrollViewProps
		} = this.props;

		const { width, tabWidth, maxInput, maxRange } = this.state;

		const position = Animated.divide(this.scrollX, width);

		const underlineX = position.interpolate({
			inputRange: [0, routeStack.length - 1],
			outputRange: [0, maxRange]
		});

		return (
			<View onLayout={this.calibrate} style={{ flex: 1 }}>
				<View
					style={[
						defaultStyles.header,
						...this.formatStyle(headerStyle),
						{ paddingHorizontal: sidePadding }
					]}>
					<View style={{ flexDirection: 'row' }}>
						{routeStack.map((route, i) => {
							const { text, image, element } = route;
							const opacity = fadeLabels
								? position.interpolate({
										inputRange: [i - 1, i, i + 1],
										outputRange: [inactiveOpacity, 1, inactiveOpacity],
										extrapolate: 'clamp'
								  })
								: position.interpolate({
										inputRange: [i - 0.5, i - 0.499999999, i, i + 0.499999999, i + 0.5],
										outputRange: [inactiveOpacity, 1, 1, 1, inactiveOpacity],
										extrapolate: 'clamp'
								  });

							let label;

							if (element) {
								label = element;
							} else if (text) {
								label = (
									<Text style={[defaultStyles.label, ...this.formatStyle(textStyle)]}>{text}</Text>
								);
							} else if (image) {
								label = (
									<Image
										style={[defaultStyles.image, ...this.formatStyle(imageStyle)]}
										source={image}
									/>
								);
							}

							return (
								<TouchableOpacity
									key={i}
									style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
									onPress={() => this.scrollView.getNode().scrollTo({ x: i * width })}>
									<Animated.View style={{ opacity }}>{label}</Animated.View>
								</TouchableOpacity>
							);
						})}
					</View>
					<View style={{ width: width - 2 * sidePadding, overflow: 'hidden', alignSelf: 'center' }}>
						<Animated.View
							style={{
								transform: [{ translateX: underlineX }],
								width: tabWidth,
								alignItems: 'center'
							}}>
							<View style={[defaultStyles.underline, ...this.formatStyle(underlineStyle)]} />
						</Animated.View>
					</View>
				</View>
				<Animated.ScrollView
					{...scrollViewProps}
					ref={ref => (this.scrollView = ref)}
					horizontal={true}
					pagingEnabled={true}
					showsHorizontalScrollIndicator={false}
					scrollEventThrottle={1}
					onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: this.scrollX } } }], {
						useNativeDriver: true
					})}>
					{routeStack.map((route, i) => (
						<View key={i} style={{ width }}>
							{renderScene(route, i)}
						</View>
					))}
				</Animated.ScrollView>
			</View>
		);
	}

	componentDidMount() {
		this.scrollView.getNode().scrollTo({ x: this.initialScrollTo });
		this.calibrate(
			{
				nativeEvent: {
					layout: { width: INITIAL_WINDOW_WIDTH }
				}
			},
			true
		);
	}

	calibrate = ({ nativeEvent }, force) => {
		const { width } = nativeEvent.layout;

		if (this.previousWidth !== width || force) {
			this.index = Math.ceil(this.scrollXValue / this.previousWidth);
			const { sidePadding, routeStack } = this.props;
			const { length } = routeStack;
			const tabWidth = (width - sidePadding * 2) / length;
			const maxInput = (length - 1) * width;
			const maxRange = width - tabWidth - sidePadding * 2;

			this.previousWidth = width;

			this.setState(
				{
					width,
					tabWidth,
					maxInput,
					maxRange
				},
				() => setTimeout(() => this.scrollView.getNode().scrollTo({ x: this.index * width }), 0)
			);
		}
	};

	formatStyle = style => (Array.isArray(style) ? style : [style]);
}
