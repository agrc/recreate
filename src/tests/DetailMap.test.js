import React from 'react';
import ReactDOM from 'react-dom';
import DetailMap, { getResampleDistance } from '../DetailMap';
import { MemoryRouter } from 'react-router';
import lineQuery from './data/lineQuery';
import elevationResponse from './data/elevationResponse';


it('renders without crashing', () => {
  fetch.mockResponse(JSON.stringify(elevationResponse));
  const div = document.createElement('div');
  div.style.width = '100px;';
  div.style.height = '100px;';
  ReactDOM.render(<MemoryRouter><DetailMap
    containerWidth={10}
    location={{
      state: {
        geojson: JSON.stringify(lineQuery.features[0]),
        profile: '100,200,0,1,2,3'
      }
    }}
  /></MemoryRouter>, div);
});
