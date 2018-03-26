import React from 'react';
import { StyleSheet, Text } from 'react-native';


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
  }
});

export { WhiteText, HeadingText, NameText, SmallText };
