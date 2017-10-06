import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';
import './css/MapView.css';


mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

class MapView extends Component {
  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/outdoors-v10',
      center: [-111.8, 40.55],
      zoom: 10
    });
    this.map.addControl(new mapboxgl.NavigationControl());
  }
  render() {
    return (
      <div ref={(el) => this.mapContainer = el}></div>
    );
  }
}

export default MapView;
