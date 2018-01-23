const layerToken = '{layer}';
const recreateServiceBase = `http://localhost/arcgis/rest/services/Recreate/MapServer/{layer}/query`;

export default {
  poi_type_lookup: {
    p: 'Parks',
    l: 'Local Amenities (via Yelp)',
    h: 'Hiking',
    w: 'Boat Ramps'
  },
  urls: {
    p: recreateServiceBase.replace(layerToken, '2'),
    h: recreateServiceBase.replace(layerToken, '1'),
    w: recreateServiceBase.replace(layerToken, '0'),
    elevation: 'https://elevation.mapzen.com/height',
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
      URL: 'URL',
      RouteType: 'RouteType'
    },
    parks: {
      TYPE: 'TYPE'
    }
  },
  outAndBack: 'Out & Back',
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
