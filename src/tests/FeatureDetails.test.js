import React from 'react';
import ReactDOM from 'react-dom';
import FeatureDetails from '../FeatureDetails';
import featureQuery from './data/featureQuery.js';
import { MemoryRouter } from 'react-router';


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
