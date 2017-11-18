import React from 'react';

import { storiesOf } from '@storybook/react';
import CustomizeBtn from '../CustomizeBtn';

import '../css/index.css';
import '../css/MapView.css';


storiesOf('CustomizeBtn', module)
  .add('default', () => <CustomizeBtn />);
