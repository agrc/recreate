import React from 'react';
import ReactDOM from 'react-dom';
import ListItem from '../ListItem';
import features from './data/features';
import { MemoryRouter } from 'react-router';


it('renders without crashing', () => {
  const tbody = document.createElement('tbody');
  ReactDOM.render(
    <MemoryRouter>
      <ListItem {...features[0].properties} coords={features[0].geometry.coordinates} />
    </MemoryRouter>, tbody);
});
