/**
 * Utility functions for React hooks
 *
 * @module react-native-nitro-device-info/hooks/utils
 */

import { Platform } from 'react-native';

/**
 * Low battery threshold constants by platform
 * - iOS: 20% (matches iOS low power mode trigger)
 * - Android: 15% (matches Android low battery warning)
 */
export const LOW_BATTERY_THRESHOLD = Platform.OS === 'android' ? 0.15 : 0.2;

/**
 * Check if a battery level is considered "low" based on platform-specific thresholds
 *
 * @param level Battery level (0.0 to 1.0)
 * @returns true if battery is below platform-specific threshold
 */
export function isLowBatteryLevel(level: number): boolean {
  return level < LOW_BATTERY_THRESHOLD;
}
