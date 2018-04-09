import React, { Component } from 'react';
import { Button, Icon, View } from 'native-base';
import { Image, Linking, TouchableHighlight, StyleSheet } from 'react-native';
import { BoldText } from './AppText';
import config from './config';

import logo from './images/Yelp_trademark_RGB_outline.png';


const ratingsFolder = './images/yelp-ratings/';
const starURLs = {
  '0': require(`${ratingsFolder}small_0.png`),
  '1': require(`${ratingsFolder}small_1.png`),
  '1.5': require(`${ratingsFolder}small_1_half.png`),
  '2': require(`${ratingsFolder}small_2.png`),
  '2.5': require(`${ratingsFolder}small_2_half.png`),
  '3': require(`${ratingsFolder}small_3.png`),
  '3.5': require(`${ratingsFolder}small_3_half.png`),
  '4': require(`${ratingsFolder}small_4.png`),
  '4.5': require(`${ratingsFolder}small_4_half.png`),
  '5': require(`${ratingsFolder}small_5.png`)
};

export default class YelpPopup extends Component {
  goToYelp() {
    console.log('goToYelp');
    
    Linking.openURL(this.props.url);
  }
  
  render() {
    const goToYelp = this.goToYelp.bind(this);
    
    return (
      <View style={styles.container}>
        <Button transparent style={styles.closeButton} onPress={this.props.onClose}>
          <Icon name='close' />
        </Button>
        { this.props.image_url && (
          <TouchableHighlight onPress={goToYelp} style={styles.image} activeOpacity={0.5}>
            <Image source={{ uri: this.props.image_url }} style={styles.image} />
          </TouchableHighlight>
        ) }
        <View style={styles.details} onPress={goToYelp}>
          <BoldText style={styles.nameText}>{this.props.name}</BoldText>
          { this.props.rating && (<Image source={starURLs[this.props.rating]} />) }
          <TouchableHighlight onPress={goToYelp} style={styles.logo} underlayColor={config.colors.transparentWhite}>
            <Image source={logo} />
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const popupHeight = 110;
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: config.colors.transparentWhite,
    flex: 1,
    flexDirection: 'row',
    height: popupHeight
  },
  image: {
    width: popupHeight,
    height: popupHeight
  },
  details: {
    padding: 5,
    flex: 1
  },
  nameText: {
    fontSize: 22,
    paddingRight: 20
  },
  logo: {
    position: 'absolute',
    bottom: 5,
    right: 5
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0
  }
});
