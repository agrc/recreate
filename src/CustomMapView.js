import React, { Component } from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import mapStyles from './mapStyles';
import config from './config';


export default class CustomMapView extends Component {
  constructor(props) {
    super(props);

    this.state = { styleLoaded: false };

    this.map = null;
  }

  componentDidMount() {
    mapStyles.getBasemapStyle(this);
  }

  render() {
    return this.state.styleLoaded && (
      <MapboxGL.MapView
          {...this.props}
          ref={(mapRef) => this.map = mapRef}
          pitchEnabled={false}
          rotateEnabled={false}
          logoEnabled={false}
          styleURL={mapStyles.styleFileURI}
          maxZoomLevel={config.maxZoomLevel}
          >
      </MapboxGL.MapView>
    );
  }
}
