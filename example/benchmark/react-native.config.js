const path = require('path');
const pkg = require('../../packages/react-native-nitro-device-info/package.json');

module.exports = {
  project: {
    ios: {
      automaticPodsInstallation: false,
    },
  },
  dependencies: {
    [pkg.name]: {
      root: path.join(__dirname, '../../packages/react-native-nitro-device-info'),
      platforms: {
        // Codegen script incorrectly fails without this
        // So we explicitly specify the platforms with empty object
        ios: {},
        android: {},
      },
    },
  },
};
