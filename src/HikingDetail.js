import React from 'react';
import DetailsBase from './DetailsBase';
import { Alert } from 'reactstrap';
import config from './config';
import round from 'lodash.round';
import StaticMap from './StaticMap';


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
      <div className='detail'>
        <div className='padder'>
          <p>{this.state.Description}</p>
          <p>{this.state.SurfaceType}</p>
          <Alert color='info'>
            <span>Total Distance {round(this.state.SHAPE__Length/config.metersPerMile, 2)} miles</span>
          </Alert>
        </div>
        <StaticMap geojson={this.state.geojson} />
      </div>
    );
  }
}

export default HikingDetails;
