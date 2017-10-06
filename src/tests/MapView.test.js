import React from 'react';
import ReactDOM from 'react-dom';
import MapView from '../MapView';
import { MemoryRouter } from 'react-router';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><MapView /></MemoryRouter>, div);
});
