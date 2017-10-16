import React from 'react';
import ReactDOM from 'react-dom';
import ListItem from '../ListItem';
import features from './data/features';

it('renders without crashing', () => {
  const tbody = document.createElement('tbody');
  ReactDOM.render( <ListItem {...features[0].properties} coords={features[0].geometry.coordinates} currentLocation={[-111, 40]} />, tbody);
});
