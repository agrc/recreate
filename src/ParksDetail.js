import React from 'react';
import DetailsBase from './DetailsBase';
import StaticMap from './StaticMap';
import config from './config';
import { View, Text } from 'native-base';


class ParksDetails extends DetailsBase {
  constructor(props) {
    super(props);

    this.state = {}
  }

  render() {
    return (
      <View className='detail'>
        <Text>{this.state[config.fieldnames.parks.TYPE]}</Text>
        <StaticMap geojson={this.state.geojson} />
      </View>
    );
  }
};

export default ParksDetails;
