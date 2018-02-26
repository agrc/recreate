import React from 'react';


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

  const width = document.body.clientWidth;
  const staticMapUrl = [
    'https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/static/',
    `geojson(${geojson})/`,
    `${zoom}/`,
    `${width}x${Math.round(width*0.62)}@2x`,
    `?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`
  ].join('');

  return (
    <img className='static-map' src={staticMapUrl} alt='detail map'></img>
  );
};
