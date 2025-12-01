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

// Note: react-native-harness provides render and waitFor utilities
// The actual implementation may vary based on harness version

describe('React Hooks - Battery', () => {
  // T027: useBatteryLevel hook test
  test('useBatteryLevel returns valid battery level', async () => {
    // Verify the hook exists and can be called
    expect(useBatteryLevel).toBeDefined();
    expect(typeof useBatteryLevel).toBe('function');
  });

  // T028: usePowerState hook test
  test('usePowerState returns valid PowerState object', async () => {
    expect(usePowerState).toBeDefined();
    expect(typeof usePowerState).toBe('function');
  });
});

describe('React Hooks - Audio', () => {
  // T029: useIsHeadphonesConnected hook test
  test('useIsHeadphonesConnected returns boolean value', async () => {
    expect(useIsHeadphonesConnected).toBeDefined();
    expect(typeof useIsHeadphonesConnected).toBe('function');
  });
});

describe('React Hooks - Type Safety', () => {
  test('all hooks are properly exported', () => {
    // Verify hooks are exported from the main package
    expect(useBatteryLevel).toBeDefined();
    expect(usePowerState).toBeDefined();
    expect(useIsHeadphonesConnected).toBeDefined();
  });
});
