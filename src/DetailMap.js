import React, { Component } from 'react';
import polyline from '@mapbox/polyline';
import config from './config';


const getResampleDistance = function(length) {
  const distance = length / config.elevationProfileResampleFactor;

  return (distance >= 10) ? distance: 10;
}


class DetailMap extends Component {
  constructor(props) {
    super(props);

    this.getElevationProfile();
  }

  async getElevationProfile() {
    const encoded_polyline = polyline.fromGeoJSON(JSON.parse(this.props.location.state.geojson), 6);
    const params = {
      range: false,
      encoded_polyline,
      resample_distance: getResampleDistance(JSON.parse(this.props.location.state.geojson).properties.SHAPE__Length)
    };
    const response = await fetch(`${config.urls.elevation}?json=${JSON.stringify(params)}&api_key=${process.env.REACT_APP_MAPZEN_API_KEY}`);
    if (response.ok) {
      const result = await response.json();
      console.log(result.encoded_polyline);
      console.log(result.height);
    }
  }

  render() {
    return (
      <div>
        <div ref={el => this.mapContainer = el}></div>
      </div>
    );
  }
}

export { DetailMap as default, getResampleDistance };
