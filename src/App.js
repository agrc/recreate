import React, { Component } from 'react';

import { Container, Header, Body, Left, Button, StyleProvider, Icon, Right } from 'native-base';
import getTheme from './native-base-theme/components';
import platform from './native-base-theme/variables/platform';
import { WhiteText } from './AppText';
import { Route, Link, Switch, withRouter } from 'react-router-native';
import Home from './Home';
import MapView from './MapView';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import { REACT_APP_MAPBOX_TOKEN } from 'react-native-dotenv';

import FeatureDetails from './FeatureDetails';
import DetailMap from './DetailMap';
import ChangeLog from './ChangeLog';


MapboxGL.setAccessToken(REACT_APP_MAPBOX_TOKEN);
class App extends Component {
  goBack() {
    this.props.history.goBack();
  }

  render() {
    return (
      <StyleProvider style={getTheme(platform)}>
        <Container>
          <Header>
            <Left>
              { this.props.history.index > 0 &&
                <Button transparent onPress={this.goBack.bind(this)}>
                  <Icon name='arrow-back' style={{color: 'white'}} />
                </Button>
              }
            </Left>
            <Body>
              <Link to='/'><WhiteText>Recreate Utah</WhiteText></Link>
            </Body>
            <Right />
          </Header>
          <Switch>
            <Route exact={true} path='/' component={Home} />
            <Route path='/map/:location?/:list?' component={MapView} />
            <Route exact={true} path='/feature/:id' component={FeatureDetails} />
            <Route path='/feature/:id/map' component={DetailMap} />
            <Route path='/changelog' component={ChangeLog} />
          </Switch>
        </Container>
      </StyleProvider>
    );
  }
}

export default withRouter(App);
