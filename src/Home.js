import React, { Component } from 'react';
import { Button, Container, Input, Item, Text } from 'native-base';
import { Dimensions, ImageBackground, StyleSheet, Image, View } from 'react-native';
import { Link } from 'react-router-native';
import queryString from 'query-string';
import { version } from '../package.json';
import config from './config';
import { WhiteText } from './AppText';
import LinkButton from './LinkButton';
import Collapsible from 'react-native-collapsible';
import geoViewport from '@mapbox/geo-viewport';
import { REACT_APP_AGRC_WEB_API_KEY } from 'react-native-dotenv';


const searchUrl = 'https://api.mapserv.utah.gov/api/v1/search/SGID10.Location.ZoomLocations/Name,shape@envelope';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchError: false,
      searchTerm: '',
      searchFormOpen: false,
      cityPlace: ''
    };

    this.toggleSearchForm = this.toggleSearchForm.bind(this);
    this.search = this.search.bind(this);
    this.handleCityPlaceChange = this.handleCityPlaceChange.bind(this);
  }

  toggleSearchForm() {
    this.setState({searchFormOpen: !this.state.searchFormOpen});
  }

  async search() {
    if (this.state.cityPlace.length === 0) {
      return;
    }

    const params = {
        predicate: `Name = '${this.state.cityPlace}'`,
        spatialReference: 4326,
        apiKey: REACT_APP_AGRC_WEB_API_KEY
    };

    const headers = { Referer: 'https://recreate.utah.gov/' };
    const response = await fetch(`${searchUrl}?${queryString.stringify(params)}`, { headers });
    if (response.ok) {
      const responseJson = await response.json();
      if (responseJson.result.length) {
        const {center, zoom} = this.getViewport(responseJson.result[0].geometry);
        this.props.history.push(`/map/${center},${zoom}`);
      } else {
        this.setState({ searchError: true });
      }
    } else {
      this.setState({ searchError: true });
    }
  }

  getViewport(esriGeometry) {
    let southwest;
    let northeast;

    esriGeometry.rings[0].forEach((point) => {
      const diviser = 1000;
      point = point.map((coord) => Math.round(coord * diviser)/diviser)
      if (!southwest || (point[0] < southwest[0] && point[1] < southwest[1])) {
        southwest = point;
      } else if (!northeast || (point[0] > northeast[0] && point[1] > northeast[1])) {
        northeast = point;
      }
    });

    const {height, width} = Dimensions.get('window');

    return geoViewport.viewport([southwest[0], southwest[1], northeast[0], northeast[1]],
                                [width, height],
                                undefined,
                                undefined,
                                config.tileSize);
  }

  handleCityPlaceChange(searchTerm) {
    this.setState({ cityPlace: searchTerm, searchError: false });
  }

  render() {
    return (
      <Container>
        <ImageBackground source={require('./images/arches.jpg')} style={styles.backgroundImage}>
          <View style={styles.content}>
            <View style={styles.tagLineContainer}>
              <WhiteText style={styles.tagLineFont}>RECREATION,</WhiteText>
              <WhiteText style={styles.tagLineFont}>Your Way</WhiteText>
            </View>
            <View style={styles.buttonsContainer}>
              <LinkButton primary block style={{marginBottom: padding}} to='/map'>
                <Text>Explore Current Location</Text>
              </LinkButton>
              <Button primary block onPress={this.toggleSearchForm}>
                <Text>Search by City or Place</Text>
              </Button>
              <Collapsible collapsed={!this.state.searchFormOpen}>
                <Item regular style={styles.textbox}>
                  <Input placeholder='Enter City or Place'
                    value={this.state.cityPlace}
                    onChangeText={this.handleCityPlaceChange} />
                </Item>
                <View style={styles.searchButtonsContainer}>
                  <Button primary onPress={this.search} style={styles.searchButton}>
                    <Text>Search</Text>
                  </Button>
                  <Button warning onPress={() => this.setState({searchFormOpen: false})} style={styles.searchButton}>
                    <Text>Cancel</Text>
                  </Button>
                </View>
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
  backgroundImage: {
    height: '100%',
    width: '100%'
  },
  buttonsContainer: {
    backgroundColor: config.colors.transparent,
    padding
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
  searchButton: {
    width: '25%'
  },
  searchButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
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
  textbox: {
    borderColor: config.colors.transparent,
    backgroundColor: config.colors.white,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 0,
    marginLeft: -1
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
