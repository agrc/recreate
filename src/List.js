import React from 'react';

import './css/List.css';


export default function List(props) {
  return (
    <div className='scroller'>
      <table className='list-table'>
        <tbody>
          <tr>
            <th colSpan='2'>Hiking</th>
          </tr>
            { props.features.map((f) => {
                return (
                  <tr key={f.id}>
                    <td>{f.properties.Name}</td>
                    <td>8 mi</td>
                  </tr>
                );
              })
            }
        </tbody>
      </table>
    </div>
  );
}
