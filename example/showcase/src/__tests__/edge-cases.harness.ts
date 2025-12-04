/**
 * E2E Tests: Edge Cases and Tier 3 Type-Only Tests
 *
 * Tests for APIs that may have environment-dependent behavior.
 * These tests verify type correctness without asserting specific values.
 */

import { describe, test, expect } from 'react-native-harness';
import { Platform } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

describe('Edge Cases - No SIM Card', () => {
  // Carrier should return a string without crashing
  test('getCarrier returns string without crashing', async () => {
    const carrier = await DeviceInfoModule.getCarrier();
    expect(typeof carrier).toBe('string');
    // May return "unknown" or empty string if no SIM
  });

  test('getCarrierSync returns string without crashing', () => {
    const carrier = DeviceInfoModule.getCarrierSync();
    expect(typeof carrier).toBe('string');
  });
});

describe('Edge Cases - Location Services', () => {
  // Location enabled check should not throw
  test('isLocationEnabled returns boolean without throwing', async () => {
    const isEnabled = await DeviceInfoModule.isLocationEnabled();
    expect(typeof isEnabled).toBe('boolean');
  });

  test('getIsLocationEnabled returns boolean without throwing', () => {
    const isEnabled = DeviceInfoModule.getIsLocationEnabled();
    expect(typeof isEnabled).toBe('boolean');
  });

  test('getAvailableLocationProviders returns array without throwing', () => {
    const providers = DeviceInfoModule.getAvailableLocationProviders();
    expect(Array.isArray(providers)).toBe(true);

    // All elements should be strings
    providers.forEach((provider) => {
      expect(typeof provider).toBe('string');
    });
  });
});

describe('Edge Cases - Simulator/Emulator Battery', () => {
  // Simulator battery behavior
  test('battery level handles simulator correctly', () => {
    const level = DeviceInfoModule.getBatteryLevel();
    expect(typeof level).toBe('number');

    // On simulator, battery level may be 1.0 or a simulated value
    // Just verify it's in valid range
    expect(level).toBeGreaterThanOrEqual(0);
    expect(level).toBeLessThanOrEqual(1);
  });

  test('isLowBatteryLevel handles edge thresholds', () => {
    // Test with 0 threshold (should always be false unless battery is 0)
    expect(typeof DeviceInfoModule.isLowBatteryLevel(0)).toBe('boolean');

    // Test with 1 threshold (should always be true unless battery is full)
    expect(typeof DeviceInfoModule.isLowBatteryLevel(1)).toBe('boolean');

    // Test with normal threshold
    expect(typeof DeviceInfoModule.isLowBatteryLevel(0.2)).toBe('boolean');
  });
});

describe('Tier 3 - Network APIs (Type Verification Only)', () => {
  test('getIpAddress returns string', async () => {
    const ip = await DeviceInfoModule.getIpAddress();
    expect(typeof ip).toBe('string');
  });

  test('getIpAddressSync returns string', () => {
    const ip = DeviceInfoModule.getIpAddressSync();
    expect(typeof ip).toBe('string');
  });

  test('getMacAddress returns string', async () => {
    const mac = await DeviceInfoModule.getMacAddress();
    expect(typeof mac).toBe('string');

    if (Platform.OS === 'ios') {
      // iOS always returns "02:00:00:00:00:00" due to privacy
      expect(mac).toBe('02:00:00:00:00:00');
    }
  });

  test('getMacAddressSync returns string', () => {
    const mac = DeviceInfoModule.getMacAddressSync();
    expect(typeof mac).toBe('string');
  });
});

describe('Tier 3 - Audio APIs (Type Verification Only)', () => {
  test('isHeadphonesConnected returns boolean', async () => {
    const connected = await DeviceInfoModule.isHeadphonesConnected();
    expect(typeof connected).toBe('boolean');
  });

  test('getIsHeadphonesConnected returns boolean', () => {
    const connected = DeviceInfoModule.getIsHeadphonesConnected();
    expect(typeof connected).toBe('boolean');
  });

  test('getIsWiredHeadphonesConnected returns boolean', () => {
    const connected = DeviceInfoModule.getIsWiredHeadphonesConnected();
    expect(typeof connected).toBe('boolean');
  });

  test('getIsBluetoothHeadphonesConnected returns boolean', () => {
    const connected = DeviceInfoModule.getIsBluetoothHeadphonesConnected();
    expect(typeof connected).toBe('boolean');
  });
});

describe('Tier 3 - Security APIs (Type Verification Only)', () => {
  test('isCameraPresent returns boolean', () => {
    const present = DeviceInfoModule.isCameraPresent;
    expect(typeof present).toBe('boolean');
  });

  test('isPinOrFingerprintSet returns boolean', () => {
    const isSet = DeviceInfoModule.isPinOrFingerprintSet;
    expect(typeof isSet).toBe('boolean');
  });

  test('isHardwareKeyStoreAvailable returns boolean', () => {
    const available = DeviceInfoModule.isHardwareKeyStoreAvailable;
    expect(typeof available).toBe('boolean');
    // Note: On Android emulators, this may return true depending on the
    // emulator version and configuration (e.g., API 30+ with TEE support)
  });
});

describe('Tier 3 - User Agent (Type Verification Only)', () => {
  test('getUserAgent returns string', async () => {
    const userAgent = await DeviceInfoModule.getUserAgent();
    expect(typeof userAgent).toBe('string');
    expect(userAgent.length).toBeGreaterThan(0);
  });
});

describe('Tier 3 - Airplane Mode (Android Only)', () => {
  test('getIsAirplaneMode returns boolean', () => {
    const isAirplaneMode = DeviceInfoModule.getIsAirplaneMode();
    expect(typeof isAirplaneMode).toBe('boolean');

    if (Platform.OS === 'ios') {
      // iOS: always returns false
      expect(isAirplaneMode).toBe(false);
    }
  });
});

describe('Additional Sync Properties', () => {
  test('deviceName returns string', () => {
    const name = DeviceInfoModule.deviceName;
    expect(typeof name).toBe('string');
  });

  test('readableVersion returns formatted version string', () => {
    const version = DeviceInfoModule.readableVersion;
    expect(typeof version).toBe('string');
    expect(version.length).toBeGreaterThan(0);
  });

  test('startupTime returns positive number', () => {
    const startupTime = DeviceInfoModule.startupTime;
    expect(typeof startupTime).toBe('number');
    expect(startupTime).toBeGreaterThan(0);
  });

  test('firstInstallTimeSync returns number', () => {
    const installTime = DeviceInfoModule.firstInstallTimeSync;
    expect(typeof installTime).toBe('number');
  });

  test('installerPackageName returns string', () => {
    const installer = DeviceInfoModule.installerPackageName;
    expect(typeof installer).toBe('string');
  });
});
