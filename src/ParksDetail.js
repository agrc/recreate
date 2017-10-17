import React from 'react';
import DetailsBase from './DetailsBase';
import StaticMap from './StaticMap';


class ParksDetails extends DetailsBase {
  constructor(props) {
    super(props);

    this.state = {
      TYPE: '',
      ACRES: ''
    }
  }

  render() {
    return (
      <div className='detail'>
        <div className='padder'>
          <p>{this.state.TYPE}</p>
          <p>Acres: {this.state.ACRES}</p>
        </div>
        <StaticMap geojson={this.state.geojson} />
      </div>
    );
  }
};

export default ParksDetails;
