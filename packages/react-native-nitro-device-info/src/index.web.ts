/**
 * Web entry point for React Native Nitro Device Info.
 *
 * Selected automatically over `index.ts` on web targets:
 * - Metro / react-native-web: via the `.web.ts` platform extension.
 * - webpack / Next.js: via the `"browser"` condition in package.json `exports`.
 *
 * The public API shape is identical to `index.ts`; only the backing
 * `DeviceInfoModule` differs — here it is the pure-JS web fallback that never
 * touches Nitro's native bindings, so importing the package on web/SSR does not
 * crash.
 *
 * @module react-native-nitro-device-info
 */

import { createDeviceInfo } from './DeviceInfo.web';
import type {
  DeviceInfo,
  PowerState,
  DeviceType,
  BatteryState,
  NavigationMode,
} from './DeviceInfo.nitro';

export { createDeviceInfo };

/**
 * Pre-created web fallback singleton, mirroring the native entry's
 * `DeviceInfoModule`. Safe to import in a browser or during SSR.
 */
export const DeviceInfoModule: DeviceInfo = createDeviceInfo();

// Re-export types for convenience (identical to the native entry).
export type { DeviceInfo, PowerState, DeviceType, BatteryState, NavigationMode };

// Re-export React hooks. They read from `DeviceInfoModule` (this module's web
// fallback when bundled for web), so they run unchanged in the browser.
export {
  useBatteryLevel,
  useBatteryLevelIsLow,
  usePowerState,
  useIsHeadphonesConnected,
  useIsWiredHeadphonesConnected,
  useIsBluetoothHeadphonesConnected,
  useBrightness,
} from './hooks';
