import React, { Component } from 'react';

import { Container, Header, Body, StyleProvider } from 'native-base';
import getTheme from './native-base-theme/components';
import platform from './native-base-theme/variables/platform';
import DefaultText from './DefaultText';
import { NativeRouter as Router, Route, Link, Switch } from 'react-router-native';
import Home from './Home';
import MapView from './MapView';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import { REACT_APP_MAPBOX_TOKEN } from 'react-native-dotenv';

// import FeatureDetails from './FeatureDetails';
// import DetailMap from './DetailMap';
// import ChangeLog from './ChangeLog';


MapboxGL.setAccessToken(REACT_APP_MAPBOX_TOKEN);
export default class App extends Component {
  render() {
    return (
      <Router basename='/' >
        <StyleProvider style={getTheme(platform)}>
          <Container>
            <Header>
              <Body>
                <Link to='/'><DefaultText>Recreate Utah</DefaultText></Link>
              </Body>
            </Header>
            <Switch>
              <Route exact={true} path='/' component={Home} />
              <Route path='/map/:location?/:list?' component={MapView} />
              {/*
              <Route exact={true} path='/feature/:id' component={FeatureDetails} />
              <Route path='/feature/:id/map' component={DetailMap} />
              <Route path='/changelog' component={ChangeLog} />
              */}
            </Switch>
          </Container>
        </StyleProvider>
      </Router>
    );
  }
}
