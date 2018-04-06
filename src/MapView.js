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
import poiJson from './PointsOfInterest.json';
import yelpIcon from './images/Yelp_burst_positive_RGB.png';
import geoViewport from '@mapbox/geo-viewport';
import YelpPopup from './YelpPopup';
import buttonTheme from './native-base-theme/components/Button';
import isEqual from 'lodash.isequal';


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
      yelpFeature: null,
      showYelp: true,
      poiFilter: null
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

  initMap(long, lat, zoom) {
    console.log('initMap', arguments);

    this.setState({ currentLocation: [long, lat], zoom: zoom });
    this.loadList();
  }

  async onMapExtentChange(event) {
    console.log('onMapExtentChange', event);

    if (!event) {
      return;
    }

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

    const layerIds = [LAYERS.POINTS_OF_INTEREST];
    const bbox = [0, this.mapWidth, this.mapHeight, 0];

    // this doesn't always appear to return all features immediately after updateLayerFilters
    const featureSet = await this.map.queryRenderedFeaturesInRect(bbox, null, layerIds);

    const keys = {};
    // remove duplicates and apply current filter
    let features = featureSet.features.filter((f) => {
      const id = f.id || f.properties.id;
      let isUnique = (keys[id] === undefined);
      keys[id] = true;

      if (isEqual(this.state.filter, this.getClearFilter())) {
        return isUnique;
      } else {
        return (isUnique && this.state.filter[f.properties[config.fieldnames.Type]]);
      }
    });
    
    if (isEqual(this.state.filter, this.getClearFilter()) || this.state.filter.y) {
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
    
    // can set this variable to null after https://github.com/mapbox/react-native-mapbox-gl/issues/1160 is solved
    let poiFilter = ['has', config.fieldnames.Type];

    if (!isEqual(newFilter, this.getClearFilter())) {
      if (!newFilter.y) {
        showYelp = false;
      }

      const expressions = Object.keys(newFilter)
        .filter(key => (newFilter[key] && key !== 'y'))
        .map(key => ['==', config.fieldnames.Type, key]);

      if (expressions.length > 0) {
        poiFilter = ['any', ...expressions];
      } else {
        poiFilter = ['has', 'a-key-that-no-features-have']
      }
    }

    await this.setState({ showYelp, poiFilter, filter: newFilter });

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
  }

  onPOIPress(event) {
    const clickedFeature = event.nativeEvent.payload;

    this.props.history.push(`/feature/${clickedFeature.properties[config.fieldnames.ID]}`);
  }

  onYelpPress(event) {
    this.setState({ yelpFeature: event.nativeEvent.payload.properties });
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

    this.setState({ yelpFeature: null });
  }

  render() {
    return (
      <Container style={styles.container}>
        <Tabs onChangeTab={this.onChangeTab.bind(this)} ref={(el) => this.tabs = el}>
          <Tab heading='Map'>
            { this.state.findingCurrentLocation && <Text style={styles.findingText}>Finding your current location...</Text> }
            <MapboxGL.MapView
              onDidFinishRenderingMapFully={this.onMapLoad.bind(this)}
              onLayout={this.onMapViewLayout.bind(this)}
              ref={(ref) => (this.map = ref)}
              styleURL={config.styles.outdoors}
              zoomLevel={this.state.zoom}
              centerCoordinate={this.state.currentLocation}
              style={[styles.container, styles.mapView]}
              showUserLocation={this.state.followUser}
              userTrackingMode={(this.state.followUser) ? MapboxGL.UserTrackingModes.Follow : MapboxGL.UserTrackingModes.None }
              onRegionDidChange={(this.state.mapLoaded) ? this.onMapExtentChange.bind(this) : null }
              onPress={this.closeYelpPopup.bind(this)}
              >
              <MapboxGL.ShapeSource id='POI_SOURCE' shape={poiJson} onPress={this.onPOIPress.bind(this)}>
                <MapboxGL.CircleLayer id={LAYERS.POINTS_OF_INTEREST} style={layerStyles.poiLayer}
                  filter={this.state.poiFilter} />
              </MapboxGL.ShapeSource>
              { this.state.yelpFeatureSet && this.state.showYelp && (
                <MapboxGL.ShapeSource id='YELP_SOURCE' shape={this.state.yelpFeatureSet} onPress={this.onYelpPress.bind(this)}>
                  <MapboxGL.SymbolLayer id={LAYERS.YELP} style={layerStyles.yelp} />
                </MapboxGL.ShapeSource>
              )}
            </MapboxGL.MapView>
            <Button onPress={this.onGPSButtonPress.bind(this)}
              light={!this.state.followUser}
              primary={this.state.followUser}
              style={styles.locateButton}>
              <Icon name='md-locate' style={styles.mapButtonIcon} />
            </Button>
            { this.state.yelpFeature && <YelpPopup {...this.state.yelpFeature} onClose={this.closeYelpPopup.bind(this)} /> }
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

const padding = 8
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
    bottom: 75 + padding,
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

const layerStyles = MapboxGL.StyleSheet.create({
  poiLayer: {
    circleRadius: 8,
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
    iconImage: yelpIcon,
    iconAllowOverlap: true,
    iconSize: 0.5
  }
});
