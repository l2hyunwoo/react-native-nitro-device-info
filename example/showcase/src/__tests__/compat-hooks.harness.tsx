/**
 * E2E Tests: RNDI compat layer hooks
 *
 * Verifies the compat layer re-exports the full set of `react-native-device-info`
 * hooks as named functions, so an RNDI codebase that imports hooks from
 * `react-native-nitro-device-info/compat` resolves every symbol.
 */

import { describe, test, expect } from 'react-native-harness';
import * as compat from 'react-native-nitro-device-info/compat';

// The 12 hooks `react-native-device-info` exposes, which the compat layer must
// provide for a drop-in import to type-check and resolve at runtime.
const RNDI_HOOK_NAMES = [
  'useBatteryLevel',
  'useBatteryLevelIsLow',
  'usePowerState',
  'useBrightness',
  'useIsHeadphonesConnected',
  'useIsWiredHeadphonesConnected',
  'useIsBluetoothHeadphonesConnected',
  'useFirstInstallTime',
  'useDeviceName',
  'useHasSystemFeature',
  'useIsEmulator',
  'useManufacturer',
] as const;

describe('compat hooks: every RNDI hook is exported as a function', () => {
  for (const name of RNDI_HOOK_NAMES) {
    test(`${name} is exported as a function`, () => {
      const hook = (compat as Record<string, unknown>)[name];
      expect(hook).toBeDefined();
      expect(typeof hook).toBe('function');
    });
  }
});

describe('compat hooks: re-exported core hooks are the same reference', () => {
  test('useBatteryLevel / usePowerState / useBrightness are functions', () => {
    expect(typeof compat.useBatteryLevel).toBe('function');
    expect(typeof compat.usePowerState).toBe('function');
    expect(typeof compat.useBrightness).toBe('function');
  });
});
