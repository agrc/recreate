import React from 'react';
import { Link } from 'react-router-native';
import config from './config';


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
