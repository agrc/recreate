import React from 'react';
import { Button } from 'reactstrap';
import ParksDetail from './ParksDetail';
import HikingDetail from './HikingDetail';
import BoatRampsDetail from './BoatRampsDetail';
import config from './config';

import './css/FeatureDetails.css';

export default function FeatureDetails(props) {
  const itemProps = props.location.state.listItemProperties;
  let Details;
  switch (config.poi_type_lookup[itemProps.Type]) {
    case config.poi_type_lookup.l:
      Details = ParksDetail;
      break;
    case config.poi_type_lookup.h:
      Details = HikingDetail;
      break;
    case config.poi_type_lookup.w:
      Details = BoatRampsDetail;
      break;
    default:
      throw new Error(`Unhandled POI type: ${itemProps.Type}!`);
  }
  return (
    <div className='feature-details scroller'>
      <div className='header padder'>
        <Button color='link' onClick={() => props.history.goBack()}>Back to List</Button>
        <span>Distance From You: {itemProps.miles} miles</span>
      </div>
      <div className='padder'>
        <h4>{config.poi_type_lookup[itemProps.Type]}</h4>
        <h5>{itemProps.Name}</h5>
      </div>
      <Details { ...itemProps } />
    </div>
  );
};
