import React, { Component } from 'react';
import { Button } from 'reactstrap';


class ChangeLog extends Component {
  render() {
    return (
      <div className='changelog'>
        <Button size='sm' color='primary' onClick={() => this.props.history.goBack()}>Back</Button>
        <h5>Change Log</h5>
        <strong>v0.5.0</strong>
        <ul>
          <li>Add change log ;) (<a href='https://github.com/agrc/recreate-web/issues/18'>#18</a>)</li>
          <li>Correctly represent the back of an out-and-back trail in the elevation profile and distance (<a href='https://github.com/agrc/recreate-web/issues/28'>#28</a>)</li>
        </ul>
      </div>
    );
  }
}

export default ChangeLog;
