import React from 'react';


export default function YelpListItem(props) {
  return (
    <tr>
      <td><a href={props.url} target='_blank'>{props.name}</a></td>
      <td className='align-right'>{props.miles} mi</td>
    </tr>
  );
}
