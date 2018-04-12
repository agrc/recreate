import React from 'react';
import DetailsBase from './DetailsBase';
import { Button, Card, CardItem, Body, Text, View } from 'native-base';
import { StyleSheet } from 'react-native';
import config from './config';
import round from 'lodash.round';
import StaticMap from './StaticMap';
import { Link } from 'react-router-native';
import { SmallText } from './AppText';
import { Linking } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


export default class HikingDetails extends DetailsBase {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const url = this.state[config.fieldnames.trails.URL];

    return (
      <View>
        <Card>
          <CardItem>
            <Body style={styles.row}>
              <View>
                <SmallText>Distance: {round(this.state[config.fieldnames.trails.LENGTH], 2)} miles</SmallText>
                <SmallText>({this.state[config.fieldnames.trails.RouteType]})</SmallText>
              </View>
              <SmallText className='pull-right'>Elevation Gain: {this.state[config.fieldnames.trails.ElevationGain]} feet</SmallText>
            </Body>
          </CardItem>
        </Card>
        <View style={styles.row}>
          <Button transparent>
            <Link to={{
              pathname: `${this.props[config.fieldnames.ID]}/map`,
              state: {
                geojson: this.state.geojson,
                profile: this.state[config.fieldnames.trails.ElevationProfile],
                outAndBack: this.state[config.fieldnames.trails.RouteType === config.outAndBack]
              }
            }}><Text>View Full Map</Text></Link>
          </Button>

          { url &&
            (<Button transparent onPress={() => { Linking.openURL(url) }}>
              <Text href={url}>Trail Details <FontAwesome name='external-link' size={16.5} /></Text>
            </Button>) }
        </View>
        <StaticMap geojson={this.state.geojson} outAndBack={this.state[config.fieldnames.trails.RouteType] === config.outAndBack} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
