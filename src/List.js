import React, { Component } from 'react';
import config from './config';

import './css/List.css';


class List extends Component {
  groupFeatures(features) {
    const grouped = {};

    features.forEach(f => {
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
      <div className='scroller'>
        <table className='list-table'>
          { Object.keys(grouped_features).map(group => {
              return (
                <tbody key={group}>
                  <tr>
                    <th colSpan='2'>{ config.poi_type_lookup[group] }</th>
                  </tr>
                  { grouped_features[group].map(f => {
                      return (
                        <tr key={f.id}>
                          <td>{f.properties.Name}</td>
                          <td>8 mi</td>
                        </tr>
                      );
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
