import React, { Component } from 'react';
import { Body, ListItem, Icon, Right, Text } from 'native-base';
import { Linking, StyleSheet } from 'react-native';
import { stylesInput } from './PoiListItem';


class YelpListItem extends Component {
  onPress() {
    Linking.openURL(this.props.url);
  }
  
  render() {
    return (
      <ListItem style={styles.listItem} onPress={this.onPress.bind(this)}>
        <Body>
          <Text>{this.props.name}</Text>
        </Body>    
        <Right style={styles.right}>
          <Text note style={styles.miles}>{this.props.miles} mi</Text>
          <Icon name='arrow-forward' />
        </Right>
      </ListItem>
    );
  }
}

const styles = StyleSheet.create(stylesInput);


export default YelpListItem
