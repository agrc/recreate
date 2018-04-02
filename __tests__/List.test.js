import React from 'react';
import 'react-native';
import renderer from 'react-test-renderer';
import List from '../List';
import features from './data/features';
import { MemoryRouter } from 'react-router';


it('renders without crashing', () => {
  renderer.create(<MemoryRouter><List features={features} currentLocation={[-111, 40]} /></MemoryRouter>);
});

it('groups features according to type', () => {
  const list = new List({features: features, currentLocation: [-111, 40]});
  const grouped = list.groupFeatures(features);

  expect(grouped.w.length).toBe(1);
  expect(grouped.l.length).toBe(2);
  expect(grouped.h.length).toBe(3);
});
