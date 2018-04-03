import React, { Component } from 'react';
import config from './config';
import { AreaChart, YAxis } from 'react-native-svg-charts';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import { Container, View } from 'native-base';
import { Dimensions, StyleSheet } from 'react-native';
import geoViewport from '@mapbox/geo-viewport';


export default class DetailMap extends Component {
  constructor(props) {
    super(props);

    this.state = { chartData: null };
  }

  componentWillMount() {
    // TODO: https://github.com/agrc/recreate/issues/32
    const coords = JSON.parse(this.props.location.state.geojson).geometry.coordinates;

    let maxLat, maxLng, minLat, minLng;
    coords.forEach(([lng, lat]) => {
      if (!maxLat) {
        maxLat = lat;
        minLat = lat;
        maxLng = lng;
        minLng = lng;

        return;
      }

      if (lat > maxLat) {
        maxLat = lat
      } else if (lat < minLat) {
        minLat = lat;
      }

      if (lng > maxLng) {
        maxLng = lng;
      } else if (lng < minLng) {
        minLng = lng;
      }
    });

    const {height, width} = Dimensions.get('window');
    const extent = [minLng, minLat, maxLng, maxLat]; // WSEN

    const {center, zoom} = geoViewport.viewport(extent, [width, height], undefined, undefined, 512);

    this.center = center;
    this.zoom = zoom;
  }

  componentDidMount() {
    this.buildElevationProfile();
  }

  buildElevationProfile() {
    console.log('buildElevationProfile');

    const profile = this.props.location.state.profile.split(',').map(s => parseInt(s, 10));
    const min = profile[0];
    const max = profile[1];
    const range = max - min;

    // convert percentages to feet
    let chartData = profile.slice(2).map(percent => {
      return (range * (percent/100)) + min;
    });

    this.setState({ chartData });
  }

  render() {
    const contentInset = { top: 10, bottom: 10 };

    return (
      <Container style={styles.container}>
        <MapboxGL.MapView
          style={styles.container}
          styleURL={config.styles.outdoors}
          ref={(map) => this.map = map}
          centerCoordinate={this.center}
          zoomLevel={this.zoom}
          >
          <MapboxGL.ShapeSource id='TRAIL_SOURCE' shape={JSON.parse(this.props.location.state.geojson)}>
            <MapboxGL.LineLayer id='TRAIL_LAYER' style={layerStyles.trail} />
          </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
        { this.state.chartData && (
          <View style={styles.chartContainer}>
            <YAxis
              data={this.state.chartData}
              numberOfTicks={5}
              contentInset={contentInset}
            />
            <AreaChart
              style={styles.container}
              data={this.state.chartData}
              svg={{ fill: config.colors.blue + '90' }}
              numberOfTicks={5}
              contentInset={contentInset}
            />
          </View>
        )}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  chartContainer: {
    height: 200,
    flexDirection: 'row'
  }
});

const layerStyles = MapboxGL.StyleSheet.create({
  trail: {
    lineColor: config.colors.blue,
    lineWidth: 6,
    lineJoin: MapboxGL.LineJoin.Round,
    lineCap: MapboxGL.LineCap.Round
  }
});
