import React from 'react';
import ReactDOM from 'react-dom';
import Popup from '../Popup';
import { MemoryRouter } from 'react-router';


it('renders without crashing', () => {
  const div = document.createElement('div');
  const feature = {
    geometry: {
      coordinates: [-111, 40]
    },
    properties: {
      Name: 'test'
    }
  }
  ReactDOM.render(<MemoryRouter><Popup feature={feature} currentLocation={[-112, 41]}/></MemoryRouter>, div);
});
