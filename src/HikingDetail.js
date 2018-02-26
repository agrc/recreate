import React from 'react';
import DetailsBase from './DetailsBase';
import { Alert } from 'reactstrap';
import config from './config';
import round from 'lodash.round';
import StaticMap from './StaticMap';
import { Link } from 'react-router-dom';


class HikingDetails extends DetailsBase {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const url = this.state[config.fieldnames.trails.URL];

    return (
      <div className='detail hiking'>
        <div className='padder'>
          <Alert color='info' className='stats'>
            Distance: {round(this.state[config.fieldnames.trails.LENGTH], 2)} miles
            <br></br>
            ({this.state[config.fieldnames.trails.RouteType]})
            <span className='pull-right'>Elevation Gain: {this.state[config.fieldnames.trails.ElevationGain]} feet</span>
            {
          }
          </Alert>
        </div>
        <div className='detail-links padder'>
          <Link to={{
              pathname: `${this.props[config.fieldnames.ID]}/map`,
              state: { geojson: this.state.geojson, profile: this.state[config.fieldnames.trails.ElevationProfile] }
            }}>View Full Map</Link>
          {url && (<a href={url}>Trail Details</a>)}
        </div>
        <StaticMap geojson={this.state.geojson} outAndBack={this.state[config.fieldnames.trails.RouteType] === config.outAndBack} />
      </div>
    );
  }
}

export default HikingDetails;
