/**
 * useIsWiredHeadphonesConnected Hook
 *
 * Monitor wired headphone connection state.
 *
 * @module react-native-nitro-device-info/hooks
 */

import { useState, useEffect } from 'react';
import { DeviceInfoModule } from '../index';

/**
 * Monitor wired headphone connection state.
 *
 * Returns true if wired headphones are connected (3.5mm jack or Lightning/USB-C adapter),
 * false if no wired headphones are connected.
 *
 * @returns true if wired headphones are connected, false otherwise
 *
 * @example
 * ```tsx
 * import { useIsWiredHeadphonesConnected } from 'react-native-nitro-device-info';
 *
 * function WiredAudioStatus() {
 *   const wiredConnected = useIsWiredHeadphonesConnected();
 *
 *   return (
 *     <Icon
 *       name={wiredConnected ? 'headphones' : 'headphones-off'}
 *       color={wiredConnected ? 'green' : 'gray'}
 *     />
 *   );
 * }
 * ```
 *
 * @platform iOS, Android
 */
export function useIsWiredHeadphonesConnected(): boolean {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Set initial value from sync property
    const updateStatus = () => {
      const connected = DeviceInfoModule.getIsWiredHeadphonesConnected();
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
