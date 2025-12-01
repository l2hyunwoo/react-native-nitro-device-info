/**
 * E2E Tests: Dynamic Device State APIs
 *
 * Tests for dynamic APIs that return runtime values (battery, memory, storage).
 * These values change over time but should always be within valid ranges.
 */

import { describe, test, expect } from 'react-native-harness';
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import { isValidPowerState, isValidBcp47 } from './types';

describe('Dynamic State APIs - Battery', () => {
  // T019: getBatteryLevel test
  test('getBatteryLevel returns number between 0.0 and 1.0', () => {
    const level = DeviceInfoModule.getBatteryLevel();
    expect(typeof level).toBe('number');
    expect(level).toBeGreaterThanOrEqual(0);
    expect(level).toBeLessThanOrEqual(1);
  });

  // T022: getPowerState test
  test('getPowerState returns valid PowerState object', () => {
    const state = DeviceInfoModule.getPowerState();

    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
    expect(isValidPowerState(state)).toBe(true);

    // Explicit property checks
    expect(typeof state.batteryLevel).toBe('number');
    expect(state.batteryLevel).toBeGreaterThanOrEqual(0);
    expect(state.batteryLevel).toBeLessThanOrEqual(1);

    expect(['unknown', 'unplugged', 'charging', 'full']).toContain(
      state.batteryState
    );

    expect(typeof state.lowPowerMode).toBe('boolean');
  });
});

describe('Dynamic State APIs - Memory', () => {
  // T020: getUsedMemory test
  test('getUsedMemory returns positive number', () => {
    const memory = DeviceInfoModule.getUsedMemory();
    expect(typeof memory).toBe('number');
    expect(memory).toBeGreaterThan(0);

    // Memory should be at least 1MB (reasonable minimum for any app)
    expect(memory).toBeGreaterThan(1024 * 1024);
  });

  // T023: totalMemory test
  test('totalMemory returns positive number', () => {
    const totalMemory = DeviceInfoModule.totalMemory;
    expect(typeof totalMemory).toBe('number');
    expect(totalMemory).toBeGreaterThan(0);

    // Total memory should be at least 512MB (minimum reasonable device)
    expect(totalMemory).toBeGreaterThan(512 * 1024 * 1024);
  });

  test('usedMemory is less than or equal to totalMemory', () => {
    const usedMemory = DeviceInfoModule.getUsedMemory();
    const totalMemory = DeviceInfoModule.totalMemory;

    expect(usedMemory).toBeLessThanOrEqual(totalMemory);
  });
});

describe('Dynamic State APIs - Storage', () => {
  // T021: getFreeDiskStorage test
  test('getFreeDiskStorage returns positive number', () => {
    const freeStorage = DeviceInfoModule.getFreeDiskStorage();
    expect(typeof freeStorage).toBe('number');
    expect(freeStorage).toBeGreaterThan(0);

    // Free storage should be at least 100MB (simulators usually have plenty)
    expect(freeStorage).toBeGreaterThan(100 * 1024 * 1024);
  });

  // T024: totalDiskCapacity test
  test('totalDiskCapacity returns positive number', () => {
    const totalCapacity = DeviceInfoModule.totalDiskCapacity;
    expect(typeof totalCapacity).toBe('number');
    expect(totalCapacity).toBeGreaterThan(0);

    // Total capacity should be at least 1GB (minimum simulator storage)
    expect(totalCapacity).toBeGreaterThan(1024 * 1024 * 1024);
  });

  test('freeDiskStorage is less than or equal to totalDiskCapacity', () => {
    const freeStorage = DeviceInfoModule.getFreeDiskStorage();
    const totalCapacity = DeviceInfoModule.totalDiskCapacity;

    expect(freeStorage).toBeLessThanOrEqual(totalCapacity);
  });
});

describe('Dynamic State APIs - Localization', () => {
  // T025: systemLanguage test
  test('systemLanguage returns BCP 47 format string', () => {
    const language = DeviceInfoModule.systemLanguage;
    expect(typeof language).toBe('string');
    expect(language.length).toBeGreaterThan(0);

    // Should be valid BCP 47 format (e.g., "en", "en-US", "ko-KR")
    expect(isValidBcp47(language)).toBe(true);
  });
});
