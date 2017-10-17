import React from 'react';
import DetailsBase from './DetailsBase';


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
        <p>{this.state.TYPE}</p>
        <p>Acres: {this.state.ACRES}</p>
      </div>
    );
  }
};

export default ParksDetails;
