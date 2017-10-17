import React from 'react';
import { Link } from 'react-router-dom';

import './css/ListItem.css';

export default function ListItem(props) {
  return (
    <tr>
      <td><Link to={{
          pathname: `/feature/${props.OBJECTID}`,
          state: { listItemProperties: props }
        }}>{props.Name}</Link></td>
      <td className='align-right'>{props.miles} mi</td>
    </tr>
  );
};
