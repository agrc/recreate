import React, { Component } from 'react';
import config from './config';
import PoiListItem from './PoiListItem';
import YelpListItem from './YelpListItem';
import distance from '@turf/distance';
import { Container, Content, List as NBList, ListItem, View, Text } from 'native-base';


class List extends Component {
  groupFeatures(features) {
    console.log('groupFeatures');
    const grouped = {};

    features.forEach(f => {
      const diviser = 10;
      f.properties.miles = Math.round(distance(this.props.currentLocation, f.geometry.coordinates, { units: 'miles' }) * diviser)/diviser;

      const type = f.properties.Type;
      if (!grouped[type]) {
        grouped[type] = [f];
      } else {
        grouped[type].push(f);
      }
    });

    return grouped;
  }

  render() {
    const grouped_features = this.groupFeatures(this.props.features);

    return (
      <Container>
        <Content>
          <NBList>
            { Object.keys(grouped_features).map(group => {
                return (
                  <View key={group}>
                    <ListItem itemHeader>
                      <Text>{ config.poi_type_lookup[group] }</Text>
                    </ListItem>
                    { grouped_features[group]
                        .sort((a, b) => a.properties.miles - b.properties.miles)
                        .map(f => {
                          return (f.properties.Type !== 'y') ?
                            <PoiListItem {...f.properties} coords={f.geometry.coordinates} key={f.id} /> :
                            <YelpListItem {...f.properties} key={f.properties.id} />
                        })
                    }
                  </View>
                );
              })
            }
          </NBList>
        </Content>
      </Container>
    );
  }
}

export default List;
