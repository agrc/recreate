import React from 'react';
import { HeadingText, LinkText, BoldText, BulletText } from './AppText';
import { View, StyleSheet } from 'react-native';


export default function ChangeLog() {
  return (
    <View style={styles.padded}>
      <HeadingText>Change Log</HeadingText>

      <View style={styles.paragraph}>
        <BoldText>v0.7.0</BoldText>
        <BulletText>Convert to native application distributable via app stores (still some issues with Android OS) (<LinkText href='https://github.com/agrc/recreate/issues/44'>#44</LinkText>).</BulletText>
        <BulletText>Convert home page city/place search to autocomplete dropdown (<LinkText href='https://github.com/agrc/recreate/issues/31'>#31</LinkText>).</BulletText>
      </View>

      <View style={styles.paragraph}>
        <BoldText>v0.6.0</BoldText>
        <BulletText>Fix styling of list table (<LinkText href='https://github.com/agrc/recreate-web/issues/30'>#30</LinkText>)</BulletText>
        <BulletText>Styling improvements for home page including switching text in GOED logo from black to white.</BulletText>
        <BulletText>Remove Mapzen elevation profile service in favor of precached values (<LinkText href='https://github.com/agrc/recreate-web/issues/25'>#25</LinkText>)</BulletText>
        <BulletText>Better hiking details layout and add elevation gain (<LinkText href='https://github.com/agrc/recreate-web/issues/2'>#2</LinkText>)</BulletText>
      </View>

      <View style={styles.paragraph}>
        <BoldText>v0.5.0</BoldText>
        <BulletText>Add change log ;) (<LinkText href='https://github.com/agrc/recreate-web/issues/18'>#18</LinkText>)</BulletText>
        <BulletText>Correctly represent the back of an out-and-back trail in the elevation profile and distance (<LinkText href='https://github.com/agrc/recreate-web/issues/28'>#28</LinkText>)</BulletText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  padded: {
    padding: 15
  },
  paragraph: {
    paddingBottom: 15
  }
});
