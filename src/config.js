const layerToken = '{layer}';
const aGOLServiceBase = `https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/${layerToken}/FeatureServer/0/query`;

let devPostfix = '';
if (process.env.NODE_ENV === 'development') {
  devPostfix = '_Dev';
}

export default {
  mapExtent: [-111.8, 40.55, 10],  // long, lat, zoom
  poi_type_lookup: {
    p: 'Parks',
    y: 'Local Amenities (via Yelp)',
    h: 'Hiking',
    w: 'Boat Ramps'
  },
  urls: {
    p: aGOLServiceBase.replace(layerToken, `UtahParksAndMonuments${devPostfix}`),
    h: aGOLServiceBase.replace(layerToken, `RouteLines${devPostfix}`),
    w: aGOLServiceBase.replace(layerToken, `BoatRamps${devPostfix}`),
    yelp: 'https://f0inm0pv3a.execute-api.us-east-1.amazonaws.com/dev/search',
    yelpIcon: `Yelp_burst_positive_RGB.png`
  },
  fieldnames: {
    Name: 'Name',
    ID: 'ID',
    Type: 'Type',
    ids: {
      p: 'FeatureID',
      h: 'RouteID',
      w: 'FeatureID'
    },
    trails: {
      LENGTH: 'LENGTH',
      URL: 'Url',
      RouteType: 'RouteType',
      ElevationProfile: 'ElevationProfile',
      ElevationGain: 'ElevationGain'
    },
    parks: {
      TYPE: 'TYPE'
    }
  },
  outAndBack: 'Out & Back',
  enterKey: 'Enter',
  elevationProfileResampleFactor: 50,
  styles: {
    outdoors: 'mapbox://styles/mapbox/outdoors-v10'
  },
  colors: {
    blue: '#358EA6',
    green: '#35a669',
    yellow: '#e7eb3f',
    white: 'white',
    transparent: 'rgba(0, 0, 0, 0.35)',
    textShadow: '#4b4b4b',
    borderColor: '#999999',
    transparentWhite: 'rgba(255, 255, 255, 0.85)',
    yelpRed: '#D32423'
  },
  tileSize: 512,
  maxYelpRequestRadius: 15000  // meters
};
