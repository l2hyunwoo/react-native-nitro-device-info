/**
 * useBrightness Hook
 *
 * Monitor screen brightness changes (iOS only).
 *
 * @module react-native-nitro-device-info/hooks
 */

import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { DeviceInfoModule } from '../index';

/**
 * Monitor screen brightness changes (iOS only).
 *
 * Returns the current screen brightness as a number between 0.0 and 1.0 on iOS.
 * On Android, returns -1 as brightness monitoring is not supported.
 *
 * @returns Brightness level (0.0-1.0) on iOS, -1 on Android, or null during initial load
 *
 * @platform iOS only (returns -1 on Android)
 *
 * @example
 * ```tsx
 * import { useBrightness } from 'react-native-nitro-device-info';
 * import { Platform } from 'react-native';
 *
 * function BrightnessIndicator() {
 *   const brightness = useBrightness();
 *
 *   if (brightness === null) {
 *     return <Text>Loading...</Text>;
 *   }
 *
 *   if (brightness < 0) {
 *     return <Text>Brightness monitoring not supported</Text>;
 *   }
 *
 *   return <Text>Brightness: {Math.round(brightness * 100)}%</Text>;
 * }
 * ```
 */
export function useBrightness(): number | null {
  const [brightness, setBrightness] = useState<number | null>(null);

  useEffect(() => {
    // Skip entirely on Android since brightness monitoring is not supported
    if (Platform.OS === 'android') {
      setBrightness(-1);
      return;
    }

    const updateBrightness = () => {
      const currentBrightness = DeviceInfoModule.getBrightness();
      setBrightness(currentBrightness);
    };

    // Get initial state
    updateBrightness();

    // Poll for changes (brightness changes can be frequent with auto-brightness)
    const intervalId = setInterval(updateBrightness, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return brightness;
}
