import React from 'react';
import DetailsBase from './DetailsBase';
import { Alert } from 'reactstrap';
import config from './config';
import round from 'lodash.round';
import StaticMap from './StaticMap';
import { Link } from 'react-router-dom';

import './css/HikingDetail.css';


class HikingDetails extends DetailsBase {
  constructor(props) {
    super(props);

    this.state = {
      Description: '',
      SurfaceType: '',
      SHAPE__Length: 0
    };
  }

  render() {
    return (
      <div className='detail hiking'>
        <div className='padder'>
          <p>{this.state.Description}</p>
          <p>{this.state.SurfaceType}</p>
          <Alert color='info' className='stats'>
            <span>Distance {round(this.state.SHAPE__Length/config.metersPerMile, 2)} miles</span>
            <span>Elevation Gain: 200 ft</span>
          </Alert>
        </div>
        <div className='detail-links padder'>
          <a href='https://www.visitutah.com/places-to-go/most-visited-parks/zion/outdoor-experiences/moderate/chinle-trail/'>Trail Details</a>
          <Link to={{
              pathname: `${this.props[config.fieldnames.ID]}/map`,
              state: { geojson: this.state.geojson }
            }}>View Full Map</Link>
        </div>
        <StaticMap geojson={this.state.geojson} />
      </div>
    );
  }
}

export default HikingDetails;
