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

// iOS simulator: use CI-detected values or fall back to local defaults
const iosDeviceName = process.env.SIMULATOR_DEVICE_NAME || 'iPhone 16 Pro';
const iosVersion = process.env.SIMULATOR_IOS_VERSION || '18.4';

/** @type {import('react-native-harness').HarnessConfig} */
const config = {
  entryPoint: './index.js',
  appRegistryComponentName: 'NitroDeviceInfoExample',
  // CI: 120s timeout - app is pre-installed and Metro bundle is pre-built
  // Local: 60s timeout for faster feedback during development
  bridgeTimeout: isCI ? 120000 : 60000,
  // CI: Disable app restart between test files to avoid simulator timeout issues
  // Local: Enable for better test isolation during development
  resetEnvironmentBetweenTestFiles: !isCI,

  runners: [
    applePlatform({
      name: 'ios',
      device: appleSimulator(iosDeviceName, iosVersion),
      bundleId: 'nitrodeviceinfo.example',
    }),
    androidPlatform({
      name: 'android',
      device: androidEmulator('test', {
        apiLevel: 30,
        profile: 'pixel_4',
        diskSize: '2G',
        heapSize: '512M',
      }),
      bundleId: 'nitrodeviceinfo.example',
    }),
  ],

  defaultRunner: 'ios',
};

export default config;
