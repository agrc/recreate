import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';


export default React.forwardRef((props, ref) => (
    <MapboxGL.MapView
        {...props}
        ref={ref}
        pitchEnabled={false}
        rotateEnabled={false}
        logoEnabled={false}
        >
    </MapboxGL.MapView>
));
