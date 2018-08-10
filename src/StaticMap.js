import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import { Dimensions } from 'react-native';
import mapStyles from './mapStyles';
import CustomMapView from './CustomMapView';
import config from './config';
import bbox from '@turf/bbox';
import geoViewport from '@mapbox/geo-viewport';


export default function StaticMap(props) {
  console.log('StaticMap props: ', props);

  if (!props.geojson) {
    return null;
  }

  const geojson = JSON.parse(props.geojson);

  const width = Math.round(Dimensions.get('window').width);
  const height = Math.round(width*0.62);
  const margin = -8;

  const style = {
    width,
    height,
    marginLeft: margin,
    marginRight: margin,
    marginTop: 10
  };

  let centerCoords, zoom;
  if (geojson.geometry.type === 'Point') {
    centerCoords = geojson.geometry.coordinates;
    zoom = 10;
  } else {
    const viewport = geoViewport.viewport(bbox(geojson.geometry), [width, height], undefined, undefined, config.tileSize);
    centerCoords = viewport.center;
    zoom = viewport.zoom;
  }

  const layers = {
    Point: <MapboxGL.CircleLayer id='pointLayer' style={layerStyles.point}></MapboxGL.CircleLayer>,
    Polygon: <MapboxGL.FillLayer id='polyLayer' style={layerStyles.polygon}></MapboxGL.FillLayer>,
    LineString: <MapboxGL.LineLayer id='lineLayer' style={layerStyles.line}></MapboxGL.LineLayer>
  };

  return (
    <CustomMapView
      zoomEnabled={false}
      scrollEnabled={false}
      styleURL={mapStyles.styleFileURI}
      zoomLevel={zoom}
      centerCoordinate={centerCoords}
      style={style}
      >
      <MapboxGL.ShapeSource
        id='FEATURE'
        shape={geojson}
        >
        {layers[geojson.geometry.type]}
      </MapboxGL.ShapeSource>
    </CustomMapView>
  );
}

const layerStyles = MapboxGL.StyleSheet.create({
  point: {
    circleRadius: 8,
    circleColor: config.colors.blue,
    circleStrokeWidth: 1
  },
  polygon: {
    fillColor: config.colors.green,
    fillOpacity: 0.6
  },
  line: {
    lineColor: config.colors.blue,
    lineWidth: 6,
    lineJoin: MapboxGL.LineJoin.Round,
    lineCap: MapboxGL.LineCap.Round
  }
});
