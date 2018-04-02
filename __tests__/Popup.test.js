import React from 'react';
import 'react-native';
import renderer from 'react-test-renderer';
import Popup from '../Popup';
import { MemoryRouter } from 'react-router';


it('renders without crashing', () => {
  const feature = {
    geometry: {
      coordinates: [-111, 40]
    },
    properties: {
      Name: 'test'
    }
  }
  renderer.create(<MemoryRouter><Popup feature={feature} currentLocation={[-112, 41]}/></MemoryRouter>);
});
