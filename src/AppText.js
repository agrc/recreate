import React from 'react';
import { Linking, StyleSheet, Text } from 'react-native';
import config from './config';


const WhiteText = function (props) {
  return (
    <Text style={[props.style, styles.whiteText]}>{props.children}</Text>
  );
};

const HeadingText = function (props) {
  return (
    <Text style={[props.style, styles.headingText]}>{props.children}</Text>
  );
};

const NameText = function (props) {
  return (
    <Text style={[props.style, styles.nameText]}>{props.children}</Text>
  );
};

const SmallText = function (props) {
  return (
    <Text style={[props.style, styles.smallText]}>{props.children}</Text>
  );
};

const LinkText = function (props) {
  return (
    <Text style={[props.style, styles.linkText]} onPress={() => Linking.openURL(props.href)}>{props.children}</Text>
  );
};

const BoldText = function (props) {
  return (
    <Text style={[props.style, styles.boldText]}>{props.children}</Text>
  );
};

const BulletText = function (props) {
  return (
    <Text style={props.style}>- {props.children}</Text>
  );
};

const styles = StyleSheet.create({
  whiteText: {
    color: 'white'
  },
  headingText: {
    fontSize: 30,
    fontWeight: 'bold'
  },
  nameText: {
    fontSize: 20
  },
  smallText: {
    fontSize: 14
  },
  linkText: {
    color: config.colors.blue
  },
  boldText: {
    fontWeight: 'bold'
  }
});

export { WhiteText, HeadingText, NameText, SmallText, LinkText, BoldText, BulletText };
