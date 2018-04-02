import React from 'react';
import 'react-native';
import renderer from 'react-test-renderer';
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
  const match = { params: { extent: '-111,40' } } ;

  renderer.create(
    <MemoryRouter initialEntries={['/map']} initialIndex={0}>
      <MapView match={match}/>
    </MemoryRouter>
  );
});
