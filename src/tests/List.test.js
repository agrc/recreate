import React from 'react';
import ReactDOM from 'react-dom';
import List from '../List';

const features = [{
  "geometry": {
    "type": "Point",
    "coordinates": [-111.88651442527771, 40.78073640892393]
  },
  "type": "Feature",
  "properties": {
    "OBJECTID": 18605,
    "Type": "l",
    "Name": "Park",
    "ID": "18605"
  },
  "id": 18605,
  "layer": {
    "id": "points-of-interest",
    "type": "circle",
    "source": "points-of-interest",
    "paint": {
      "circle-radius": 8,
      "circle-color": {
        "property": "Type",
        "type": "categorical",
        "stops": [
          ["h", "#e7eb3f"],
          ["l", "#3feb9e"],
          ["w", "#3f6feb"]
        ]
      },
      "circle-stroke-width": 1
    }
  }
}, {
  "geometry": {
    "type": "Point",
    "coordinates": [-111.90111637115479, 40.76170720013229]
  },
  "type": "Feature",
  "properties": {
    "OBJECTID": 18563,
    "Type": "l",
    "Name": "PIONEER PARK",
    "ID": "18563"
  },
  "id": 18563,
  "layer": {
    "id": "points-of-interest",
    "type": "circle",
    "source": "points-of-interest",
    "paint": {
      "circle-radius": 8,
      "circle-color": {
        "property": "Type",
        "type": "categorical",
        "stops": [
          ["h", "#e7eb3f"],
          ["l", "#3feb9e"],
          ["w", "#3f6feb"]
        ]
      },
      "circle-stroke-width": 1
    }
  }
}]
it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render( <List features = { features } />, div);
});
