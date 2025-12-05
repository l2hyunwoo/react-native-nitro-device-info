/**
 * useIsBluetoothHeadphonesConnected Hook
 *
 * Monitor Bluetooth headphone/audio device connection state.
 *
 * @module react-native-nitro-device-info/hooks
 */

import { useState, useEffect } from 'react';
import { DeviceInfoModule } from '../index';

/**
 * Monitor Bluetooth headphone/audio device connection state.
 *
 * Returns true if Bluetooth audio devices are connected (headphones, earbuds, speakers),
 * false if no Bluetooth audio devices are connected.
 *
 * @returns true if Bluetooth audio devices are connected, false otherwise
 *
 * @example
 * ```tsx
 * import { useIsBluetoothHeadphonesConnected } from 'react-native-nitro-device-info';
 *
 * function BluetoothAudioStatus() {
 *   const bluetoothConnected = useIsBluetoothHeadphonesConnected();
 *
 *   return (
 *     <Icon
 *       name="bluetooth"
 *       color={bluetoothConnected ? 'blue' : 'gray'}
 *     />
 *   );
 * }
 * ```
 *
 * @platform iOS, Android
 */
export function useIsBluetoothHeadphonesConnected(): boolean {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Set initial value from sync property
    const updateStatus = () => {
      const connected = DeviceInfoModule.getIsBluetoothHeadphonesConnected();
      setIsConnected(prev => prev === connected ? prev : connected);
    };

    // Get initial state
    updateStatus();

    // Poll for changes (Bluetooth events may have slight delay)
    const intervalId = setInterval(updateStatus, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return isConnected;
}
