/**
 * useBatteryLevelIsLow Hook
 *
 * Monitor for low battery conditions.
 *
 * @module react-native-nitro-device-info/hooks
 */

import { useState, useEffect } from 'react';
import { DeviceInfoModule } from '../index';
import { isLowBatteryLevel } from './utils';

/**
 * Monitor for low battery conditions.
 *
 * Returns the battery level only when it drops below the platform-specific threshold:
 * - iOS: 20% (matches iOS low power mode trigger)
 * - Android: 15% (matches Android low battery warning)
 *
 * When the battery is above the threshold, returns null.
 *
 * @returns Battery level when low (0.0 to threshold), or null if battery is not low
 *
 * @example
 * ```tsx
 * import { useBatteryLevelIsLow } from 'react-native-nitro-device-info';
 *
 * function LowBatteryWarning() {
 *   const lowBattery = useBatteryLevelIsLow();
 *
 *   if (lowBattery !== null) {
 *     return (
 *       <View style={styles.warning}>
 *         <Text>Low Battery: {Math.round(lowBattery * 100)}%</Text>
 *       </View>
 *     );
 *   }
 *
 *   return null;
 * }
 * ```
 *
 * @platform iOS, Android
 */
export function useBatteryLevelIsLow(): number | null {
  const [batteryLevelIsLow, setBatteryLevelIsLow] = useState<number | null>(
    null
  );

  useEffect(() => {
    // Check initial value
    const checkBatteryLevel = () => {
      const level = DeviceInfoModule.getBatteryLevel();
      if (isLowBatteryLevel(level)) {
        setBatteryLevelIsLow(level);
      } else {
        setBatteryLevelIsLow(null);
      }
    };

    // Set initial state
    checkBatteryLevel();

    // Poll for changes (no throttle for low battery alerts - important to detect quickly)
    const intervalId = setInterval(checkBatteryLevel, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return batteryLevelIsLow;
}
