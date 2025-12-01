/**
 * React Hooks for Device Info Monitoring
 *
 * These hooks provide reactive access to runtime device properties,
 * automatically updating your components when device state changes.
 *
 * @module react-native-nitro-device-info/hooks
 */

// Battery Hooks
export { useBatteryLevel } from './useBatteryLevel';
export { useBatteryLevelIsLow } from './useBatteryLevelIsLow';
export { usePowerState } from './usePowerState';

// Headphone Hooks
export { useIsHeadphonesConnected } from './useIsHeadphonesConnected';
export { useIsWiredHeadphonesConnected } from './useIsWiredHeadphonesConnected';
export { useIsBluetoothHeadphonesConnected } from './useIsBluetoothHeadphonesConnected';

// Display Hooks
export { useBrightness } from './useBrightness';
