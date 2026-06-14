import DeviceInfo from 'react-native-nitro-device-info/compat';

export function getName() {
  return DeviceInfo.getDeviceName();
}
