import React from 'react';
import ReactDOM from 'react-dom';
import FeatureDetails from '../FeatureDetails';
import featureQuery from './data/featureQuery.js';


it('renders without crashing', () => {
  fetch.mockResponse(JSON.stringify(featureQuery));
  const div = document.createElement('div');
  ReactDOM.render(<FeatureDetails location={{
    state: {
      listItemProperties: {
        Type: 'h',
        ID: '1'
      }
    }
  }}/>, div);
});
