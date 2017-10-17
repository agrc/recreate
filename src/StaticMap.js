import React from 'react';

import './css/StaticMap.css';


export default function StaticMap(props) {
  const width = document.body.clientWidth;
  const staticMapUrl = [
    'https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/static/',
    `geojson(${props.geojson})/`,
    'auto/',
    `${width}x${Math.round(width*0.62)}@2x`,
    `?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`
  ].join('');

  return (
    <img className='static-map' src={staticMapUrl} alt='detail map'></img>
  );
};
