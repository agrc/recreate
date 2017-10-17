import React from 'react';
import DetailsBase from './DetailsBase';


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
        <p>{this.state.Water_body}</p>
        <p>Allowed Vessels: {this.state.Vessels}</p>
      </div>
    );
  }
}

export default BoatRampsDetail;
