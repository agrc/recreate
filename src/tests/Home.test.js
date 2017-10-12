import React from 'react';
import ReactDOM from 'react-dom';
import Home from '../Home';
import { MemoryRouter } from 'react-router';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><Home /></MemoryRouter>, div);
});

test('getMapboxCentroid formats extent properly', () => {
  const inputGeometry = {
    rings: [
     [
      [
       -110.22385568570527, // sw
       40.29114485051228
      ],
      [
       -110.223780697996,
       40.29769845499268
      ],
      [
       -110.21537816475254, // ne
       40.2976417742354
      ],
      [
       -110.21545396399797,
       40.29108818281103
      ],
      [
       -110.22385568570527,
       40.29114485051228
      ]
     ]
    ],
    "type": "polygon",
    "spatialReference": {
     "wkid": 4326
    }
  };

  expect(new Home().getMapboxCentroid(inputGeometry)).toEqual([-110.224, 40.2945])
});
