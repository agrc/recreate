import React from 'react';
import DetailsBase from './DetailsBase';
import StaticMap from './StaticMap';


class BoatRampsDetail extends DetailsBase {
  constructor(props) {
    super(props);

    this.state = {
      Water_body: '',
      Vessels: ''
    };
  }

  render() {
    return (
      <div className='detail'>
        <div className='padder'>
          <p>{this.state.Water_body}</p>
          <p>Allowed Vessels: {this.state.Vessels}</p>
        </div>
        <StaticMap geojson={this.state.geojson} poitype='w'/>
      </div>
    );
  }
}

export default BoatRampsDetail;
