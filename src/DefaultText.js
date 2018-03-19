import React, { Component } from 'react';
import { StyleSheet, Text } from 'react-native';


export default class DefaultText extends Component {
  render() {
    return (
      <Text style={[this.props.style, styles.defaultText]}>{this.props.children}</Text>
    );
  }
}

const styles = StyleSheet.create({
  defaultText: {
    color: 'white'
  }
});
