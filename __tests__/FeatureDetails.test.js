import React from 'react';
import 'react-native';
import renderer from 'react-test-renderer';
import FeatureDetails from '../FeatureDetails';
import featureQuery from './data/featureQuery.js';
import { MemoryRouter, Route } from 'react-router';


it('renders without crashing', () => {
  fetch.mockResponse(JSON.stringify(featureQuery));
  renderer.create(<MemoryRouter><FeatureDetails location={{
    state: {
      Type: 'h',
      ID: '1'
    }
  }}/></MemoryRouter>);
});

it('renders without location.state', () => {
  fetch.mockResponse(JSON.stringify(featureQuery));
  renderer.create(
    <MemoryRouter location='/feature/1234'>
      <Route path='/feature/:id' component={FeatureDetails} />
    </MemoryRouter>);
});
