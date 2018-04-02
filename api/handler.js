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

const getSearch = function() {
  fetch(`${URLS.search}?${queryString.stringify(queryStringParameters)}`, {
    headers: {'Authorization': `Bearer ${process.env.YELP_TOKEN}`}
  }).then(searchHandler);
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


module.exports.search = (event, context, callback) => {
  globalCallback = callback;
  queryStringParameters = event.queryStringParameters;

  getSearch({ access_token: queryStringParameters.token });
};
