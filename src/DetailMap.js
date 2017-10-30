import React, { Component } from 'react';
import polyline from '@mapbox/polyline';
import config from './config';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import mapboxgl from 'mapbox-gl';
import { Button } from 'reactstrap';

import './css/DetailMap.css';


const getResampleDistance = function(length) {
  const distance = length / config.elevationProfileResampleFactor;

  return (distance >= 10) ? distance: 10;
}


class DetailMap extends Component {
  constructor(props) {
    super(props);

    this.state = { chartData: [] };

    this.getElevationProfile();
  }

  componentDidMount() {
    this.initMap();
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
      this.setState({ chartData: result.height.map(value => {return {value}}) });
    }
  }

  initMap() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: config.styles.outdoors
    });
    const coords = JSON.parse(this.props.location.state.geojson).geometry.coordinates;
    const bounds = coords.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coords[0], coords[0]));

    this.map.fitBounds(bounds, {
      padding: { top: 40, left: 40, right: 40, bottom: 95 },
      duration: 0
    });
    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.on('load', () => {
      this.map.addLayer({
        id: 'trail',
        type: 'line',
        source: {
          type: 'geojson',
          data: JSON.parse(this.props.location.state.geojson)
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': config.colors.elevationProfile,
          'line-width': 6
        }
      });
    });
  }

  render() {
    return (
      <div className='detail-map'>
        <div ref={el => this.mapContainer = el}></div>
        <div className='chart-container'>
          <ResponsiveContainer width={this.props.containerWidth || '100%'} height='100%'>
            <AreaChart data={this.state.chartData}>
              <Area type='monotone' dataKey='value' fill={config.colors.elevationProfile}></Area>
              <YAxis
                type='number'
                domain={['dataMin', 'dataMax']}
                mirror={true}
                stroke='white'/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <Button size='sm' color='primary' onClick={() => this.props.history.goBack()}>Back</Button>
      </div>
    );
  }
}

export { DetailMap as default, getResampleDistance };
