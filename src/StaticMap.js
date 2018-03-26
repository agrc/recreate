import React from 'react';
import { Dimensions, Image } from 'react-native';
import { REACT_APP_MAPBOX_TOKEN } from 'react-native-dotenv';


export default function StaticMap(props) {
  let geojson = props.geojson;

  if (!geojson) {
    return null;
  }

  // mapbox static api also doesn't like out and back lines
  if (props.outAndBack) {
    const parsedGeoJSON = JSON.parse(geojson);

    parsedGeoJSON.geometry.coordinates = parsedGeoJSON.geometry.coordinates.slice(0, parsedGeoJSON.geometry.coordinates.length / 2);

    geojson = JSON.stringify(parsedGeoJSON);
  }

  let zoom;
  if (props.poitype === 'w') {
    const coords = JSON.parse(geojson).geometry.coordinates;

    zoom = `${coords.join(',')},10`;
  } else {
    zoom = 'auto';
  }

  const width = Math.round(Dimensions.get('window').width);
  const height = Math.round(width*0.62);
  const margin = -8;
  const uri = [
    'https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/static/',
    `geojson(${geojson})/`,
    `${zoom}/`,
    `${width}x${height}@2x`,
    `?access_token=${REACT_APP_MAPBOX_TOKEN}`
  ].join('');

  const style = {
    width,
    height,
    marginLeft: margin,
    marginRight: margin,
    marginTop: 10
  };

  return (
    <Image source={{ uri }} style={style} />
  );
};
