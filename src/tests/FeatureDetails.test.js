import React from 'react';
import ReactDOM from 'react-dom';
import FeatureDetails from '../FeatureDetails';
import featureQuery from './data/featureQuery.js';
import { MemoryRouter, Route } from 'react-router';


it('renders without crashing', () => {
  fetch.mockResponse(JSON.stringify(featureQuery));
  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><FeatureDetails location={{
    state: {
      listItemProperties: {
        Type: 'h',
        ID: '1'
      }
    }
  }}/></MemoryRouter>, div);
});

it('renders without location.state', () => {
  fetch.mockResponse(JSON.stringify(featureQuery));
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter location='/feature/1234'>
      <Route path='/feature/:id' component={FeatureDetails} />
    </MemoryRouter>, div);
});
