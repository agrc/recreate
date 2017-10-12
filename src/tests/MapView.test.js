import React from 'react';
import ReactDOM from 'react-dom';
import MapView from '../MapView';
import { MemoryRouter } from 'react-router';
import geolocate from 'mock-geolocation';


beforeAll(() => {
  geolocate.use();
  geolocate.send({lng: -111, lat: 49});
});
afterAll(() => {
  geolocate.restore();
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  const match = { params: { extent: '-111,40' } } ;

  ReactDOM.render(
    <MemoryRouter initialEntries={['/map']} initialIndex={0}>
      <MapView match={match}/>
    </MemoryRouter>
  , div);
});
