/**
 * @format
 */

import 'node-libs-react-native/globals';
import 'react-native-get-random-values'

import {AppRegistry} from 'react-native';
import Example from './Example';
import {name as appName} from './app.json';



AppRegistry.registerComponent(appName, () => Example);
