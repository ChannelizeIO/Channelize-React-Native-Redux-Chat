/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
let nodeLibs = require('node-libs-react-native');
nodeLibs.fs = require.resolve('react-native-level-fs');
nodeLibs.tls = require.resolve('node-libs-react-native/mock/tls');;

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    extraNodeModules: nodeLibs,
  },
};
