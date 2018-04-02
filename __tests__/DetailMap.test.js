import React from 'react';
import 'react-native';
import renderer from 'react-test-renderer';
import DetailMap from '../DetailMap';
import { MemoryRouter } from 'react-router';
import lineQuery from './data/lineQuery';
import elevationResponse from './data/elevationResponse';


it('renders without crashing', () => {
  fetch.mockResponse(JSON.stringify(elevationResponse));
  renderer.create(<MemoryRouter><DetailMap
    containerWidth={10}
    location={{
      state: {
        geojson: JSON.stringify(lineQuery.features[0]),
        profile: '100,200,0,1,2,3'
      }
    }}
  /></MemoryRouter>);
});
