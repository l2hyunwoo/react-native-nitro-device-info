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
  // CI: 300s timeout for slower Metro startup and simulator response on shared runners
  // Local: 60s timeout for faster feedback during development
  bridgeTimeout: isCI ? 300000 : 60000,
  // CI: Disable app restart between test files to avoid simulator timeout issues
  // Local: Enable for better test isolation during development
  resetEnvironmentBetweenTestFiles: !isCI,

  runners: [
    applePlatform({
      name: 'ios',
      device: appleSimulator('iPhone 16 Pro', '18.4'),
      bundleId: 'nitrodeviceinfo.example',
    }),
    androidPlatform({
      name: 'android',
      device: androidEmulator('test', {
        avd: {
          apiLevel: 30,
          profile: 'pixel_4',
          diskSize: '2G',
          heapSize: '512M',
        },
      }),
      bundleId: 'nitrodeviceinfo.example',
    }),
  ],

  defaultRunner: 'ios',
};

export default config;
