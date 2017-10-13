import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';
import './css/MapView.css';


mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

class MapView extends Component {
  loadPointsOfInterest() {
    this.map.addLayer({
      id: 'points-of-interest',
      type: 'circle',
      source: {
        type: 'geojson',
        data: 'PointsOfInterest.json'
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
  }
  componentDidMount() {
    if (this.props.match.params.extent) {
      this.initMap(this.props.match.params.extent.split(',').map(parseFloat));
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        this.initMap([position.coords.longitude, position.coords.latitude]);
      }, (error) => {
        console.error(error);
        this.initMap([-111.8, 40.55]); // east side of salt lake valley
      });
    }
  }
  initMap(center) {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/outdoors-v10',
      center: center,
      zoom: 12
    });
    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }))
    this.map.on('load', this.loadPointsOfInterest.bind(this));
  }
  render() {
    return (
      <div ref={(el) => this.mapContainer = el}></div>
    );
  }
}

export default MapView;
