import React from 'react';
import './css/Home.css';
import outdoorLogo from './css/images/outdoorlogo.png';

export default () => {
  return (
    <div className='home' alt='delicate arch'>
      <div className='tagline'>
        <h1 className='firstline'>RECREATION,</h1>
        <h1 className='secondline'>Your Way</h1>
      </div>
      <div className='buttons'>

      </div>
      <img src={outdoorLogo} alt='goed logo'/>
    </div>
  );
};
