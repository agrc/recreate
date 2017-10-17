import React, { Component } from 'react';
import { Button, Collapse, Input, Alert } from 'reactstrap';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import mapboxgl from 'mapbox-gl';

import './css/Home.css';
import outdoorLogo from './css/images/outdoorlogo.png';


const searchUrl = 'http://api.mapserv.utah.gov/api/v1/search/SGID10.Location.ZoomLocations/Name,shape@envelope'

class Home extends Component {
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
    }
  }
  getMapboxCentroid(esriGeometry) {
    // returns a LngLat array that is the centroid of `esriGeometry`
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

    return new mapboxgl.LngLatBounds(southwest, northeast).getCenter().toArray();
  }
  handleCityPlaceChange(event) {
    this.setState({cityPlace: event.target.value});
  }
  render() {
    return (
      <div className='home' alt='delicate arch'>
        <div className='tagline'>
          <h1 className='firstline'>RECREATION,</h1>
          <h1 className='secondline'>Your Way</h1>
        </div>
        <div className='buttons'>
          <Button color='primary' tag={Link} to='/map'>Explore Current Location</Button>
          <Button color='primary' onClick={this.toggleSearchForm}>Search by City or Place</Button>
          <Collapse isOpen={this.state.searchFormOpen} className='search-form'>
            <Input type='text' placeholder='Enter City or Place' value={this.state.cityPlace}
              onChange={this.handleCityPlaceChange}
              onKeyDown={() => this.setState({searchError: false})}/>
            <div className='button-group'>
              <Button color='primary' onClick={this.search}>Search</Button>
              <Button color='warning' onClick={() => this.setState({searchFormOpen: false})}>Cancel</Button>
            </div>
            <Alert color='danger' style={{display: (this.state.searchError) ? 'block': 'none'}}>No results found for {this.state.cityPlace}!</Alert>
          </Collapse>
        </div>
        <img src={outdoorLogo} alt='goed logo'/>
      </div>
    );
  }
};

export default Home;
