import React from 'react';

import './css/ListItem.css';

export default function ListItem(props) {
  return (
    <tr>
      <td>{props.Name}</td>
      <td className='align-right'>{props.miles} mi</td>
    </tr>
  );
};
