import React, { Component } from 'react';
import { Button } from 'native-base';
import { withRouter } from 'react-router-native';


class DefaultText extends Component {
  onPress() {
    this.props.history.push(this.props.to);
  }
  render() {
    return (
      <Button {...this.props} onPress={this.onPress.bind(this)}>{this.props.children}</Button>
    );
  }
}

export default withRouter(DefaultText);
