/**
 * Type definitions for E2E test helpers
 */

import type {
  DeviceType,
  BatteryState,
  NavigationMode,
  PowerState,
} from 'react-native-nitro-device-info';

export type { DeviceType, BatteryState, NavigationMode, PowerState };

/**
 * Valid device types for assertions
 */
export const VALID_DEVICE_TYPES: DeviceType[] = [
  'Handset',
  'Tablet',
  'Tv',
  'Desktop',
  'GamingConsole',
  'unknown',
];

/**
 * Valid battery states for assertions
 */
export const VALID_BATTERY_STATES: BatteryState[] = [
  'unknown',
  'unplugged',
  'charging',
  'full',
];

/**
 * Valid navigation modes for assertions
 */
export const VALID_NAVIGATION_MODES: NavigationMode[] = [
  'gesture',
  'buttons',
  'twobuttons',
  'unknown',
];

/**
 * Helper to check if a value is a valid device type
 */
export function isValidDeviceType(value: unknown): value is DeviceType {
  return VALID_DEVICE_TYPES.includes(value as DeviceType);
}

/**
 * Helper to check if a value is a valid battery state
 */
export function isValidBatteryState(value: unknown): value is BatteryState {
  return VALID_BATTERY_STATES.includes(value as BatteryState);
}

/**
 * Helper to check if a value is a valid navigation mode
 */
export function isValidNavigationMode(value: unknown): value is NavigationMode {
  return VALID_NAVIGATION_MODES.includes(value as NavigationMode);
}

/**
 * Helper to validate PowerState object structure
 */
export function isValidPowerState(value: unknown): value is PowerState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const state = value as PowerState;
  return (
    typeof state.batteryLevel === 'number' &&
    state.batteryLevel >= 0 &&
    state.batteryLevel <= 1 &&
    isValidBatteryState(state.batteryState) &&
    typeof state.lowPowerMode === 'boolean'
  );
}

/**
 * BCP 47 language tag pattern (simplified)
 * Examples: "en", "en-US", "ko-KR", "zh-Hans-CN"
 */
export const BCP47_PATTERN = /^[a-z]{2,3}(-[A-Za-z]{2,8})*$/;

/**
 * Helper to validate BCP 47 language tag format
 */
export function isValidBcp47(value: string): boolean {
  return BCP47_PATTERN.test(value);
}
