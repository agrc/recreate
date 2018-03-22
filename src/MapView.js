import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
// import { Route } from 'react-router-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
// import List from './List';
// import Popup from './Popup';
// import YelpPopup from './YelpPopup';
// import CustomizeBtn from './CustomizeBtn';
import round from 'lodash.round';
import config from './config';
import distance from '@turf/distance';
import queryString from 'query-string';
import isEqual from 'lodash.isequal';
import { Button, Icon } from 'native-base';
import poiJson from './PointsOfInterest.json'


const VIEWS = { MAP: 'MAP', LIST: 'LIST' };
const LAYERS = { POINTS_OF_INTEREST: 'points-of-interest', YELP: 'yelp' };

export default class MapView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentView: VIEWS.MAP,
      findingCurrentLocation: false,
      featuresInCurrentExtent: [],
      currentLocation: [-111.8, 40.55],
      zoom: 15,
      filter: this.getClearFilter(),
      followUser: false
    };
  }

  getClearFilter() {
    const filter = {};
    Object.keys(config.poi_type_lookup).forEach(key => filter[key] = false);

    return filter;
  }

  loadPointsOfInterest() {

    const onDataLoad = (mapDataEvent) => {
      if (mapDataEvent.isSourceLoaded &&
          mapDataEvent.source.data === config.urls.POI_DATA &&
          mapDataEvent.sourceDataType !== 'metadata') {
        this.poiDataLoaded = true;

        this.loadList();
        this.map.off('data', onDataLoad);
      }
    };

    this.map.on('sourcedata', onDataLoad);
  }

  loadList() {
    if (this.poiDataLoaded && this.yelpDataLoaded) {
      this.onMapExtentChange();
    }
  }

  async loadYelpData() {
    const yelpID = 'yelp-source';
    const yelpIconImageName = 'yelp-icon'

    this.map.addSource(yelpID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    this.map.loadImage(config.urls.yelpIcon, (error, image) => {
      if (error) {
        throw error;
      }

      this.map.addImage(yelpIconImageName, image);

      this.map.addLayer({
        id: LAYERS.YELP,
        type: 'symbol',
        source: yelpID,
        layout: {
          'icon-image': yelpIconImageName,
          'icon-size': 0.5
        }
      });
    });

    const updateYelpData = async () => {
      const center = this.map.getCenter();
      const bounds = this.map.getBounds();

      // TODO: radius must be less than 4000 or yelp returns an error
      const radius = Math.round(distance(bounds.getSouthWest().toArray(), bounds.getNorthEast().toArray(), 'meters'));

      const params = {
        longitude: center.lng,
        latitude: center.lat,
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
      const yelpSource = this.map.getSource(yelpID);
      yelpSource.setData(await response.json());

      if (!this.yelpDataLoaded) {
        this.yelpDataLoaded = true;

        // TODO: gross!!!
        window.setTimeout(this.loadList.bind(this), 200);
      }
    };

    updateYelpData();

    this.map.on('moveend', updateYelpData);
  }

  componentDidMount() {
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
        this.initMap(-111.8, 40.55, 12); // east side of salt lake valley
        this.setState({ findingCurrentLocation: false });
      }, {enableHighAccuracy: true});
    }

    if (this.props.match.params.list) {
      this.setState({ currentView: VIEWS.LIST });
    }
  }

  initMap(long, lat, zoom) {
    this.setState({ currentLocation: [long, lat], zoom: zoom });
    // this.map.on('load', () => {
    //   this.loadPointsOfInterest();
    //   this.loadYelpData();
    // });
    // this.map.on('moveend', this.onMapExtentChange.bind(this));
    //
    // this.map.on('mouseenter', LAYERS.POINTS_OF_INTEREST, () => this.map.getCanvas().style.cursor = 'pointer');
    // this.map.on('mouseleave', LAYERS.POINTS_OF_INTEREST, () => this.map.getCanvas().style.cursor = '');
    // this.map.on('click', LAYERS.POINTS_OF_INTEREST, evt => {
    //   const feature = evt.features[0];
    //   ReactDOM.unstable_renderSubtreeIntoContainer(this, <Popup feature={feature} currentLocation={this.state.currentLocation} />, this.popupContainer);
    //   new mapboxgl.Popup()
    //     .setLngLat(feature.geometry.coordinates)
    //     .setDOMContent(this.popupContainer)
    //     .addTo(this.map);
    //   evt.originalEvent.stopPropagation();
    //   evt.originalEvent.preventDefault();
    // });
    // this.map.on('click', LAYERS.YELP, evt => {
    //   const feature = evt.features[0];
    //   ReactDOM.unstable_renderSubtreeIntoContainer(this, <YelpPopup {...feature.properties} />, this.yelpPopupContainer);
    //   new mapboxgl.Popup()
    //     .setLngLat(feature.geometry.coordinates)
    //     .setDOMContent(this.yelpPopupContainer)
    //     .addTo(this.map);
    // });
  }

  onMapExtentChange() {
    const keys = {};
    const features = this.map.queryRenderedFeatures({layers:[LAYERS.POINTS_OF_INTEREST, LAYERS.YELP]}).filter((f) => {
      const id = f.id || f.properties.id;
      if (keys[id]) {
        return false
      }
      keys[id] = true;
      return true;
    });

    this.setState({
      featuresInCurrentExtent: features
    });

    const mapLocation = this.map.getCenter().toArray().map(num => round(num, 2));
    mapLocation.push(round(this.map.getZoom(), 1));
    let route = `/map/${mapLocation.join(',')}`;
    if (this.state.currentView === VIEWS.LIST) {
      route += '/list';
    }
    this.props.history.replace(route);
  }

  onRadioButtonClick(newView) {
    this.setState({ currentView: newView });
    if (newView === VIEWS.LIST) {
      this.props.history.push(`${this.props.history.location.pathname}/list`);
    } else {
      this.props.history.push(`${this.props.history.location.pathname.replace('/list', '')}`);
    }
  }

  onCustomize(value) {
    const newFilter = {};
    newFilter[value] = !this.state.filter[value];
    this.setState((previousState) => ({
      filter: { ...previousState.filter, ...newFilter }
    }));
  }

  onClearCustomize() {
    this.setState({ filter: this.getClearFilter() });
  }

  componentWillUpdate(nextProps, nextState) {
    const nextFilter = nextState.filter;
    if (isEqual(nextFilter, this.state.filter)) {
      return;
    }

    if (isEqual(nextFilter, this.getClearFilter())) {
      this.map.setLayoutProperty(LAYERS.YELP, 'visibility', 'visible');
      this.map.setFilter(LAYERS.POINTS_OF_INTEREST, null);
      return;
    }

    const yelpVisibility = (nextFilter.y) ? 'visible' : 'none';
    this.map.setLayoutProperty(LAYERS.YELP, 'visibility', yelpVisibility);

    const expressions = Object.keys(nextFilter)
      .filter(key => (nextFilter[key] && key !== 'y'))
      .map(key => ['==', config.fieldnames.Type, key]);
    this.map.setFilter(LAYERS.POINTS_OF_INTEREST, ['any', ...expressions])
    this.onMapExtentChange();
  }
  onGPSButtonPress() {
    this.setState({ followUser: !this.state.followUser });
  }

  render() {
    return (
      <View style={styles.container}>
        { this.state.findingCurrentLocation && <Text style={styles.findingText}>Finding your current location...</Text> }
        <MapboxGL.MapView
          ref={(ref) => (this.map = ref)}
          styleURL={config.styles.outdoors}
          zoomLevel={this.state.zoom}
          centerCoordinate={this.state.currentLocation}
          style={[styles.container, {
            display: (this.state.currentView === VIEWS.MAP && !this.state.findingCurrentLocation) ? 'flex': 'none'
          }]}
          showUserLocation={true}
          userTrackingMode={(this.state.followUser) ? MapboxGL.UserTrackingModes.Follow : MapboxGL.UserTrackingModes.None }
          >
          <MapboxGL.ShapeSource id='POI_SOURCE' shape={poiJson}>
            <MapboxGL.CircleLayer id={LAYERS.POINTS_OF_INTEREST} style={layerStyles.poiLayer}/>
          </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
        <Button success onPress={this.onGPSButtonPress.bind(this)}
          bordered={!this.state.followUser}
          style={styles.locateButton}>
          <Icon name='md-locate' />
        </Button>
        {/*
        <Route path='/map/:location/list'
          render={() => <List features={this.state.featuresInCurrentExtent} currentLocation={this.state.currentLocation} /> } />
          <View>
          <Button color='primary' onClick={() => this.onRadioButtonClick(VIEWS.MAP)} active={this.state.currentView === VIEWS.MAP}>View Map</Button>
          <Button color='primary' onClick={() => this.onRadioButtonClick(VIEWS.LIST)} active={this.state.currentView === VIEWS.LIST}>View List</Button>
          </View>
        <Route path='/map/:location' exact={true} render={() => {
            return (<CustomizeBtn onCustomize={this.onCustomize.bind(this)}
              filter={this.state.filter} onClearCustomize={this.onClearCustomize.bind(this)} />);
          } }/>
        */}
        {/*
        <div ref={el => this.popupContainer = el}></div>
        <div ref={el => this.yelpPopupContainer = el} className='yelp-popup-container'></div>
        */}
      </View>
    );
  }
}

const padding = 8
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  hidden: {
    display: 'none'
  },
  findingText: {
    padding,
    fontSize: 15
  },
  locateButton: {
    position: 'absolute',
    top: padding,
    left: padding
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
  }
});
