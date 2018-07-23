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
import { Platform } from 'react-native';


const searchUrl = 'http://api.mapserv.utah.gov/api/v1/search/SGID10.Location.ZoomLocations/Name,shape@envelope';

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

    if (Platform.OS === 'android') {
      if (this.state.searchFormOpen) {
        this.onSearchBlur();
      } else {
        this.onSearchFocus();
      }
    }
  }

  async search(searchTerm) {
    console.log('search');

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

    const nothingFound = () => {
      this.setState({ searchError: searchTerm, searchResults: [] });
    };

    const headers = { Referer: 'https://recreate.utah.gov/' };

    console.log('fetch');
    const response = await fetch(`${searchUrl}?${queryString.stringify(params)}`,
      { headers, signal: this.abortController.signal });

    if (response.ok) {
      const responseJson = await response.json();
      if (responseJson.result.length) {
        this.setState({ searchResults: responseJson.result });
        console.log('after fetch', responseJson);
      } else {
        nothingFound();
      }
    } else {
      nothingFound();
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
                <WhiteText style={[styles.tagLineFont, styles.avenir]}>RECREATION,</WhiteText>
                <WhiteText style={[styles.tagLineFont, styles.caveat]}>Your Way</WhiteText>
              </View>
            )}
            <View style={styles.buttonsContainer}>
              <LinkButton primary block style={{marginBottom: padding}} to='/map'>
                <Text>Explore Current Location</Text>
              </LinkButton>
              <Button primary block onPress={this.toggleSearchForm.bind(this)}>
                <Text>Search by City or Place</Text>
              </Button>
              {(Platform.OS === 'android' && this.state.searchFormOpen) ?
                <View style={styles.autocompleteWrapper}>
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
                  <WhiteText style={(this.state.searchError) ? null : styles.hidden}>No results found for {this.state.searchError}!</WhiteText>
                </View>
              :
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
                  <WhiteText style={(this.state.searchError) ? null : styles.hidden}>No results found for {this.state.searchError}!</WhiteText>
                </Collapsible>
              }
            </View>
            <Image source={require('./images/outdoorlogo.png')} style={styles.goedLogo}/>
            <Link to='changelog' style={styles.version}>
              <WhiteText style={styles.versionText}>{(process.env.NODE_ENV === 'development') ? `${version}-dev` : version}</WhiteText>
            </Link>
          </View>
        </ImageBackground>
      </Container>
    );
  }
}

const padding = 10;
const styles = StyleSheet.create({
  autocompleteWrapper: {
    height: '100%',
    width: '100%'
  },
  autocompleteContainer: {
    marginTop: padding,
    ...Platform.select({
      android: {
        flex: 1,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 2
      }
    })
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
  avenir: {
    fontFamily: 'Avenir Next Condensed Demi Bold',
    fontSize: 48
  },
  caveat: {
    fontFamily: 'Caveat-Regular',
    fontSize: 64,
    color: config.colors.lightBlue
  },
  tagLineFont: {
    textShadowColor: config.colors.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    shadowColor: config.colors.textShadow,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
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
