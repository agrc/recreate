import React, { Component } from 'react';
import config from './config';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import mapboxgl from 'mapbox-gl';
import { Button } from 'reactstrap';


const getResampleDistance = function(length) {
  const distance = length / config.elevationProfileResampleFactor;

  return (distance >= 10) ? distance: 10;
}


class DetailMap extends Component {
  constructor(props) {
    super(props);

    this.state = { chartData: []};
  }

  componentDidMount() {
    this.initMap();
    this.buildElevationProfile();
  }

  buildElevationProfile() {
    const profile = this.props.location.state.profile.split(',').map(s => parseInt(s, 10));
    const min = profile[0];
    const max = profile[1];
    const range = max - min;

    // convert percentages to feet
    const chartData = profile.slice(2).map(percent => {
      return { value: (range * (percent/100)) + min };
    });

    this.setState({ chartData });
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
          'line-color': config.colors.blue,
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
              <Area type='monotone' dataKey='value' fill={config.colors.blue}></Area>
              <YAxis
                type='number'
                domain={['dataMin', 'dataMax']}
                mirror={true}
                stroke='#4a4a4a'/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <Button size='sm' color='primary' onClick={() => this.props.history.goBack()}>Back</Button>
      </div>
    );
  }
}

export { DetailMap as default, getResampleDistance };
