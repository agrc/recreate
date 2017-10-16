import React from 'react';
import ReactDOM from 'react-dom';
import List from '../List';
import features from './data/features';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render( <List features = { features } />, div);
});

it('groups features according to type', () => {
  const list = new List({features: features});
  const grouped = list.groupFeatures(features);

  expect(grouped.w.length).toBe(1);
  expect(grouped.l.length).toBe(9);
  expect(grouped.h.length).toBe(8);
});
