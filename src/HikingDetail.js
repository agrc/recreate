import React from 'react';
import DetailsBase from './DetailsBase';


class HikingDetails extends DetailsBase {
  constructor(props) {
    super(props);

    this.state = {
      Description: '',
      SurfaceType: ''
    };
  }

  render() {
    return (
      <div className='detail'>
        <p>{this.state.Description}</p>
        <p>{this.state.SurfaceType}</p>
      </div>
    );
  }
}

export default HikingDetails;
