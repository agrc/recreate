import React from 'react';
import { AppRegistry } from 'react-native';
import App from './src/App';
import { NativeRouter as Router, BackButton } from 'react-router-native';


// const initialEntries = ['/feature/{46C93DBE-8C45-4CDA-AC74-0E78BAF91A25}'];  // FeatureDetails - Hiking
// const initialEntries = ['/feature/{1A892CE3-0D34-408B-BB2B-B926D02DC799}'];  // FeatureDetails - Park
// const initialEntries = ['/feature/{9E41D0F2-E5B5-4C99-ABEF-51442177E035}'];  // FeatureDetails - Boat Ramp
// const initialEntries = ['/map/-111.82,40.37,10'];  // map

const initialEntries = undefined;  // home

const RouterWrapper = function (props) {
  return (
    <Router basename='/' initialEntries={initialEntries}>
      <BackButton>
        <App />
      </BackButton>
    </Router>
  );
};

AppRegistry.registerComponent('RecreateNative', () => RouterWrapper);
