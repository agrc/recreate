import React, { Component } from 'react';
import { Button, Text, View } from 'native-base';
import config from './config';
import { StyleSheet } from 'react-native';
import { WhiteText } from './AppText';
import Collapsible from 'react-native-collapsible';


class CustomizeBtn extends Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };
  }

  onClick() {
    this.setState({ isOpen: !this.state.isOpen });
  }

  render() {
    return (
      <View style={styles.container}>
        <Collapsible collapsed={!this.state.isOpen} style={styles.collapsible}>
          {
            Object.keys(config.poi_type_lookup).map(key => {
              return (<ToggleButton key={key} id={key}
                name={config.poi_type_lookup[key]}
                filter={this.props.filter}
                onCustomize={this.props.onCustomize}/>);
            })
          }
          <Button warning rounded style={styles.toggleButton} onPress={this.props.onClearCustomize}>
            <Text>Clear</Text>
          </Button>
        </Collapsible>
        <Button full primary onPress={this.onClick.bind(this)}>
          <WhiteText style={styles.buttonText}>
            { this.state.isOpen ? 'Hide' : 'Customize Experience' }
          </WhiteText>
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  collapsible: {
    backgroundColor: config.colors.transparentWhite,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 5
  },
  buttonText: {
    fontSize: 20
  },
  toggleButton: {
    margin: 5,
  },
  whiteBackground: {
    backgroundColor: config.colors.white
  }
});


class ToggleButton extends Component {
  render() {
    const anyOn = Object.keys(this.props.filter).some(key => this.props.filter[key]);
    const on = (!anyOn) ? false : this.props.filter[this.props.id];
    return (
      <Button success rounded
        style={ (on) ? styles.toggleButton : [styles.toggleButton, styles.whiteBackground] }
        bordered={!on}
        onPress={this.props.onCustomize.bind(this, this.props.id)}>
        <Text>{this.props.name}</Text>
      </Button>
    );
  }
}

export default CustomizeBtn;
