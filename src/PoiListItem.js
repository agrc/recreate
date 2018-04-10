import React, { Component } from 'react';
import config from './config';
import { Icon, Body, ListItem, Right, Text } from 'native-base';
import { StyleSheet } from 'react-native';
import { withRouter } from 'react-router-native';


class PoiListItem extends Component {
  onPress() {
    this.props.history.push({
      pathname: `/feature/${this.props[config.fieldnames.ID]}`,
      state: { ...this.props }
    });
  }

  render() {
    return (
      <ListItem style={styles.listItem} onPress={this.onPress.bind(this)}>
        <Body>
          <Text>{this.props[config.fieldnames.Name]}</Text>
        </Body>
        <Right style={styles.right}>
          <Text note style={styles.miles}>{this.props.miles} mi</Text>
          <Icon name='arrow-forward' />
        </Right>
      </ListItem>
    );
  }
}

const stylesInput = {
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
};
const styles = StyleSheet.create(stylesInput);

const exportClass = withRouter(PoiListItem);
export { exportClass as default, stylesInput }
