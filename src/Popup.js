import React from 'react';
import config from './config';
import { Link } from 'react-router-dom';
import distance from '@turf/distance';


export default function Popup(props) {
  const properties = props.feature.properties;
  const diviser = 10;
  const miles = Math.round(distance(props.currentLocation, props.feature.geometry.coordinates, 'miles') * diviser)/diviser;

  return (
    <div>
      <h6 style={{marginTop: '10px'}}>{properties[config.fieldnames.Name]}</h6>
      <Link style={{float: 'right'}} to={{
        pathname: `/feature/${properties[config.fieldnames.ID]}`,
        state: { ...properties, miles }
      }}>details</Link>
    </div>
  );
}
