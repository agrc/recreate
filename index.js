import React from 'react';
import { AppRegistry } from 'react-native';
import App from './src/App';
import { NativeRouter as Router, BackButton } from 'react-router-native';


const initialEntries = ['/feature/{46C93DBE-8C45-4CDA-AC74-0E78BAF91A25}'];  // FeatureDetails
// const initialEntries = undefined;  // home

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
