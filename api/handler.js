const queryString = require('query-string');
const fetch = require('node-fetch-polyfill');


const URLS = {
  token: 'https://api.yelp.com/oauth2/token',
  search: 'https://api.yelp.com/v3/businesses/search'
};
let globalCallback;
let queryStringParameters;


const searchResultHandler = function(result) {
  const features = result.businesses.map(f => {
    return {
      type: 'Feature',
      properties: f,
      geometry: {
        type: 'Point',
        coordinates: [f.coordinates.longitude, f.coordinates.latitude]
      }
    };
  });

  globalCallback(null, {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin' : '*'
    },
    body: JSON.stringify({
      type: 'FeatureCollection',
      features
    })
  });
};

const searchHandler = function(response) {
  if (!response.ok) {
    response.text().then(globalCallback, errorFactory('error reading unsuccessful search request'));

    return;
  }

  response.json().then(searchResultHandler, errorFactory('error reading successful search request'));
};

const getSearch = function(result) {
  const token = result.access_token;

  fetch(`${URLS.search}?${queryString.stringify(queryStringParameters)}`, {
    headers: {'Authorization': `Bearer ${token}`}
  }).then(searchHandler);
};

const getTokenHandler = function (callback) {
  return function(response) {
    if (!response.ok) {
      response.text().then(globalCallback, errorFactory('error reading unsuccessful token request'));

      return;
    }

    response.json().then(callback, errorFactory('error reading successful token request'));
  }
};

const errorFactory = function (message) {
  return function () {
    globalCallback(message, {
      statusCode: 502,
      body: message,
      headers: {
        'Access-Control-Allow-Origin' : '*'
      }
    });
  }
}

const getToken = function (callback) {
  // TODO: cache this in a db or something?
  fetch(URLS.token, {
    method: 'POST',
    body: queryString.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.YELP_CLIENT_ID,
      client_secret: process.env.YELP_CLIENT_SECRET
    }),
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  }).then(getTokenHandler(callback), errorFactory('token request failed!'));
}


module.exports.search = (event, context, callback) => {
  globalCallback = callback;
  queryStringParameters = event.queryStringParameters;

  getToken(getSearch);
};
