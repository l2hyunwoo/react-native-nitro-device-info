import DeviceInfo from 'react-native-device-info';

export function getName() {
  return DeviceInfo.getDeviceName();
}
