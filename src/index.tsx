import { NitroModules } from 'react-native-nitro-modules';
import type { NitroDeviceInfo } from './NitroDeviceInfo.nitro';

const NitroDeviceInfoHybridObject =
  NitroModules.createHybridObject<NitroDeviceInfo>('NitroDeviceInfo');

export function multiply(a: number, b: number): number {
  return NitroDeviceInfoHybridObject.multiply(a, b);
}
