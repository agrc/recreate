import React, { Component } from 'react';
import { Button } from 'reactstrap';
import ParksDetail from './ParksDetail';
import HikingDetail from './HikingDetail';
import BoatRampsDetail from './BoatRampsDetail';
import config from './config';
import get from 'lodash.get';
import distance from '@turf/distance';


class FeatureDetails extends Component {
  constructor(props) {
    super(props);

    if (get(props, 'location.state')) {
      this.state = { ...props.location.state };
    } else {
      this.fetchItemProps();
    }
  }

  getCurrentLocation(itemCoords) {
    navigator.geolocation.getCurrentPosition(position => {
      const diviser = 10;
      const miles = Math.round(distance([position.coords.longitude, position.coords.latitude], itemCoords) * diviser)/diviser;
      this.setState({ miles });
    });
    // don't worry about errors because we'll just hide the distance text
  }

  async fetchItemProps() {
    console.log('fetching item props');
    const response = await fetch(config.urls.POI_DATA);
    if (response.ok) {
      const poiJson = await response.json();

      const id = this.props.match.params.id;
      const feature = poiJson.features.find(f => f.properties[config.fieldnames.ID] === id);

      if (feature) {
        this.setState({ ...feature.properties });
        this.getCurrentLocation(feature.geometry.coordinates);
      } else {
        // TODO: handle feature not found
        console.error(`${id} not found!`);
      }
    }
  }

  render() {
    let Details;
    if (this.state) {
      switch (config.poi_type_lookup[this.state.Type]) {
        case config.poi_type_lookup.p:
          Details = ParksDetail;
          break;
        case config.poi_type_lookup.h:
          Details = HikingDetail;
          break;
        case config.poi_type_lookup.w:
          Details = BoatRampsDetail;
          break;
        default:
          throw new Error(`Unhandled POI type: ${this.state.Type}!`);
      }
    }

    return (
      <div className='feature-details scroller'>
        {Details ? (
          <div>
            <div className='header padder'>
              <Button color='link' onClick={() => this.props.history.goBack()}>Back</Button>
              {this.state.miles &&
                <span className='distance'>Distance From You: {this.state.miles} miles</span>}
            </div>
            <div className='padder'>
              <h4>{config.poi_type_lookup[this.state.Type]}</h4>
              <h5>{this.state[config.fieldnames.Name]}</h5>
            </div>
            <Details { ...this.state } />
          </div>
        ) : <span>loading data...</span>}
      </div>
    );
  }
}

export default FeatureDetails;
