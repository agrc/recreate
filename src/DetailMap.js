import React, { Component } from 'react';
import config from './config';
// import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import { Container } from 'native-base';
import { Dimensions, StyleSheet } from 'react-native';
import geoViewport from '@mapbox/geo-viewport';


export default class DetailMap extends Component {
  constructor(props) {
    super(props);

    this.state = { chartData: []};
  }

  componentWillMount() {
    // TODO: https://github.com/agrc/recreate/issues/32
    const coords = JSON.parse(this.props.location.state.geojson).geometry.coordinates;

    let maxLat, maxLng, minLat, minLng;
    coords.forEach(([lng, lat]) => {
      if (!maxLat) {
        maxLat = lat;
        minLat = lat;
        maxLng = lng;
        minLng = lng;

        return;
      }

      if (lat > maxLat) {
        maxLat = lat
      } else if (lat < minLat) {
        minLat = lat;
      }

      if (lng > maxLng) {
        maxLng = lng;
      } else if (lng < minLng) {
        minLng = lng;
      }
    });

    const {height, width} = Dimensions.get('window');
    const extent = [minLng, minLat, maxLng, maxLat]; // WSEN

    const {center, zoom} = geoViewport.viewport(extent, [width, height], undefined, undefined, 512);

    this.center = center;
    this.zoom = zoom;
  }

  componentDidMount() {
    // this.buildElevationProfile();
  }

  // buildElevationProfile() {
  //   const profile = this.props.location.state.profile.split(',').map(s => parseInt(s, 10));
  //   const min = profile[0];
  //   const max = profile[1];
  //   const range = max - min;
  //
  //   // convert percentages to feet
  //   const chartData = profile.slice(2).map(percent => {
  //     return { value: (range * (percent/100)) + min };
  //   });
  //
  //   this.setState({ chartData });
  // }
  //

  // <div className='chart-container'>
  //   <ResponsiveContainer width={this.props.containerWidth || '100%'} height='100%'>
  //     <AreaChart data={this.state.chartData}>
  //       <Area type='monotone' dataKey='value' fill={config.colors.blue}></Area>
  //       <YAxis
  //         type='number'
  //         domain={['dataMin', 'dataMax']}
  //         mirror={true}
  //         stroke='#4a4a4a'/>
  //     </AreaChart>
  //   </ResponsiveContainer>
  // </div>
  // <Button size='sm' color='primary' onClick={() => this.props.history.goBack()}>Back</Button>

  render() {
    return (
      <Container style={styles.container}>
        <MapboxGL.MapView
          style={styles.container}
          styleURL={config.styles.outdoors}
          ref={(map) => this.map = map}
          centerCoordinate={this.center}
          zoomLevel={this.zoom}
          >
          <MapboxGL.ShapeSource id='TRAIL_SOURCE' shape={JSON.parse(this.props.location.state.geojson)}>
            <MapboxGL.LineLayer id='TRAIL_LAYER' style={layerStyles.trail} />
          </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

const layerStyles = MapboxGL.StyleSheet.create({
  trail: {
    lineColor: config.colors.blue,
    lineWidth: 6,
    lineJoin: MapboxGL.LineJoin.Round,
    lineCap: MapboxGL.LineCap.Round
  }
});
