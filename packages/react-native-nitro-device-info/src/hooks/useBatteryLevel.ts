/**
 * useBatteryLevel Hook
 *
 * Monitor battery level changes in real-time.
 *
 * @module react-native-nitro-device-info/hooks
 */

import { useState, useEffect } from 'react';
import { DeviceInfoModule } from '../index';

/**
 * Monitor battery level changes in real-time.
 *
 * Returns the current battery level as a number between 0.0 and 1.0.
 * The value updates automatically when the battery level changes.
 *
 * @returns Battery level (0.0 to 1.0), or null during initial load
 *
 * @example
 * ```tsx
 * import { useBatteryLevel } from 'react-native-nitro-device-info';
 *
 * function BatteryIndicator() {
 *   const batteryLevel = useBatteryLevel();
 *
 *   if (batteryLevel === null) {
 *     return <Text>Loading...</Text>;
 *   }
 *
 *   return <Text>Battery: {Math.round(batteryLevel * 100)}%</Text>;
 * }
 * ```
 *
 * @platform iOS, Android
 */
export function useBatteryLevel(): number | null {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  useEffect(() => {
    const updateBatteryLevel = () => {
      const currentLevel = DeviceInfoModule.getBatteryLevel();
      setBatteryLevel(prev => prev === currentLevel ? prev : currentLevel);
    };

    // Set initial value
    updateBatteryLevel();

    // Poll every 5 seconds for reactive updates
    const intervalId = setInterval(updateBatteryLevel, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return batteryLevel;
}
