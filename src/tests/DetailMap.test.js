import React from 'react';
import ReactDOM from 'react-dom';
import DetailMap, { getResampleDistance } from '../DetailMap';
import { MemoryRouter } from 'react-router';
import lineQuery from './data/lineQuery';
import elevationResponse from './data/elevationResponse';


it('renders without crashing', () => {
  fetch.mockResponse(JSON.stringify(elevationResponse));
  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><DetailMap
    location={{
      state: {
        geojson: JSON.stringify(lineQuery.features[0])
      }
    }}
  /></MemoryRouter>, div);
});

it('getResampleDistance doesn\'t return a number below 10', () => {
  expect(getResampleDistance(1000)).toBe(20);
  expect(getResampleDistance(50)).toBe(10);
})
