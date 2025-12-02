/**
 * Sample DeviceInfo.nitro.ts content for testing
 *
 * This is a frozen snapshot of a subset of the DeviceInfo interface
 * for unit testing the API parser.
 */

export const SAMPLE_DEVICE_INFO_CONTENT = `
import { type HybridObject } from 'react-native-nitro-modules';

/**
 * Device battery and power information
 */
export interface PowerState {
  batteryLevel: number;
  batteryState: BatteryState;
  lowPowerMode: boolean;
}

export type DeviceType = 'Handset' | 'Tablet' | 'Tv' | 'Desktop' | 'GamingConsole' | 'unknown';
export type BatteryState = 'unknown' | 'unplugged' | 'charging' | 'full';

export interface DeviceInfo
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {

  /**
   * Get device model identifier
   *
   * Returns the internal device model string.
   *
   * @returns Model identifier
   * @example
   * iOS: "iPhone14,2" (iPhone 13 Pro)
   * Android: "SM-G998B" (Samsung Galaxy S21)
   */
  readonly deviceId: string;

  /**
   * Get device brand/manufacturer name
   *
   * @returns Brand name
   * @example
   * iOS: "Apple"
   * Android: "Samsung", "Google", "OnePlus", etc.
   */
  readonly brand: string;

  /**
   * Get current battery level
   *
   * Returns battery charge level as a float between 0.0 and 1.0.
   * This value changes as battery drains/charges.
   *
   * @returns Battery level (0.0 to 1.0), 0.0 if unavailable
   * @example 0.75 represents 75% battery
   */
  getBatteryLevel(): number;

  /**
   * Get comprehensive power state information
   *
   * Returns an object containing battery level, charging state,
   * and low power mode status.
   *
   * @returns PowerState object with battery level, state, and low power mode
   * @example
   * {
   *   batteryLevel: 0.75,
   *   batteryState: 'charging',
   *   lowPowerMode: false
   * }
   */
  getPowerState(): PowerState;

  /**
   * Check if battery is currently charging
   *
   * This value changes when device is plugged/unplugged.
   *
   * @returns true if charging or full
   */
  getIsBatteryCharging(): boolean;

  /**
   * Check if device has a display notch
   *
   * Detects the presence of a screen notch (iPhone X and later).
   *
   * @returns true if notch present
   * @example
   * iPhone X, 11, 12, 13 → true
   * iPhone SE, 8 → false
   * Android → false (detection complex, not implemented)
   *
   * @platform ios
   */
  getHasNotch(): boolean;

  /**
   * Get device IP address
   *
   * Returns the local IP address (WiFi or cellular).
   *
   * @returns Promise resolving to IP address string
   * @example "192.168.1.100", "10.0.0.5"
   *
   * @async ~20-50ms
   */
  getIpAddress(): Promise<string>;

  /**
   * Get total device RAM in bytes
   *
   * Returns the total physical memory available on the device.
   *
   * @returns Total memory in bytes
   * @example 6442450944 (6 GB)
   */
  readonly totalMemory: number;

  /**
   * Get current app memory usage in bytes
   *
   * Returns the current memory footprint of this app.
   *
   * @returns Used memory in bytes, 0 if error
   * @example 134217728 (128 MB)
   */
  getUsedMemory(): number;

  /**
   * Check if airplane mode is enabled.
   *
   * This value changes when user toggles airplane mode.
   *
   * @returns true if airplane mode is on
   * @platform Android only (returns false on iOS)
   */
  getIsAirplaneMode(): boolean;

  /**
   * Returns the Android ID (unique per device/app/user).
   * Returns "unknown" on iOS/Windows.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly androidId: string;

  /**
   * Check if battery level is below threshold.
   *
   * @param threshold Battery level threshold (0.0 to 1.0)
   * @platform All
   */
  isLowBatteryLevel(threshold: number): boolean;
}
`;

/**
 * Expected API count from sample content
 */
export const EXPECTED_API_COUNT = 12;

/**
 * Expected API names from sample content
 */
export const EXPECTED_API_NAMES = [
  'deviceId',
  'brand',
  'getBatteryLevel',
  'getPowerState',
  'getIsBatteryCharging',
  'getHasNotch',
  'getIpAddress',
  'totalMemory',
  'getUsedMemory',
  'getIsAirplaneMode',
  'androidId',
  'isLowBatteryLevel',
];
