import React, { Component } from 'react';
import { Button, Container, Text } from 'native-base';
import { Dimensions, ImageBackground, StyleSheet, Image, TouchableOpacity, View } from 'react-native';
import { Link } from 'react-router-native';
import queryString from 'query-string';
import { version } from '../package.json';
import config from './config';
import { WhiteText } from './AppText';
import LinkButton from './LinkButton';
import Collapsible from 'react-native-collapsible';
import geoViewport from '@mapbox/geo-viewport';
import { REACT_APP_AGRC_WEB_API_KEY } from 'react-native-dotenv';
import Autocomplete from 'react-native-autocomplete-input';
import 'abortcontroller-polyfill';


const searchUrl = 'https://api.mapserv.utah.gov/api/v1/search/SGID10.Location.ZoomLocations/Name,shape@envelope';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchError: false,
      searchFormOpen: false,
      searchResults: [],
      hideTagLine: false
    };
  }

  toggleSearchForm() {
    this.setState({searchFormOpen: !this.state.searchFormOpen});
  }

  async search(searchTerm) {
    this.setState({ searchError: false });

    if (searchTerm.length === 0) {
      this.setState({ searchResults: [] });

      return;
    }

    if (typeof this.abortController !== 'undefined') {
      this.abortController.abort();
    }

    this.abortController = new window.AbortController();

    const params = {
        predicate: `Name LIKE '${searchTerm}%'`,
        spatialReference: 4326,
        apiKey: REACT_APP_AGRC_WEB_API_KEY
    };

    const headers = { Referer: 'https://recreate.utah.gov/' };
    const response = await fetch(`${searchUrl}?${queryString.stringify(params)}`,
      { headers, signal: this.abortController.signal });
    if (response.ok) {
      const responseJson = await response.json();
      if (responseJson.result.length) {
        this.setState({ searchResults: responseJson.result });
      } else {
        this.setState({ searchError: true });
      }
    } else {
      this.setState({ searchError: true });
    }

    delete this.abortController;
  }

  zoom(feature) {
    console.log('zoom', feature);

    let southwest;
    let northeast;

    feature.geometry.rings[0].forEach((point) => {
      const diviser = 1000;
      point = point.map((coord) => Math.round(coord * diviser)/diviser)
      if (!southwest || (point[0] < southwest[0] && point[1] < southwest[1])) {
        southwest = point;
      } else if (!northeast || (point[0] > northeast[0] && point[1] > northeast[1])) {
        northeast = point;
      }
    });

    const {height, width} = Dimensions.get('window');

    const {center, zoom} = geoViewport.viewport([southwest[0], southwest[1], northeast[0], northeast[1]],
                                [width, height],
                                undefined,
                                undefined,
                                config.tileSize);

    this.props.history.push(`/map/${center},${zoom}`);
  }

  onSearchFocus() {
    this.setState({ hideTagLine: true });
  }

  onSearchBlur() {
    this.setState({ hideTagLine: false });
  }

  render() {
    return (
      <Container>
        <ImageBackground source={require('./images/arches.jpg')} style={styles.backgroundImage}>
          <View style={styles.content}>
            { !this.state.hideTagLine && (
              <View style={styles.tagLineContainer}>
                <WhiteText style={styles.tagLineFont}>RECREATION,</WhiteText>
                <WhiteText style={styles.tagLineFont}>Your Way</WhiteText>
              </View>
            )}
            <View style={styles.buttonsContainer}>
              <LinkButton primary block style={{marginBottom: padding}} to='/map'>
                <Text>Explore Current Location</Text>
              </LinkButton>
              <Button primary block onPress={this.toggleSearchForm.bind(this)}>
                <Text>Search by City or Place</Text>
              </Button>
              <Collapsible collapsed={!this.state.searchFormOpen}>
                <Autocomplete
                  data={this.state.searchResults}
                  containerStyle={styles.autocompleteContainer}
                  placeholder='Enter City or Place'
                  onChangeText={this.search.bind(this)}
                  onFocus={this.onSearchFocus.bind(this)}
                  onBlur={this.onSearchBlur.bind(this)}
                  renderItem={(feature) => (
                    <TouchableOpacity onPress={this.zoom.bind(this, feature)}>
                      <Text style={styles.itemText}>{feature.attributes.name}</Text>
                    </TouchableOpacity>
                  )} />
                <WhiteText style={(this.state.searchError) ? null : styles.hidden}>No results found for {this.state.cityPlace}!</WhiteText>
              </Collapsible>
            </View>
            <Image source={require('./images/outdoorlogo.png')} style={styles.goedLogo}/>
            <Link to='changelog' style={styles.version}>
              <WhiteText style={styles.versionText}>{version}</WhiteText>
            </Link>
          </View>
        </ImageBackground>
      </Container>
    );
  }
}

const padding = 10;
const styles = StyleSheet.create({
  autocompleteContainer: {
    marginTop: padding
  },
  backgroundImage: {
    height: '100%',
    width: '100%'
  },
  buttonsContainer: {
    backgroundColor: config.colors.transparent,
    padding,
    zIndex: 2
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding
  },
  goedLogo: {
    alignSelf: 'center'
  },
  hidden: {
    display: 'none'
  },
  itemText: {
    margin: 8
  },
  tagLineContainer: {
    alignSelf: 'center'
  },
  tagLineFont: {
    textShadowColor: config.colors.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    shadowColor: config.colors.textShadow,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  version: {
    position: 'absolute',
    bottom: 3,
    right: 3
  },
  versionText: {
    fontSize: 10
  }
});
