/**
 * React Native Nitro Device Info
 *
 * Provides comprehensive device information through Nitro's zero-overhead JSI bindings.
 *
 * @module react-native-nitro-device-info
 * @version 0.1.0
 */

import { NitroModules } from 'react-native-nitro-modules';
import type {
  DeviceInfo,
  PowerState,
  DeviceType,
  BatteryState,
  NavigationMode,
} from './DeviceInfo.nitro';

/**
 * Create the DeviceInfo HybridObject instance
 *
 * This singleton provides access to all device information methods.
 * It is created once and reused throughout the application lifecycle.
 *
 * @example
 * ```typescript
 * import { createDeviceInfo } from 'react-native-nitro-device-info'
 *
 * const deviceInfo = createDeviceInfo()
 *
 * // Synchronous access
 * console.log(deviceInfo.deviceId)
 * console.log(deviceInfo.systemVersion)
 *
 * // Asynchronous access
 * const uniqueId = await deviceInfo.getUniqueId()
 * const powerState = await deviceInfo.getPowerState()
 * ```
 */
export function createDeviceInfo(): DeviceInfo {
  return NitroModules.createHybridObject<DeviceInfo>('DeviceInfo');
}

/**
 * Pre-created singleton instance for convenience
 *
 * Use this if you don't need to create multiple instances.
 *
 * @example
 * ```typescript
 * import { DeviceInfo } from 'react-native-nitro-device-info'
 *
 * console.log(DeviceInfo.deviceId)
 * const uniqueId = await DeviceInfo.getUniqueId()
 * ```
 */
export const DeviceInfoModule: DeviceInfo = createDeviceInfo();

// Re-export types for convenience
export type { DeviceInfo, PowerState, DeviceType, BatteryState, NavigationMode };

// Re-export React hooks for runtime monitoring
export {
  useBatteryLevel,
  useBatteryLevelIsLow,
  usePowerState,
  useIsHeadphonesConnected,
  useIsWiredHeadphonesConnected,
  useIsBluetoothHeadphonesConnected,
  useBrightness,
} from './hooks';
