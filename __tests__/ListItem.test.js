import React from 'react';
import 'react-native';
import renderer from 'react-test-renderer';
import ListItem from '../ListItem';
import features from './data/features';
import { MemoryRouter } from 'react-router';


it('renders without crashing', () => {
  renderer.create(
    <MemoryRouter>
      <ListItem {...features[0].properties} coords={features[0].geometry.coordinates} />
    </MemoryRouter>);
});
