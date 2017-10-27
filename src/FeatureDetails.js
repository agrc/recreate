import React, { Component } from 'react';
import { Button } from 'reactstrap';
import ParksDetail from './ParksDetail';
import HikingDetail from './HikingDetail';
import BoatRampsDetail from './BoatRampsDetail';
import config from './config';
import get from 'lodash.get';

import './css/FeatureDetails.css';

class FeatureDetails extends Component {
  constructor(props) {
    super(props);

    let itemProps;
    if (get(props, 'location.state.listItemProperties')) {
      itemProps = props.location.state.listItemProperties
    } else {
      this.fetchItemProps();
    }

    this.state = { itemProps };
  }

  async fetchItemProps() {
    console.log('fetching item props');
    const response = await fetch(config.urls.POI_DATA);
    if (response.ok) {
      const poiJson = await response.json();

      const id = this.props.match.params.id;
      const feature = poiJson.features.find(f => f.properties[config.fieldnames.ID] === id);

      if (feature) {
        this.setState({ itemProps: feature.properties });
      } else {
        // TODO: handle feature not found
        console.error(`${id} not found!`);
      }
    }
  }

  render() {
    let Details;
    if (this.state.itemProps) {
      switch (config.poi_type_lookup[this.state.itemProps.Type]) {
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
          throw new Error(`Unhandled POI type: ${this.state.itemProps.Type}!`);
      }
    }

    return (
      <div className='feature-details scroller'>
        {Details ? (
          <div>
            <div className='header padder'>
              <Button color='link' onClick={() => this.props.history.goBack()}>Back</Button>
              <span>Distance From You: {this.state.itemProps.miles} miles</span>
            </div>
            <div className='padder'>
              <h4>{config.poi_type_lookup[this.state.itemProps.Type]}</h4>
              <h5>{this.state.itemProps[config.fieldnames.Name]}</h5>
            </div>
            <Details { ...this.state.itemProps } />
          </div>
        ) : <span>loading data...</span>}
      </div>
    );
  }
}

export default FeatureDetails;
