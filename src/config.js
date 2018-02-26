const layerToken = '{layer}';
const aGOLServiceBase = `https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/${layerToken}/FeatureServer/0/query`;

let devPostfix = '';
if (process.env.NODE_ENV === 'development') {
  devPostfix = '_Dev';
}

export default {
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
    POI_DATA: `${process.env.PUBLIC_URL}/PointsOfInterest.json`,
    yelp: 'https://f0inm0pv3a.execute-api.us-east-1.amazonaws.com/dev/search',
    yelpIcon: `${process.env.PUBLIC_URL}/Yelp_burst_positive_RGB.png`
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
    // these match values in index.scss
    blue: '#358EA6',
    green: '#35a669'
  }
};
