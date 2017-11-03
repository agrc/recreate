import React, { Component } from 'react';
import config from './config';
import ListItem from './ListItem';
import YelpListItem from './YelpListItem';
import distance from '@turf/distance';

import './css/List.css';


class List extends Component {
  groupFeatures(features) {
    const grouped = {};

    features.forEach(f => {
      const diviser = 10;
      f.properties.miles = Math.round(distance(this.props.currentLocation, f.geometry.coordinates, 'miles') * diviser)/diviser;

      const type = f.properties.Type;
      if (!grouped[type]) {
        grouped[type] = [f];
      } else {
        grouped[type].push(f);
      }
    });

    return grouped;
  }

  render() {
    const grouped_features = this.groupFeatures(this.props.features);

    return (
      <div className='list scroller'>
        <table className='list-table'>
          { Object.keys(grouped_features).map(group => {
              return (
                <tbody key={group}>
                  <tr>
                    <th colSpan='2'>{ config.poi_type_lookup[group] }</th>
                  </tr>
                  { grouped_features[group]
                      .sort((a, b) => a.properties.miles - b.properties.miles)
                      .map(f => {
                        return (f.properties.Type !== 'y') ?
                          <ListItem {...f.properties} coords={f.geometry.coordinates} key={f.id} /> :
                          <YelpListItem {...f.properties} key={f.properties.id} />
                      })
                  }
                </tbody>
              );
            })
          }
        </table>
      </div>
    );
  }
}

export default List;
