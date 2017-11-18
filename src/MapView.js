import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router';
import mapboxgl from 'mapbox-gl';
import { Button, ButtonGroup } from 'reactstrap';
import List from './List';
import Popup from './Popup';
import YelpPopup from './YelpPopup';
import round from 'lodash.round';
import config from './config';
import distance from '@turf/distance';
import queryString from 'query-string';


mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
const VIEWS = { MAP: 'MAP', LIST: 'LIST' };
const LAYERS = { POINTS_OF_INTEREST: 'points-of-interest', YELP: 'yelp' };

class MapView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentView: VIEWS.MAP,
      findingCurrentLocation: false,
      featuresInCurrentExtent: [],
      currentLocation: null
    };
  }

  loadPointsOfInterest() {
    this.map.addLayer({
      id: LAYERS.POINTS_OF_INTEREST,
      type: 'circle',
      source: {
        type: 'geojson',
        data: config.urls.POI_DATA
      },
      paint: {
        'circle-radius': 8,
        'circle-color': {
          property: 'Type',
          type: 'categorical',
          stops: [
            ['h', '#e7eb3f'],
            ['l', '#3feb9e'],
            ['w', '#3f6feb']
          ]
        },
        'circle-stroke-width': 1
      }
    });

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
    this.mount = true;

    // location is [Lng,Lat,Zoom]
    if (this.props.match.params.location) {
      this.initMap(...this.props.match.params.location.split(',').map(parseFloat));
    } else {
      this.setState({ findingCurrentLocation: true });

      navigator.geolocation.getCurrentPosition((position) => {
        this.initMap(position.coords.longitude, position.coords.latitude, 10);
        this.setState({ findingCurrentLocation: false });
      }, (error) => {
        console.error(error);
        this.initMap(-111.8, 40.55, 12); // east side of salt lake valley
        this.setState({ findingCurrentLocation: false });
      });
    }

    if (this.props.match.params.list) {
      this.setState({ currentView: VIEWS.LIST });
    }
  }

  componentWillUnmount() {
    this.mount = false;
  }

  initMap(long, lat, zoom) {
    this.setState({ currentLocation: [long, lat] });
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: config.styles.outdoors,
      center: [long, lat],
      zoom: zoom
    });
    this.map.addControl(new mapboxgl.NavigationControl());

    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    });
    geolocateControl.on('geolocate', position => {
      if (this.mounted) {
        console.log('position updated (mounted)');
        this.setState({ currentLocation: [position.coords.longitude, position.coords.latitude] });
      }
      console.log('position not updated (unmounted)');
    });
    this.map.addControl(geolocateControl);
    this.map.on('load', () => {
      this.loadPointsOfInterest();
      this.loadYelpData();
    });
    this.map.on('moveend', this.onMapExtentChange.bind(this));

    this.map.on('mouseenter', LAYERS.POINTS_OF_INTEREST, () => this.map.getCanvas().style.cursor = 'pointer');
    this.map.on('mouseleave', LAYERS.POINTS_OF_INTEREST, () => this.map.getCanvas().style.cursor = '');
    this.map.on('click', LAYERS.POINTS_OF_INTEREST, evt => {
      const feature = evt.features[0];
      ReactDOM.unstable_renderSubtreeIntoContainer(this, <Popup feature={feature} currentLocation={this.state.currentLocation} />, this.popupContainer);
      new mapboxgl.Popup()
        .setLngLat(feature.geometry.coordinates)
        .setDOMContent(this.popupContainer)
        .addTo(this.map);
      evt.originalEvent.stopPropagation();
      evt.originalEvent.preventDefault();
    });
    this.map.on('click', LAYERS.YELP, evt => {
      const feature = evt.features[0];
      ReactDOM.unstable_renderSubtreeIntoContainer(this, <YelpPopup {...feature.properties} />, this.yelpPopupContainer);
      new mapboxgl.Popup()
        .setLngLat(feature.geometry.coordinates)
        .setDOMContent(this.yelpPopupContainer)
        .addTo(this.map);
    });
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

  render() {
    return (
      <div className='map-view'>
        <ButtonGroup>
          <Button color='primary' onClick={() => this.onRadioButtonClick(VIEWS.MAP)} active={this.state.currentView === VIEWS.MAP}>View Map</Button>
          <Button color='primary' onClick={() => this.onRadioButtonClick(VIEWS.LIST)} active={this.state.currentView === VIEWS.LIST}>View List</Button>
        </ButtonGroup>
        { this.state.findingCurrentLocation && <span className='finding-text'>Finding your current location...</span> }
        <div ref={el => this.mapContainer = el} style={{display: (this.state.currentView === VIEWS.MAP) ? 'block': 'none'}}></div>
        <Route path='/map/:location/list' render={() => <List features={this.state.featuresInCurrentExtent} currentLocation={this.state.currentLocation} /> } />
        <div ref={el => this.popupContainer = el}></div>
        <div ref={el => this.yelpPopupContainer = el} className='yelp-popup-container'></div>
      </div>
    );
  }
}

export default MapView;
