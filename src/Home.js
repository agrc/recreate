import React, { Component } from 'react';
import { Body, Button, Card, CardItem, Container, Content, Text } from 'native-base';
import { ImageBackground, StyleSheet, Image, View } from 'react-native';
import { Link } from 'react-router-native';
import queryString from 'query-string';
// import mapboxgl from 'mapbox-gl';
import { version } from '../package.json';
import config from './config';
import DefaultText from './DefaultText';
import LinkButton from './LinkButton';


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
    this.handleSearchKeyDown = this.handleSearchKeyDown.bind(this);
  }
  toggleSearchForm() {
    this.setState({searchFormOpen: !this.state.searchFormOpen});
  }
  async search() {
    const params = {
        predicate: `Name = '${this.state.cityPlace}'`,
        spatialReference: 4326,
        apiKey: process.env.REACT_APP_AGRC_WEB_API_KEY
    };

    const response = await fetch(`${searchUrl}?${queryString.stringify(params)}`);
    if (response.ok) {
      const responseJson = await response.json();
      if (responseJson.result.length) {
        const extent = this.getMapboxCentroid(responseJson.result[0].geometry);
        this.props.history.push(`/map/${extent},11`);
      } else {
        this.setState({ searchError: true });
      }
    } else {
      this.setState({ searchError: true });
    }
  }
  // getMapboxCentroid(esriGeometry) {
  //   // returns a LngLat array that is the centroid of `esriGeometry`
  //   let southwest;
  //   let northeast;
  //
  //   esriGeometry.rings[0].forEach((point) => {
  //     const diviser = 1000;
  //     point = point.map((coord) => Math.round(coord * diviser)/diviser)
  //     if (!southwest || (point[0] < southwest[0] && point[1] < southwest[1])) {
  //       southwest = point;
  //     } else if (!northeast || (point[0] > northeast[0] && point[1] > northeast[1])) {
  //       northeast = point;
  //     }
  //   });
  //
  //   return new mapboxgl.LngLatBounds(southwest, northeast).getCenter().toArray();
  // }
  handleCityPlaceChange(event) {
    this.setState({cityPlace: event.target.value});
  }
  handleSearchKeyDown(event) {
    this.setState({searchError: false});

    if (event.key === config.enterKey) {
      this.search();
    }
  }
  render() {
    return (
      <Container>
        <ImageBackground source={require('./images/arches.jpg')} style={styles.backgroundImage}>
          <View style={styles.content}>
            <View style={styles.tagLineContainer}>
              <DefaultText style={styles.tagLineFont}>RECREATION,</DefaultText>
              <DefaultText style={styles.tagLineFont}>Your Way</DefaultText>
            </View>
            <View style={styles.buttonsContainer}>
              <LinkButton primary block style={{marginBottom: padding}} to='/map'>
                <Text>Explore Current Location</Text>
              </LinkButton>
              <Button primary block onClick={this.toggleSearchForm}>
                <Text>Search by City or Place</Text>
              </Button>
              {/*
              <Collapse isOpen={this.state.searchFormOpen} className='search-form'>
                <Input type='text' placeholder='Enter City or Place' value={this.state.cityPlace}
                  onChange={this.handleCityPlaceChange}
                  onKeyDown={this.handleSearchKeyDown}/>
                <div className='button-group'>
                  <Button color='primary' onClick={this.search}>Search</Button>
                  <Button color='warning' onClick={() => this.setState({searchFormOpen: false})}>Cancel</Button>
                </div>
                <span style={{display: (this.state.searchError) ? 'block': 'none'}}>No results found for {this.state.cityPlace}!</span>
              </Collapse>
              */}
            </View>
            <Image source={require('./images/outdoorlogo.png')} style={styles.goedLogo}/>
            <Link to='changelog' style={styles.version}>
              <DefaultText style={styles.versionText}>{version}</DefaultText>
            </Link>
          </View>
        </ImageBackground>
      </Container>
    );
  }
};

const padding = 10;
const styles = StyleSheet.create({
  backgroundImage: {
    height: '100%',
    width: '100%'
  },
  buttonsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
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
  tagLineContainer: {
    alignSelf: 'center'
  },
  tagLineFont: {
    textShadowColor: '#4b4b4b',
    textShadowOffset: { width: 1, height: 1 },
    shadowColor: '#4b4b4b',
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
