import React from 'react';
import ReactDOM from 'react-dom';
import MapView from '../MapView';
import { MemoryRouter } from 'react-router';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const match = { params: { extent: '-111,40' } } ;

  ReactDOM.render(
    <MemoryRouter initialEntries={['/map']} initialIndex={0}>
      <MapView match={match}/>
    </MemoryRouter>
  , div);
});
