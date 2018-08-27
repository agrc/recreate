import React from 'react';
import { HeadingText, LinkText, BoldText, BulletText } from './AppText';
import { View, StyleSheet } from 'react-native';


export default function ChangeLog() {
  return (
    <View style={styles.padded}>
      <HeadingText>Change Log</HeadingText>
      <View style={styles.paragraph}>
        <BoldText>v1.0.0</BoldText>
        <BulletText>Finalize fixes for Android and deploy to Google Beta Test.</BulletText>
        <BulletText>Make app work for iPads.</BulletText>
        <BulletText>Implement offline functionality. You can now download hike maps one at a time and the main map will work offline at courser scale levels (<LinkText href='https://github.com/agrc/recreate/issues/43'>#43</LinkText>).</BulletText>
      </View>

      <View style={styles.paragraph}>
        <BoldText>v0.9.0</BoldText>
        <BulletText>Fix base maps in Android (<LinkText href='https://github.com/agrc/recreate/issues/54'>#54</LinkText>).</BulletText>
        <BulletText>Fix city/place search layout in Android (<LinkText href='https://github.com/agrc/recreate/issues/53'>#53</LinkText>).</BulletText>
        <BulletText>Other fixes to enable building the app for Android.</BulletText>
      </View>

      <View style={styles.paragraph}>
        <BoldText>v0.8.0</BoldText>
        <BulletText>Fixed bug preventing the list from being populated when the Yelp data is not visible (<LinkText href='https://github.com/agrc/recreate/issues/36'>#36</LinkText>).</BulletText>
        <BulletText>Added external link icon to trail Details link.</BulletText>
        <BulletText>Switched to preliminary State of Utah vector base maps (<LinkText href='https://github.com/agrc/recreate/issues/33'>#33</LinkText>).</BulletText>
        <BulletText>Add custom fonts to match mockups including banner text on home view (<LinkText href='https://github.com/agrc/recreate/issues/17'>#17</LinkText>).</BulletText>
        <BulletText>Add GPS location to details map (<LinkText href='https://github.com/agrc/recreate/issues/49'>#49</LinkText>).</BulletText>
        <BulletText>Implement point clustering (<LinkText href='https://github.com/agrc/recreate/issues/51'>#51</LinkText>).</BulletText>
        <BulletText>Fix bug preventing clustered points from showing up in the list (<LinkText href='https://github.com/agrc/recreate/issues/52'>#52</LinkText>).</BulletText>
      </View>

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
