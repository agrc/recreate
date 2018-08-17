import { Component } from 'react';
import config from './config';
import queryString from 'query-string';


const buildOutAndBack = function (geojson) {
  const coordsCopy = geojson.geometry.coordinates.slice();
  coordsCopy.reverse();

  geojson.geometry.coordinates = geojson.geometry.coordinates.concat(coordsCopy.slice(1));

  return geojson;
};


class DetailsBase extends Component {
  constructor(props) {
    super(props);

    this.state = { waitingForResponse: true };

    this.fetchData();
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    // in the future, cancel any fetch requests: https://developers.google.com/web/updates/2017/09/abortable-fetch
    this.mounted = false;
  }

  async fetchData() {
    const params = {
      where: `${config.fieldnames.ids[this.props[config.fieldnames.Type]]} = '${this.props[config.fieldnames.ID]}'`,
      f: 'geojson',
      outFields: '*',
      outSR: 4326,
      maxAllowableOffset: 0.0001
    };

    const response = await fetch(`${config.urls[this.props[config.fieldnames.Type]]}?${queryString.stringify(params)}`);
    if (response.ok && this.mounted) {
      const responseJson = await response.json();
      if (responseJson.features.length > 0) {
        const feature = responseJson.features[0];

        // tear out properties from geojson object
        // mapbox static map api doesn't like them.
        // perhaps it's the URL field?
        let geojson = Object.assign({}, feature);
        geojson.properties = {};

        if (feature.properties[config.fieldnames.trails.RouteType] === config.outAndBack) {
          geojson = buildOutAndBack(geojson);
          feature.properties[config.fieldnames.trails.LENGTH] += feature.properties[config.fieldnames.trails.LENGTH];
        }

        this.setState({...feature.properties, geojson: JSON.stringify(geojson)});

        this.setState({ waitingForResponse: false });
      } else {
        // TODO: handle no features found
      }
    } else {
      // TODO: handle error in fetch request
    }
  }
}

export { DetailsBase as default, buildOutAndBack };
