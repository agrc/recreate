import React from 'react';
import { ListItem } from 'native-base';


export default function YelpListItem(props) {
  return (
    <ListItem>
      <a href={props.url}>{props.name}</a>
      {props.miles} mi
    </ListItem>
  );
}
