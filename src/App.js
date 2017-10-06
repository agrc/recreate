import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from './Home';
import './css/App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="app">
          <header className="header">
            <a href='/'>Recreation.Utah.Gov</a>
          </header>
          <div className="main">
            <Route exact={true} path="/" component={Home}/>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
