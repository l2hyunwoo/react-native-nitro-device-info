/**
 * useIsHeadphonesConnected Hook
 *
 * Monitor headphone connection state (wired or Bluetooth).
 *
 * @module react-native-nitro-device-info/hooks
 */

import { useState, useEffect } from 'react';
import { DeviceInfoModule } from '../index';

/**
 * Monitor headphone connection state (wired or Bluetooth).
 *
 * Returns true if any headphones are connected (wired or Bluetooth),
 * false if no headphones are connected.
 *
 * @returns true if any headphones are connected, false otherwise
 *
 * @example
 * ```tsx
 * import { useIsHeadphonesConnected } from 'react-native-nitro-device-info';
 *
 * function AudioOutput() {
 *   const headphonesConnected = useIsHeadphonesConnected();
 *
 *   return (
 *     <Text>
 *       Audio: {headphonesConnected ? 'Headphones' : 'Speaker'}
 *     </Text>
 *   );
 * }
 * ```
 *
 * @platform iOS, Android
 */
export function useIsHeadphonesConnected(): boolean {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Set initial value from sync property
    const updateStatus = () => {
      const connected = DeviceInfoModule.getIsHeadphonesConnected();
      setIsConnected(prev => prev === connected ? prev : connected);
    };

    // Get initial state
    updateStatus();

    // Poll for changes (headphone events are instant, but polling is fallback)
    const intervalId = setInterval(updateStatus, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return isConnected;
}
