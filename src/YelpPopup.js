import React from 'react';

import logo from './css/images/Yelp_trademark_RGB_outline.png';


export default function YelpPopup(props) {
  return (
    <div className='yelp-popup'>
      {
        // TODO: check for valid url before displaying this tag
      }
      <img src={props.image_url} alt='business'/>
      <div className='details'>
        <h6>{props.name}</h6>
        <div className='rating-logo-container'>
          <div className={`star-rating stars_${props.rating.toString().replace('.', '_')}`}></div>
          <a href={props.url}><img src={logo} className='logo' alt='yelp logo'/></a>
        </div>
        <span className='review-count'>Based on {props.review_count} Reviews</span>
      </div>
    </div>
  );
};
