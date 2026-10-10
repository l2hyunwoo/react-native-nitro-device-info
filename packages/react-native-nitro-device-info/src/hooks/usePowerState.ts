/**
 * usePowerState Hook
 *
 * Monitor comprehensive power state including battery level, charging status, and low power mode.
 *
 * @module react-native-nitro-device-info/hooks
 */

import { useState, useEffect } from 'react';
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { PowerState } from '../DeviceInfo.nitro';

/**
 * Monitor comprehensive power state including battery level, charging status, and low power mode.
 *
 * Returns a Partial<PowerState> object containing:
 * - batteryLevel?: Battery charge level (0.0 to 1.0, or -1 when unavailable)
 * - batteryState?: Current charging state ('unknown', 'unplugged', 'charging', 'full')
 * - lowPowerMode?: Whether low power mode is enabled (iOS only)
 *
 * @returns Partial<PowerState> object, or empty object during initial load
 *
 * @example
 * ```tsx
 * import { usePowerState } from 'react-native-nitro-device-info';
 *
 * function PowerStatus() {
 *   const powerState = usePowerState();
 *
 *   return (
 *     <View>
 *       <Text>Level: {(powerState.batteryLevel ?? -1) >= 0
 *         ? `${Math.round(powerState.batteryLevel! * 100)}%`
 *         : 'unavailable'}</Text>
 *       <Text>Status: {powerState.batteryState ?? 'unknown'}</Text>
 *       <Text>Low Power: {powerState.lowPowerMode ? 'Yes' : 'No'}</Text>
 *     </View>
 *   );
 * }
 * ```
 *
 * @platform iOS, Android
 */
export function usePowerState(): Partial<PowerState> {
  const [powerState, setPowerState] = useState<Partial<PowerState>>({});

  useEffect(() => {
    // Set initial value from sync property
    const updatePowerState = () => {
      const state = DeviceInfoModule.getPowerState();
      // Only update state if values have changed to prevent unnecessary re-renders
      setPowerState(prev => {
        if (
          prev.batteryLevel === state.batteryLevel &&
          prev.batteryState === state.batteryState &&
          prev.lowPowerMode === state.lowPowerMode
        ) {
          return prev;
        }
        return state;
      });
    };

    // Get initial state
    updatePowerState();

    // Poll for changes
    const intervalId = setInterval(updatePowerState, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return powerState;
}
