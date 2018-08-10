import { REACT_APP_DISCOVER_QUAD_WORD_DEV, REACT_APP_DISCOVER_QUAD_WORD_PROD } from 'react-native-dotenv';


const layerToken = '{layer}';
const aGOLServiceBase = `https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/${layerToken}/FeatureServer/0/query`;

let devPostfix = '';
let baseMapTiles = `https://discover.agrc.utah.gov/login/path/${REACT_APP_DISCOVER_QUAD_WORD_PROD}/tiles/file/terrain_vectortiles/p12`
if (process.env.NODE_ENV === 'development') {
  devPostfix = '_Dev';
  baseMapTiles = `https://wms.appgeo.com/login/path/${REACT_APP_DISCOVER_QUAD_WORD_DEV}/tiles/file/utah_vector/p12`
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
    yelpIcon: `Yelp_burst_positive_RGB.png`,
    baseMapTiles,
    terrainStyleFile: `${baseMapTiles}/resources/styles/root.json`
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
  colors: {
    blue: '#358EA6',
    green: '#35a669',
    yellow: '#e7eb3f',
    lightBlue: '#B3E3F4',
    white: 'white',
    gray: 'gray',
    transparent: 'rgba(0, 0, 0, 0.35)',
    textShadow: '#4b4b4b',
    borderColor: '#999999',
    transparentWhite: 'rgba(255, 255, 255, 0.85)',
    yelpRed: '#D32423',
    orange: '#f0ad4e'
  },
  tileSize: 512,
  maxYelpRequestRadius: 15000  // meters
};
