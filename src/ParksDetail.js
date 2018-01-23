import React from 'react';
import DetailsBase from './DetailsBase';
import StaticMap from './StaticMap';
import config from './config';


class ParksDetails extends DetailsBase {
  constructor(props) {
    super(props);

    this.state = {}
  }

  render() {
    return (
      <div className='detail'>
        <div className='padder'>
          <p>{this.state[config.fieldnames.parks.TYPE]}</p>
        </div>
        <StaticMap geojson={this.state.geojson} />
      </div>
    );
  }
};

export default ParksDetails;
