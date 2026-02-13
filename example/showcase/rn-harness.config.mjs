import { androidPlatform } from '@react-native-harness/platform-android';
import {
  applePlatform,
  appleSimulator,
} from '@react-native-harness/platform-apple';

// CI environment detection - GitHub Actions sets CI=true
const isCI = process.env.CI === 'true';

/** @type {import('react-native-harness').HarnessConfig} */
const config = {
  entryPoint: './index.js',
  appRegistryComponentName: 'NitroDeviceInfoExample',
  bridgeTimeout: isCI ? 120000 : 60000,
  resetEnvironmentBetweenTestFiles: !isCI,

  runners: [
    applePlatform({
      name: 'ios',
      device: appleSimulator('iPhone 17 Pro', '26.2'),
      bundleId: 'nitrodeviceinfo.example',
    }),
    androidPlatform({
      name: 'android',
      device: { type: 'physical', manufacturer: 'samsung', model: 'SM-S926N' },
      bundleId: 'nitrodeviceinfo.example',
    }),
  ],

  defaultRunner: 'ios',
};

export default config;
