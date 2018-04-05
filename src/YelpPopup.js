import React from 'react';
import { Button, Icon, View } from 'native-base';
import { Image, StyleSheet } from 'react-native';
import { BoldText, LinkText } from './AppText';
import config from './config';

import logo from './images/Yelp_trademark_RGB_outline.png';


export default function YelpPopup(props) {
  return (
    <View style={styles.container}>
      { props.image_url && (<Image source={{ uri: props.image_url }} style={styles.image} />) }
      <View style={styles.details}>
        <BoldText style={styles.nameText}>{props.name}</BoldText>
        <Button transparent style={styles.closeButton} onPress={props.onClose}>
          <Icon name='close' />
        </Button>
        <LinkText href={props.url}>
          <Image source={logo} />
        </LinkText>
      </View>
    </View>
  );
}

const popupHeight = 100;
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
    width: popupHeight
  },
  details: {
    padding: 5,
    flex: 1
  },
  nameText: {
    fontSize: 22
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0
  }
});
