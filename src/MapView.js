import React, { Component } from 'react';
import { StyleSheet, Text } from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import List from './List';
// import Popup from './Popup';
// import YelpPopup from './YelpPopup';
// import CustomizeBtn from './CustomizeBtn';
import round from 'lodash.round';
import config from './config';
import distance from '@turf/distance';
import queryString from 'query-string';
import isEqual from 'lodash.isequal';
import { Button, Container, Icon, Tabs, Tab } from 'native-base';
import poiJson from './PointsOfInterest.json'


const LAYERS = { POINTS_OF_INTEREST: 'poi', YELP: 'yelp' };
const MAP_HEADING = 'Map';

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
      initialTabPage: 0
    };

    this.yelpDataLoaded = true;
  }

  getClearFilter() {
    const filter = {};
    Object.keys(config.poi_type_lookup).forEach(key => filter[key] = false);

    return filter;
  }

  loadList() {
    if (this.yelpDataLoaded) {
      this.onMapExtentChange();
    }
  }

  // async loadYelpData() {
  //   const yelpID = 'yelp-source';
  //   const yelpIconImageName = 'yelp-icon'
  //
  //   this.map.addSource(yelpID, {
  //     type: 'geojson',
  //     data: {
  //       type: 'FeatureCollection',
  //       features: []
  //     }
  //   });
  //
  //   this.map.loadImage(config.urls.yelpIcon, (error, image) => {
  //     if (error) {
  //       throw error;
  //     }
  //
  //     this.map.addImage(yelpIconImageName, image);
  //
  //     this.map.addLayer({
  //       id: LAYERS.YELP,
  //       type: 'symbol',
  //       source: yelpID,
  //       layout: {
  //         'icon-image': yelpIconImageName,
  //         'icon-size': 0.5
  //       }
  //     });
  //   });
  //
  //   const updateYelpData = async () => {
  //     const center = this.map.getCenter();
  //     const bounds = this.map.getBounds();
  //
  //     // TODO: radius must be less than 4000 or yelp returns an error
  //     const radius = Math.round(distance(bounds.getSouthWest().toArray(), bounds.getNorthEast().toArray(), 'meters'));
  //
  //     const params = {
  //       longitude: center.lng,
  //       latitude: center.lat,
  //       radius,
  //       term: 'gas',
  //       limit: '50'
  //     };
  //     const response = await fetch(`${config.urls.yelp}?${queryString.stringify(params)}`);
  //
  //     if (!response.ok) {
  //       console.error('error in yelp request', response);
  //
  //       return;
  //     }
  //
  //     // query api
  //     const yelpSource = this.map.getSource(yelpID);
  //     yelpSource.setData(await response.json());
  //
  //     if (!this.yelpDataLoaded) {
  //       this.yelpDataLoaded = true;
  //
  //       // TODO: gross!!!
  //       window.setTimeout(this.loadList.bind(this), 200);
  //     }
  //   };
  //
  //   updateYelpData();
  //
  //   this.map.on('moveend', updateYelpData);
  // }

  componentWillMount() {
    console.log('componentWillMount');

    if (this.props.history.location.pathname.match(/list/)) {
      this.setState({ initialTabPage: 1 });
    } else {
      this.setState({ initialTabPage: 0 });
    }
  }

  componentDidMount() {
    console.log('componentDidMount');

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

    // this.loadYelpData();

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

  async onMapExtentChange(event) {
    console.log('onMapExtentChange', event);

    if (!event) {
      return;
    }

    const layerIds = [LAYERS.POINTS_OF_INTEREST];
    const bbox = [0, this.mapWidth, this.mapHeight, 0];

    let features = await this.map.queryRenderedFeaturesInRect(bbox, null, layerIds);

    const keys = {};
    features = features.features.filter((f) => {
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

    const mapLocation = event.geometry.coordinates.map(num => round(num, 2));
    mapLocation.push(round(event.properties.zoomLevel, 1));
    let route = `/map/${mapLocation.join(',')}`;

    this.props.history.replace(route);
  }

  // onCustomize(value) {
  //   const newFilter = {};
  //   newFilter[value] = !this.state.filter[value];
  //   this.setState((previousState) => ({
  //     filter: { ...previousState.filter, ...newFilter }
  //   }));
  // }
  //
  // onClearCustomize() {
  //   this.setState({ filter: this.getClearFilter() });
  // }

  // componentWillUpdate(nextProps, nextState) {
  //   console.log('componentWillUpdate');
  //
  //   const nextFilter = nextState.filter;
  //   if (isEqual(nextFilter, this.state.filter)) {
  //     return;
  //   }
  //
  //   if (isEqual(nextFilter, this.getClearFilter())) {
  //     this.map.setLayoutProperty(LAYERS.YELP, 'visibility', 'visible');
  //     this.map.setFilter(LAYERS.POINTS_OF_INTEREST, null);
  //     return;
  //   }
  //
  //   const yelpVisibility = (nextFilter.y) ? 'visible' : 'none';
  //   this.map.setLayoutProperty(LAYERS.YELP, 'visibility', yelpVisibility);
  //
  //   const expressions = Object.keys(nextFilter)
  //     .filter(key => (nextFilter[key] && key !== 'y'))
  //     .map(key => ['==', config.fieldnames.Type, key]);
  //   this.map.setFilter(LAYERS.POINTS_OF_INTEREST, ['any', ...expressions])
  // }

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

    this.setState({ clickedFeatureSet: MapboxGL.geoUtils.makeFeatureCollection([clickedFeature]) });

    console.log(clickedFeature);
  }

  onChangeTab(event) {
    console.log('onChangeTab', event);

    if (event.i === 0) {
      // to map tab
      if (this.props.history.location.pathname.match(/list/)) {
        this.props.history.push(`${this.props.history.location.pathname.replace('/list', '')}`);
      }
    } else if (!this.props.history.location.pathname.match(/list/)) {
      // to list tab
      this.props.history.push(`${this.props.history.location.pathname}/list`);
    }
  }

  render() {
    return (
      <Container style={styles.container}>
        <Tabs onChangeTab={this.onChangeTab.bind(this)} ref={(el) => this.tabs = el} initialPage={this.state.initialTabPage}>
          <Tab heading={MAP_HEADING}>
            { this.state.findingCurrentLocation && <Text style={styles.findingText}>Finding your current location...</Text> }
            <MapboxGL.MapView
              onDidFinishRenderingMapFully={this.onMapLoad.bind(this)}
              onLayout={this.onMapViewLayout.bind(this)}
              ref={(ref) => (this.map = ref)}
              styleURL={config.styles.outdoors}
              zoomLevel={this.state.zoom}
              centerCoordinate={this.state.currentLocation}
              style={styles.container}
              showUserLocation={this.state.followUser}
              userTrackingMode={(this.state.followUser) ? MapboxGL.UserTrackingModes.Follow : MapboxGL.UserTrackingModes.None }
              onRegionDidChange={(this.state.mapLoaded) ? this.onMapExtentChange.bind(this) : null }
              >
              <MapboxGL.ShapeSource id='POI_SOURCE' shape={poiJson} onPress={this.onPOIPress.bind(this)}>
                <MapboxGL.CircleLayer id={LAYERS.POINTS_OF_INTEREST} style={layerStyles.poiLayer}/>
              </MapboxGL.ShapeSource>
              <MapboxGL.ShapeSource id='CALLOUT_SOURCE' shape={this.state.clickedFeatureSet}>
                <MapboxGL.SymbolLayer id='CALLOUT_SYMBOL_LAYER' style={layerStyles.callout} />
              </MapboxGL.ShapeSource>
            </MapboxGL.MapView>
            <Button onPress={this.onGPSButtonPress.bind(this)}
              light={!this.state.followUser}
              primary={this.state.followUser}
              style={styles.locateButton}>
              <Icon name='md-locate' style={styles.mapButtonIcon} />
            </Button>
          </Tab>
          <Tab heading='List'>
            <List features={this.state.featuresInCurrentExtent} currentLocation={this.state.currentLocation} />
          </Tab>
        </Tabs>
        {/*
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
      </Container>
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
    bottom: 30 + padding,
    right: padding,
    paddingTop: 3,
    height: 36,
    borderColor: '#999999',
    borderWidth: 1
  },
  mapButtonIcon: {
    marginLeft: padding,
    marginRight: padding
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
  callout: {
    textField: `{${config.fieldnames.Name}}`,
    textOffset: [0, -2]
  }
});
