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
          <p>{this.state.Description}</p>
          <p>{this.state.SurfaceType}</p>
          <Alert color='info' className='stats'>
            <span>Distance <br></br> {round(this.state[config.fieldnames.trails.LENGTH], 2)} miles</span>
            <span>Type <br></br> {this.state[config.fieldnames.trails.RouteType]}</span>
          </Alert>
        </div>
        <div className='detail-links padder'>
          <Link to={{
              pathname: `${this.props[config.fieldnames.ID]}/map`,
              state: { geojson: this.state.geojson }
            }}>View Full Map</Link>
          {url && (<a href={url}>Trail Details</a>)}
        </div>
        <StaticMap geojson={this.state.geojson} outAndBack={this.state[config.fieldnames.trails.RouteType] === config.outAndBack} />
      </div>
    );
  }
}

export default HikingDetails;
