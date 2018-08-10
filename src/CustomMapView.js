import React, { Component } from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import mapStyles from './mapStyles';


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
    return (
      <MapboxGL.MapView
          {...this.props}
          ref={(mapRef) => this.map = mapRef}
          pitchEnabled={false}
          rotateEnabled={false}
          logoEnabled={false}
          styleURL={(this.state.styleLoaded) ? mapStyles.styleFileURI : null}
          >
      </MapboxGL.MapView>
    );
  }
}
