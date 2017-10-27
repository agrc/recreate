import React from 'react';
import { Link } from 'react-router-dom';
import config from './config';

import './css/ListItem.css';

export default function ListItem(props) {
  return (
    <tr>
      <td><Link to={{
          pathname: `/feature/${props[config.fieldnames.ID]}`,
          state: { ...props }
        }}>{props[config.fieldnames.Name]}</Link></td>
      <td className='align-right'>{props.miles} mi</td>
    </tr>
  );
};
