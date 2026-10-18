/**
 * E2E Tests: Core Device Properties
 *
 * Tests for core device properties that return deterministic values
 * on simulators/emulators. These properties are the most commonly used APIs.
 */

import { describe, test, expect } from 'react-native-harness';
import { Platform } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import { isValidDeviceType, VALID_DEVICE_TYPES } from './types';

describe('Core Device Properties', () => {
  test('deviceId returns non-empty string', () => {
    const deviceId = DeviceInfoModule.deviceId;
    expect(typeof deviceId).toBe('string');
    expect(deviceId.length).toBeGreaterThan(0);
  });

  test('brand returns non-empty string, Apple on iOS', () => {
    const brand = DeviceInfoModule.brand;
    expect(typeof brand).toBe('string');
    expect(brand.length).toBeGreaterThan(0);

    if (Platform.OS === 'ios') {
      expect(brand).toBe('Apple');
    }
  });

  test('systemName returns correct platform', () => {
    const systemName = DeviceInfoModule.systemName;
    expect(typeof systemName).toBe('string');

    if (Platform.OS === 'ios') {
      expect(systemName).toMatch(/^(iOS|iPadOS)$/);
    } else {
      expect(systemName).toBe('Android');
    }
  });

  test('systemVersion returns non-empty string', () => {
    const systemVersion = DeviceInfoModule.systemVersion;
    expect(typeof systemVersion).toBe('string');
    expect(systemVersion.length).toBeGreaterThan(0);

    // Should be a version string (e.g., "15.0", "12", "17.0.1")
    expect(systemVersion).toMatch(/^\d+(\.\d+)*$/);
  });

  test('model returns non-empty string', () => {
    const model = DeviceInfoModule.model;
    expect(typeof model).toBe('string');
    expect(model.length).toBeGreaterThan(0);
  });

  // Model returns the marketing name on iOS when the device identifier is mapped.
  test('model returns marketing name or valid fallback', () => {
    const model = DeviceInfoModule.model;
    const deviceId = DeviceInfoModule.deviceId;

    if (Platform.OS === 'ios') {
      // model should either be a specific marketing name (e.g., "iPhone 15 Pro")
      // or a valid generic fallback (e.g., "iPhone") for unmapped identifiers
      if (deviceId.startsWith('iPhone')) {
        expect(model).toMatch(/^iPhone/);
      } else if (deviceId.startsWith('iPad')) {
        expect(model).toMatch(/^iPad/);
      }
    }
  });

  test('deviceType returns valid enum value', () => {
    const deviceType = DeviceInfoModule.deviceType;
    expect(typeof deviceType).toBe('string');
    expect(isValidDeviceType(deviceType)).toBe(true);
    expect(VALID_DEVICE_TYPES).toContain(deviceType);
  });

  test('isTablet returns boolean value', () => {
    const isTablet = DeviceInfoModule.isTablet;
    expect(typeof isTablet).toBe('boolean');

    // On a phone simulator, should be false
    // On iPad simulator, should be true
    // Just verify it's a boolean
  });
});

describe('Tier 1 Identifiers', () => {
  test('uniqueId returns non-empty string', () => {
    const uniqueId = DeviceInfoModule.uniqueId;
    expect(typeof uniqueId).toBe('string');
    expect(uniqueId.length).toBeGreaterThan(0);
  });

  test('manufacturer returns non-empty string', () => {
    const manufacturer = DeviceInfoModule.manufacturer;
    expect(typeof manufacturer).toBe('string');
    expect(manufacturer.length).toBeGreaterThan(0);

    if (Platform.OS === 'ios') {
      expect(manufacturer).toBe('Apple');
    }
  });
});

describe('Tier 1 App Metadata', () => {
  test('version returns non-empty string', () => {
    const version = DeviceInfoModule.version;
    expect(typeof version).toBe('string');
    expect(version.length).toBeGreaterThan(0);
  });

  test('buildNumber returns non-empty string', () => {
    const buildNumber = DeviceInfoModule.buildNumber;
    expect(typeof buildNumber).toBe('string');
    expect(buildNumber.length).toBeGreaterThan(0);
  });

  test('bundleId returns non-empty string', () => {
    const bundleId = DeviceInfoModule.bundleId;
    expect(typeof bundleId).toBe('string');
    expect(bundleId.length).toBeGreaterThan(0);

    expect(bundleId).toMatch(/^[\w.]+$/);
  });

  test('applicationName returns non-empty string', () => {
    const applicationName = DeviceInfoModule.applicationName;
    expect(typeof applicationName).toBe('string');
    expect(applicationName.length).toBeGreaterThan(0);
  });
});

describe('Tier 1 Platform Detection', () => {
  test('isEmulator returns boolean value', () => {
    const isEmulator = DeviceInfoModule.isEmulator;
    expect(typeof isEmulator).toBe('boolean');

    // Note: Some Android emulators may report false for isEmulator
    // depending on the emulator configuration and detection heuristics.
    // We only verify the type here to avoid flaky tests.
  });

  test('supportedAbis returns non-empty array', () => {
    const supportedAbis = DeviceInfoModule.supportedAbis;
    expect(Array.isArray(supportedAbis)).toBe(true);
    expect(supportedAbis.length).toBeGreaterThan(0);

    supportedAbis.forEach((abi) => {
      expect(typeof abi).toBe('string');
      expect(abi.length).toBeGreaterThan(0);
    });

    if (Platform.OS === 'ios') {
      expect(supportedAbis).toContain('arm64');
    }
  });
});
