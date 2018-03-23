import React from 'react';
import { Link } from 'react-router-native';
import config from './config';
import { Icon, Body, ListItem, Right, Text } from 'native-base';
import { StyleSheet } from 'react-native';


export default function PoiListItem(props) {
  return (
    <ListItem style={styles.listItem}>
      <Body>
        <Link to={{
            pathname: `/feature/${props[config.fieldnames.ID]}`,
            state: { ...props }
          }}><Text>{props[config.fieldnames.Name]}</Text></Link>
      </Body>
      <Right style={styles.right}>
        <Text note style={styles.miles}>{props.miles} mi</Text>
        <Icon name='arrow-forward' />
      </Right>
    </ListItem>
  );
};

const styles = StyleSheet.create({
  listItem: {
    paddingRight: 0
  },
  right: {
    flexDirection: 'row',
    marginLeft: 3
  },
  miles: {
    marginRight: 8,
    alignSelf: 'center'
  }
});
