const layerToken = '{layer}';
const aGOLServiceBase = `https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/${layerToken}/FeatureServer/0/query`;

export default {
  poi_type_lookup: {
    l: 'Parks',
    y: 'Local Amenities (via Yelp)',
    h: 'Hiking',
    w: 'Boat Ramps'
  },
  urls: {
    l: aGOLServiceBase.replace(layerToken, 'UrbanParks'),
    h: aGOLServiceBase.replace(layerToken, 'Trails'),
    w: aGOLServiceBase.replace(layerToken, 'Boat_Ramps'),
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
      l: 'ID',
      h: 'TrailID',
      w: 'BRID'
    }
  },
  metersPerMile: 1609.34,
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
