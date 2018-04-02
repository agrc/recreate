import React from 'react';
import { AppRegistry } from 'react-native';
import App from './src/App';
import { MemoryRouter as Router, BackButton } from 'react-router-native';


let initialEntries;
if (__DEV__) {
  // initialEntries = ['/feature/{B3E8AA92-20A4-44D9-9E59-400753EF506B}'];  // FeatureDetails - Hiking
  // initialEntries = ['/feature/{1A892CE3-0D34-408B-BB2B-B926D02DC799}'];  // FeatureDetails - Park
  // initialEntries = ['/feature/{9E41D0F2-E5B5-4C99-ABEF-51442177E035}'];  // FeatureDetails - Boat Ramp
  // initialEntries = ['/feature/{46C93DBE-8C45-4CDA-AC74-0E78BAF91A25}/map'];  // DetailMap
  // initialEntries = ['/map/-111.82,40.37,10'];  // map
  initialEntries = ['/changelog'];  // ChangeLog
}


const RouterWrapper = function () {
  return (
    <Router basename='/' initialEntries={initialEntries}>
      <BackButton>
        <App />
      </BackButton>
    </Router>
  );
};

AppRegistry.registerComponent('RecreateNative', () => RouterWrapper);
