/**
 * React Hooks for Device Info Monitoring
 *
 * These hooks provide reactive access to runtime device properties,
 * wrapping the native event listener infrastructure from Feature 011.
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
