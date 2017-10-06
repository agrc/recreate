import React, { Component } from 'react';
import { Button, Collapse, Input } from 'reactstrap';
import { Link } from 'react-router-dom';

import './css/Home.css';
import outdoorLogo from './css/images/outdoorlogo.png';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
  search() {
    // TODO
    console.log(this.state.cityPlace);
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
            <Input type='text' placeholder='Enter City or Place' value={this.state.cityPlace} onChange={this.handleCityPlaceChange}/>
            <div className='button-group'>
              <Button color='primary' onClick={this.search}>Search</Button>
              <Button color='warning' onClick={() => this.setState({searchFormOpen: false})}>Cancel</Button>
            </div>
          </Collapse>
        </div>
        <img src={outdoorLogo} alt='goed logo'/>
      </div>
    );
  }
};

export default Home;
