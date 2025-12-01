import {
  androidPlatform,
  androidEmulator,
} from '@react-native-harness/platform-android';
import {
  applePlatform,
  appleSimulator,
} from '@react-native-harness/platform-apple';

/** @type {import('react-native-harness').HarnessConfig} */
const config = {
  entryPoint: './index.js',
  appRegistryComponentName: 'NitroDeviceInfoExample',

  runners: [
    applePlatform({
      name: 'ios',
      device: appleSimulator('iPhone 16 Pro', '18.2'),
      bundleId: 'nitrodeviceinfo.example',
    }),
    androidPlatform({
      name: 'android',
      device: androidEmulator('test'),
      bundleId: 'nitrodeviceinfo.example',
    }),
  ],

  defaultRunner: 'ios',
};

export default config;
