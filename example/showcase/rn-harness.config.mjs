import {
  androidPlatform,
  androidEmulator,
} from '@react-native-harness/platform-android';
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
  // CI: 180s timeout for slower Metro startup on shared runners
  // Local: 60s timeout for faster feedback during development
  bridgeTimeout: isCI ? 180000 : 60000,

  runners: [
    applePlatform({
      name: 'ios',
      device: appleSimulator('iPhone 16 Pro', '18.4'),
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
