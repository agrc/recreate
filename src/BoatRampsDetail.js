import React from 'react';
import DetailsBase from './DetailsBase';
import StaticMap from './StaticMap';
import { View, Text } from 'native-base';


class BoatRampsDetail extends DetailsBase {
  constructor(props) {
    super(props);

    this.state = {
      Water_body: '',
      Vessels: ''
    };
  }

  render() {
    return (
      <View>
        <Text>{this.state.Water_body}</Text>
        <Text>Allowed Vessels: {this.state.Vessels}</Text>
        <StaticMap geojson={this.state.geojson} poitype='w'/>
      </View>
    );
  }
}

export default BoatRampsDetail;
