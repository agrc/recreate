import React, { Component } from 'react';
import { StyleSheet, Text } from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import List from './List';
import CustomizeBtn from './CustomizeBtn';
import round from 'lodash.round';
import config from './config';
import distance from '@turf/distance';
import queryString from 'query-string';
import { Button, Container, Icon, Tabs, Tab } from 'native-base';
import poiJsonAll from './PointsOfInterest.json';
import geoViewport from '@mapbox/geo-viewport';
import YelpPopup from './YelpPopup';
import buttonTheme from './native-base-theme/components/Button';
import isEqual from 'lodash.isequal';
import pointsWithinPolygon from '@turf/points-within-polygon';
import helpers from '@turf/helpers';
import CustomMapView from './CustomMapView';
import mapStyles from './mapStyles';


const LAYERS = { POINTS_OF_INTEREST: 'poi', YELP: 'yelp' };

export default class MapView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      findingCurrentLocation: false,
      featuresInCurrentExtent: [],
      currentLocation: [-111.8, 40.55],
      zoom: 15,
      filter: this.getClearFilter(),
      followUser: false,
      mapLoaded: false,
      clickedFeatureSet: {},
      currentTabPage: 0,
      yelpFeatureSet: null,
      showYelp: true,
      poiJson: poiJsonAll,
      selectedYelpGeoJSON: null
    };
  }

  getClearFilter() {
    const filter = {};
    Object.keys(config.poi_type_lookup).forEach(key => filter[key] = false);

    return filter;
  }

  loadList() {
    this.onMapExtentChange();
  }

  async updateYelpData() {
    const [longitude, latitude] = await this.map.getCenter();
    const zoom = await this.map.getZoom();
    const bounds = geoViewport.bounds([longitude, latitude], Math.round(zoom), [this.mapWidth, this.mapHeight], config.tileSize); // WSEN

    const radius = Math.round(distance([bounds[0], bounds[1]], [bounds[2], bounds[3]], { units: 'meters' }) / 2);

    // if radius is too big, yelp request fails
    if (radius > config.maxYelpRequestRadius) {
      this.setState({ yelpFeatureSet: null });

      return;
    }

    const params = {
      longitude,
      latitude,
      radius,
      term: 'gas',
      limit: '50'
    };
    const response = await fetch(`${config.urls.yelp}?${queryString.stringify(params)}`);

    if (!response.ok) {
      console.error('error in yelp request', response);

      return;
    }

    // query api
    const yelpFeatureSet = await response.json();
    await this.setState({ yelpFeatureSet });
  }

  componentDidMount() {
    console.log('componentDidMount');
    const history = this.props.history;

    if (history.location.state && history.location.state.currentTabPage) {
      this.tabs.goToPage(history.location.state.currentTabPage);
    }

    if (history.location.state && history.location.state.featuresInCurrentExtent) {
      this.setState({ featuresInCurrentExtent: history.location.state.featuresInCurrentExtent });
    }

    // location is [Lng,Lat,Zoom]
    if (this.props.match.params.location) {
      this.initMap(...this.props.match.params.location.split(',').map(parseFloat));
    } else {
      this.setState({ findingCurrentLocation: true });

      navigator.geolocation.getCurrentPosition((position) => {
        this.initMap(position.coords.longitude, position.coords.latitude, 10);
        console.log('current location: ', position);
        this.setState({ findingCurrentLocation: false });
      }, (error) => {
        console.error(error);
        this.initMap(...config.defaultExtent);
        this.setState({ findingCurrentLocation: false });
      }, {enableHighAccuracy: true});
    }
  }

  async initMap(long, lat, zoom) {
    console.log('initMap', arguments);

    this.setState({ currentLocation: [long, lat], zoom: zoom });
    this.loadList();
  }

  async onMapExtentChange(event) {
    console.log('onMapExtentChange', event);

    if (!event) {
      return;
    }

    console.log('zoom level', event.properties.zoomLevel);

    await this.updateYelpData();

    await this.updateFeaturesInCurrentExtent();

    const mapLocation = event.geometry.coordinates.map(num => round(num, 2));
    mapLocation.push(round(event.properties.zoomLevel, 1));
    const route = `/map/${mapLocation.join(',')}`;

    this.props.history.replace(route, {
      featuresInCurrentExtent: this.state.featuresInCurrentExtent,
      currentTabPage: this.state.currentTabPage
    });
  }

  async updateFeaturesInCurrentExtent() {
    console.log('updateFeaturesInCurrentExtent', this.state.filter);

    const [NE, SW] = await this.map.getVisibleBounds();
    const [N, E] = NE;
    const [S, W] = SW;

    let features = pointsWithinPolygon(this.state.poiJson, {
      crs: this.state.poiJson.crs,
      features: [helpers.polygon([[[N, W], [N, E], [S, E], [S, W], [N, W]]])],
      type: 'FeatureCollection'
    }).features;

    if (this.state.yelpFeatureSet && isEqual(this.state.filter, this.getClearFilter()) || this.state.filter.y) {
      features = features.concat(this.state.yelpFeatureSet.features);
    }

    console.log(features);

    await this.setState({
      featuresInCurrentExtent: features
    });
  }

  onCustomize(value) {
    const filterDelta = {};
    filterDelta[value] = !this.state.filter[value];

    const newFilter = { ...this.state.filter, ...filterDelta };

    this.updateLayerFilters(newFilter);
  }

  onClearCustomize() {
    this.updateLayerFilters(this.getClearFilter());
  }

  async updateLayerFilters(newFilter) {
    console.log('updateLayerFilters', newFilter);

    let showYelp = true;
    let poiJson = poiJsonAll;

    if (!isEqual(newFilter, this.getClearFilter())) {
      if (!newFilter.y) {
        showYelp = false;
      }

      const keys = Object.keys(newFilter)
        .filter(key => (newFilter[key] && key !== 'y'));

      if (keys.length > 0) {
        poiJson = {
          type: poiJsonAll.type,
          crs: poiJsonAll.crs,
          features: poiJsonAll.features.filter(feature => keys.includes(feature.properties[config.fieldnames.Type]))
        };
      } else {
        poiJson = {
          type: poiJsonAll.type,
          crs: poiJsonAll.crs,
          features: []
        };
      }
    }

    await this.setState({ showYelp, poiJson, filter: newFilter });

    this.updateFeaturesInCurrentExtent();
  }

  onGPSButtonPress() {
    this.setState({ followUser: !this.state.followUser });
  }

  onMapViewLayout(event) {
    console.log('onMapViewLayout');

    this.mapWidth = event.nativeEvent.layout.width;
    this.mapHeight = event.nativeEvent.layout.height;
  }

  async onMapLoad() {
    console.log('onMapLoad');

    this.setState({ mapLoaded: true });

    // manually trigger onmapExtentChange event to get features on load
    const coordinates = await this.map.getCenter();
    const zoomLevel = await this.map.getZoom();

    this.onMapExtentChange({
      geometry: { coordinates },
      properties: { zoomLevel }
    });

    const packName = 'mainMap';
    const pack = await MapboxGL.offlineManager.getPack(packName);
    if (!pack) {
      const onProgress = (region, status) => {
        console.log('onProgress', status);
      };
      const onError = (region, error) => {
        console.log('onError', error);
      };

      await MapboxGL.offlineManager.createPack({
        name: packName,
        styleURL: mapStyles.styleFileURI,
        minZoom: 5,
        maxZoom: 10,
        bounds: [[-108.16051, 42.33214], [-114.81823, 36.55156]]
      }, onProgress, onError);
    }
  }

  onPOIPress(event) {
    console.log('onPOIPress', event);

    const clickedFeature = event.nativeEvent.payload;

    // skip cluster features
    if (clickedFeature.properties.cluster) {
      return;
    }

    this.props.history.push(`/feature/${clickedFeature.properties[config.fieldnames.ID]}`);
  }

  onYelpPress(event) {
    console.log('onYelpPress', event);

    const clickedFeature = event.nativeEvent.payload;
    if (clickedFeature.properties.cluster) {
      return;
    }

    const selectedYelpGeoJSON = {
      type: 'FeatureCollection',
      features: [event.nativeEvent.payload]
    };
    this.setState({ selectedYelpGeoJSON });
  }

  onChangeTab(event) {
    console.log('onChangeTab');

    const state = { featuresInCurrentExtent: this.state.featuresInCurrentExtent };
    state.currentTabPage = (event.i === 0) ? 0 : 1;

    this.props.history.replace(`${this.props.history.location.pathname}`, state);

    this.setState({ currentTabPage: state.currentTabPage });
  }

  closeYelpPopup() {
    console.log('closeYelpPopup');

    this.setState({ selectedYelpGeoJSON: null });
  }

  render() {
    const clusterFilter = ['has', 'cluster'];
    const nonClusterFilter = ['!has', 'cluster'];

    return (
      <Container style={styles.container}>
        <Tabs onChangeTab={this.onChangeTab.bind(this)} ref={(el) => this.tabs = el} locked={true}>
          <Tab heading='Map'>
            { this.state.findingCurrentLocation && <Text style={styles.findingText}>Finding your current location...</Text> }
            <CustomMapView
              onDidFinishRenderingMapFully={this.onMapLoad.bind(this)}
              onLayout={this.onMapViewLayout.bind(this)}
              ref={(ref) => {
                if (ref) {
                  this.map = ref.map
                }
              }}
              zoomLevel={this.state.zoom}
              centerCoordinate={this.state.currentLocation}
              style={[styles.container, styles.mapView]}
              showUserLocation={this.state.followUser}
              userTrackingMode={(this.state.followUser) ? MapboxGL.UserTrackingModes.Follow : MapboxGL.UserTrackingModes.None }
              onRegionDidChange={(this.state.mapLoaded) ? this.onMapExtentChange.bind(this) : null }
              onPress={this.closeYelpPopup.bind(this)}
              >
              <MapboxGL.ShapeSource
                id='POI_SOURCE'
                shape={this.state.poiJson}
                onPress={this.onPOIPress.bind(this)}
                cluster
                clusterRadius={40}
                clusterMaxZoomLevel={11}>
                <MapboxGL.SymbolLayer
                  id='pointCount'
                  style={layerStyles.clusterCount}
                  filter={clusterFilter}
                  />
                <MapboxGL.CircleLayer
                  id={LAYERS.POINTS_OF_INTEREST}
                  style={layerStyles.poiLayer}
                  filter={nonClusterFilter}
                  />
                <MapboxGL.CircleLayer
                  id="clusteredPoi"
                  belowLayerID='pointCount'
                  style={layerStyles.clusteredPoi}
                  filter={clusterFilter}
                  />
              </MapboxGL.ShapeSource>
              { this.state.selectedYelpGeoJSON && (
                <MapboxGL.ShapeSource
                  id='YELP_SOURCE_SELECTED'
                  shape={this.state.selectedYelpGeoJSON}>
                  <MapboxGL.CircleLayer
                    id={LAYERS.YELP + '_SELECTED'}
                    style={[layerStyles.yelp, layerStyles.selected]}
                    />
                </MapboxGL.ShapeSource>
              )}
              { this.state.yelpFeatureSet && this.state.showYelp && (
                <MapboxGL.ShapeSource
                  id='YELP_SOURCE'
                  shape={this.state.yelpFeatureSet}
                  onPress={this.onYelpPress.bind(this)}
                  cluster
                  clusterRadius={40}
                  clusterMaxZoomLevel={12}>
                  <MapboxGL.SymbolLayer
                    id='yelpPointCount'
                    style={layerStyles.yelpClusterCount}
                    filter={clusterFilter}
                    />
                  <MapboxGL.CircleLayer
                    id={LAYERS.YELP}
                    style={layerStyles.yelp}
                    filter={nonClusterFilter}
                    />
                  <MapboxGL.CircleLayer
                    id='yelpClusters'
                    belowLayerID='yelpPointCount'
                    style={layerStyles.clusteredYelp}
                    filter={clusterFilter}
                    />
                </MapboxGL.ShapeSource>
              )}
            </CustomMapView>
            <Button onPress={this.onGPSButtonPress.bind(this)}
              light={!this.state.followUser}
              primary={this.state.followUser}
              style={styles.locateButton}>
              <Icon name='md-locate' style={styles.mapButtonIcon} />
            </Button>
            { this.state.selectedYelpGeoJSON &&
              <YelpPopup {...this.state.selectedYelpGeoJSON.features[0].properties} onClose={this.closeYelpPopup.bind(this)} />
            }
            <CustomizeBtn onCustomize={this.onCustomize.bind(this)}
              filter={this.state.filter} onClearCustomize={this.onClearCustomize.bind(this)} />
          </Tab>
          <Tab heading='List'>
            <List features={this.state.featuresInCurrentExtent} currentLocation={this.state.currentLocation} />
          </Tab>
        </Tabs>
      </Container>
    );
  }
}

const padding = 8;
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  findingText: {
    padding,
    fontSize: 15
  },
  locateButton: {
    position: 'absolute',
    bottom: 45 + padding,
    right: padding,
    paddingTop: 3,
    height: 36,
    borderColor: config.colors.borderColor,
    borderWidth: 1
  },
  mapButtonIcon: {
    marginLeft: padding,
    marginRight: padding
  },
  mapView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: buttonTheme().height
  }
});

const clusterStyle = {
  circleRadius: MapboxGL.StyleSheet.source(
    [[0, 15], [100, 20], [750, 30]],
    'point_count',
    MapboxGL.InterpolationMode.Exponential,
  ),
  circleOpacity: 0.7,
  circleStrokeWidth: 2,
  circleStrokeColor: 'white',
};
const circleRadius = 8;
const layerStyles = MapboxGL.StyleSheet.create({
  poiLayer: {
    circleRadius,
    circleColor: MapboxGL.StyleSheet.source(
      [
        ['h', config.colors.yellow],
        ['p', config.colors.green],
        ['w', config.colors.blue]
      ],
      config.fieldnames.Type,
      MapboxGL.InterpolationMode.Categorical
    ),
    circleStrokeWidth: 1
  },
  yelp: {
    circleRadius,
    circleColor: config.colors.yelpRed,
    circleStrokeWidth: 1
  },
  selected: {
    circleRadius: circleRadius + 4
  },
  clusterCount: {
    textField: '{point_count}',
    // this needs to be a font contained within the vector tiles base map
    textFont: ['Tahoma Regular'],
    textSize: 12,
    textColor: 'black'
  },
  yelpClusterCount: {
    textField: '{point_count}',
    // this needs to be a font contained within the vector tiles base map
    textFont: ['Tahoma Regular'],
    textSize: 12,
    textColor: 'black'
  },
  clusteredPoi: Object.assign({
    circleColor: config.colors.orange
  }, clusterStyle),
  clusteredYelp: Object.assign({
    circleColor: config.colors.yelpRed
  }, clusterStyle)
});
