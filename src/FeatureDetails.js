import React, { Component } from 'react';
import { Content, Text, View } from 'native-base';
import ParksDetail from './ParksDetail';
import HikingDetail from './HikingDetail';
import BoatRampsDetail from './BoatRampsDetail';
import config from './config';
import get from 'lodash.get';
import distance from '@turf/distance';
import poiJson from './PointsOfInterest.json';
import { HeadingText, NameText, SmallText } from './AppText';
import { StyleSheet } from 'react-native';


export default class FeatureDetails extends Component {
  componentDidMount() {
    if (get(this.props, 'location.state')) {
      this.setState({ ...this.props.location.state });
    } else {
      this.getItemProps();
    }
  }

  getCurrentLocation(itemCoords) {
    navigator.geolocation.getCurrentPosition(position => {
      const diviser = 10;
      const miles = Math.round(distance([position.coords.longitude, position.coords.latitude], itemCoords) * diviser)/diviser;
      this.setState({ miles });
    });
    // don't worry about errors because we'll just hide the distance text
  }

  getItemProps() {
    const id = this.props.match.params.id;
    const feature = poiJson.features.find(f => f.properties[config.fieldnames.ID] === id);

    if (feature) {
      this.setState({ ...feature.properties });
      this.getCurrentLocation(feature.geometry.coordinates);
    } else {
      // TODO: handle feature not found
      console.error(`${id} not found!`);
    }
  }

  render() {
    let Details;
    if (this.state && this.state.Type) {
      switch (config.poi_type_lookup[this.state.Type]) {
        case config.poi_type_lookup.p:
          Details = ParksDetail;
          break;
        case config.poi_type_lookup.h:
          Details = HikingDetail;
          break;
        case config.poi_type_lookup.w:
          Details = BoatRampsDetail;
          break;
        default:
          throw new Error(`Unhandled POI type: ${this.state.Type}!`);
      }
    }

    return (
      <Content style={styles.padding}>
        {Details ? (
          <View>
            <View style={styles.headerContainer}>
              <HeadingText>{config.poi_type_lookup[this.state.Type]}</HeadingText>
              {this.state.miles &&
                <SmallText>Distance From You: {this.state.miles} miles</SmallText>}
            </View>
            <NameText>{this.state[config.fieldnames.Name]}</NameText>

            <Details { ...this.state } />
          </View>
        ) : <Text>loading data...</Text>}
      </Content>
    );
  }
}

const styles = StyleSheet.create({
  padding: {
    padding: 8
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
