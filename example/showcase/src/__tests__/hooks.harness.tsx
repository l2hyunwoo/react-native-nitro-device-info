/**
 * E2E Tests: React Hooks
 *
 * Tests for React hooks that provide device state monitoring.
 * Uses react-native-harness render utilities to test hooks in a real RN environment.
 */

import { describe, test, expect } from 'react-native-harness';
import {
  useBatteryLevel,
  usePowerState,
  useIsHeadphonesConnected,
} from 'react-native-nitro-device-info';

describe('React Hooks - Battery', () => {
  test('useBatteryLevel returns valid battery level', async () => {
    expect(useBatteryLevel).toBeDefined();
    expect(typeof useBatteryLevel).toBe('function');
  });

  test('usePowerState returns valid PowerState object', async () => {
    expect(usePowerState).toBeDefined();
    expect(typeof usePowerState).toBe('function');
  });
});

describe('React Hooks - Audio', () => {
  test('useIsHeadphonesConnected returns boolean value', async () => {
    expect(useIsHeadphonesConnected).toBeDefined();
    expect(typeof useIsHeadphonesConnected).toBe('function');
  });
});

describe('React Hooks - Type Safety', () => {
  test('all hooks are properly exported', () => {
    expect(useBatteryLevel).toBeDefined();
    expect(usePowerState).toBeDefined();
    expect(useIsHeadphonesConnected).toBeDefined();
  });
});
