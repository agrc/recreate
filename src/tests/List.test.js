import React from 'react';
import ReactDOM from 'react-dom';
import List from '../List';
import features from './data/features';
import { MemoryRouter } from 'react-router';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><List features={features} currentLocation={[-111, 40]} /></MemoryRouter>, div);
});

it('groups features according to type', () => {
  const list = new List({features: features, currentLocation: [-111, 40]});
  const grouped = list.groupFeatures(features);

  expect(grouped.w.length).toBe(1);
  expect(grouped.l.length).toBe(2);
  expect(grouped.h.length).toBe(3);
});
