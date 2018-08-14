import React, { Component } from 'react';
import config from './config';
import { AreaChart, YAxis } from 'react-native-svg-charts';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import { Button, Container, Text, View } from 'native-base';
import { Dimensions, StyleSheet, AsyncStorage } from 'react-native';
import geoViewport from '@mapbox/geo-viewport';
import platform from './native-base-theme/variables/platform';
import CustomMapView from './CustomMapView';
import mapStyles from './mapStyles';
import ProgressBar from 'react-native-progress/Bar';


const LINE_STRING = 'LineString';
const CHART_HEIGHT = 200;
const PADDING = 10;

export default class DetailMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartData: null,
      downloadProgress: 0,
      downloading: false,
      downloadSize: 0
    };

    // TODO: https://github.com/agrc/recreate/issues/32
    const geometry = JSON.parse(props.location.state.geojson).geometry;

    let coords = geometry.coordinates;
    if (geometry.type !== LINE_STRING) {
      coords = coords.reduce((accumulator, currentValue) => accumulator = accumulator.concat(currentValue), []);
    }

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
    this.extent = [minLng, minLat, maxLng, maxLat]; // WSEN

    const {center, zoom} = geoViewport.viewport(this.extent,
                                                [width, height - CHART_HEIGHT - platform.toolbarHeight],
                                                undefined,
                                                undefined,
                                                config.tileSize);

    this.center = center;
    this.zoom = zoom;

    this.initializeOffline();
  }

  async initializeOffline() {
    const pack = await MapboxGL.offlineManager.getPack(this.props.location.state.id);

    if (pack) {
      console.log('existing pack', pack);

      const cache = await AsyncStorage.getItem(this.props.location.state.id);
      let downloadSize = null;
      if (cache) {
        downloadSize = this.convertToMB(JSON.parse(cache).status.completedResourceSize);
      }

      this.setState({
        downloadProgress: 1,
        downloadSize
      });
    }
  }

  componentDidMount() {
    this.buildElevationProfile();
  }

  convertToMB(bytes) {
    return Math.round(bytes / 1000000);
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

  async onOfflinePress() {
    console.log('onOfflinePress');

    this.setState({ downloading: true });

    const [swLng, swLat, neLng, neLat] = this.extent;

    const onProgress = (region, status) => {
      console.log('onProgress', status);

      this.setState({
        downloadProgress: status.percentage / 100,
        downloading: status.percentage < 100,
        downloadSize: this.convertToMB(status.completedResourceSize)
      });

      if (status.percentage === 100) {
        // store status in async storage because getPack doesn't return stuff like the size of the pack
        AsyncStorage.setItem(this.props.location.state.id, JSON.stringify({
          status: status,
          geojson: this.props.location.state.geojson,
          profile: this.props.location.state.profile
        }));
      }
    };
    const onError = (region, error) => {
      console.log('onError', error);

      this.setState({ downloading: false });
    };

    await MapboxGL.offlineManager.createPack({
      name: this.props.location.state.id,
      styleURL: mapStyles.styleFileURI,
      minZoom: this.zoom,
      maxZoom: config.maxZoomLevel,
      bounds: this.extendBbox(neLng, neLat, swLng, swLat)
    }, onProgress, onError);
  }

  extendBbox(neLng, neLat, swLng, swLat) {
    // returns a bbox that is {percent} larger
    // returns something like: [[-108.16051, 42.33214], [-114.81823, 36.55156]]
    const percent = 50;
    const additionalLng = (neLng - swLng) * (percent/100.0);
    const additionalLat = (neLat - swLat) * (percent/100.0);

    return [[neLng + additionalLng, neLat + additionalLat], [swLng - additionalLng, swLat - additionalLat]];
  }

  async onRemoveOfflinePress() {
    console.log('onRemoveOfflinePress');

    await MapboxGL.offlineManager.deletePack(this.props.location.state.id);

    this.setState({ downloadProgress: 0 });
  }

  render() {
    const contentInset = { top: PADDING, bottom: PADDING };

    return (
      <Container style={styles.container}>
        <CustomMapView
          style={styles.container}
          ref={(ref) => {
            if (ref) {
              this.map = ref.map
            }
          }}
          centerCoordinate={this.center}
          zoomLevel={this.zoom}
          showUserLocation={true}
          userTrackingMode={MapboxGL.UserTrackingModes.None}
          >
          <MapboxGL.ShapeSource id='TRAIL_SOURCE' shape={JSON.parse(this.props.location.state.geojson)}>
            <MapboxGL.LineLayer id='TRAIL_LAYER' style={layerStyles.trail} />
          </MapboxGL.ShapeSource>
        </CustomMapView>
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
        {this.state.downloadProgress < 1 && !this.state.downloading && <Button primary small style={styles.offlineButton} onPress={this.onOfflinePress.bind(this)}>
          <Text>Take This Map Offline</Text>
        </Button>}
        {this.state.downloading &&
          <ProgressBar
            progress={this.state.downloadProgress}
            style={styles.progressBar}
            width={null}
            color={config.colors.blue}
            borderColor={config.colors.blue}
            />}
        {this.state.downloadProgress === 1 && <Button warning small style={styles.offlineButton} onPress={this.onRemoveOfflinePress.bind(this)}>
          <Text>Delete Offline Map ({this.state.downloadSize} MB)</Text>
        </Button>}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  chartContainer: {
    height: CHART_HEIGHT,
    flexDirection: 'row'
  },
  offlineButton: {
    position: 'absolute',
    top: PADDING,
    right: PADDING
  },
  progressBar: {
    position: 'absolute',
    top: PADDING,
    right: PADDING,
    left: PADDING
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
