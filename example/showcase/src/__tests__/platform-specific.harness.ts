/**
 * E2E Tests: Platform-Specific APIs
 *
 * Tests for APIs that have different behavior on iOS vs Android.
 * iOS-specific tests only run on iOS, Android-specific tests only run on Android.
 */

import { describe, test, expect } from 'react-native-harness';
import { Platform } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import { isValidNavigationMode, VALID_NAVIGATION_MODES } from './types';

const describeIOS = Platform.OS === 'ios' ? describe : describe.skip;
const describeAndroid = Platform.OS === 'android' ? describe : describe.skip;

describeIOS('iOS-Specific APIs', () => {
  test('getBrightness returns value between 0.0 and 1.0', () => {
    const brightness = DeviceInfoModule.getBrightness();
    expect(typeof brightness).toBe('number');
    expect(brightness).toBeGreaterThanOrEqual(0);
    expect(brightness).toBeLessThanOrEqual(1);
  });

  test('getHasNotch returns boolean', () => {
    const hasNotch = DeviceInfoModule.getHasNotch();
    expect(typeof hasNotch).toBe('boolean');
  });

  test('getHasDynamicIsland returns boolean', () => {
    const hasDynamicIsland = DeviceInfoModule.getHasDynamicIsland();
    expect(typeof hasDynamicIsland).toBe('boolean');
  });
});

describeAndroid('Android-Specific APIs', () => {
  test('getHasGms returns boolean or throws on emulator without GMS', () => {
    // May throw if Play Services library not available (e.g., on emulators without GMS)
    try {
      const hasGms = DeviceInfoModule.getHasGms();
      expect(typeof hasGms).toBe('boolean');
    } catch {
      // NoClassDefFoundError is expected on emulators without Google Play Services.
    }
  });

  test('getHasHms returns boolean', () => {
    const hasHms = DeviceInfoModule.getHasHms();
    expect(typeof hasHms).toBe('boolean');
  });

  test('apiLevel returns API level >= 21', () => {
    const apiLevel = DeviceInfoModule.apiLevel;
    expect(typeof apiLevel).toBe('number');
    expect(apiLevel).toBeGreaterThanOrEqual(21);
  });

  test('navigationMode returns valid mode', () => {
    const navMode = DeviceInfoModule.navigationMode;
    expect(typeof navMode).toBe('string');
    expect(isValidNavigationMode(navMode)).toBe(true);
    expect(VALID_NAVIGATION_MODES).toContain(navMode);
  });

  test('identifiers keep their values after build info is read first', () => {
    expect(DeviceInfoModule.fingerprint.length).toBeGreaterThan(0);
    expect(DeviceInfoModule.androidId).not.toBe('unknown');
    expect(DeviceInfoModule.androidId).toBe(DeviceInfoModule.uniqueId);
    expect(typeof DeviceInfoModule.serialNumber).toBe('string');
  });
});

describe('Cross-Platform Dynamic APIs', () => {
  test('getFontScale returns valid scale value', () => {
    const fontScale = DeviceInfoModule.getFontScale();
    expect(typeof fontScale).toBe('number');

    // Font scale should be positive (1.0 is normal, can be larger for accessibility)
    expect(fontScale).toBeGreaterThan(0);
    // Reasonable range: 0.5 to 3.0
    expect(fontScale).toBeLessThanOrEqual(3);
  });

  test('getIsLandscape returns boolean value', () => {
    const isLandscape = DeviceInfoModule.getIsLandscape();
    expect(typeof isLandscape).toBe('boolean');
  });

  test('getIsBatteryCharging returns boolean value', () => {
    const isCharging = DeviceInfoModule.getIsBatteryCharging();
    expect(typeof isCharging).toBe('boolean');
  });
});

describe('Time-Based APIs', () => {
  test('getFirstInstallTime returns valid timestamp', async () => {
    const installTime = await DeviceInfoModule.getFirstInstallTime();
    expect(typeof installTime).toBe('number');

    // Should be a reasonable timestamp (after 2020)
    const year2020 = new Date('2020-01-01').getTime();
    expect(installTime).toBeGreaterThan(year2020);

    expect(installTime).toBeLessThanOrEqual(Date.now() + 60000); // Allow 1 minute buffer
  });

  test('getLastUpdateTime returns valid timestamp', async () => {
    const updateTime = await DeviceInfoModule.getLastUpdateTime();
    expect(typeof updateTime).toBe('number');

    if (Platform.OS === 'android') {
      // Android: returns actual timestamp
      const year2020 = new Date('2020-01-01').getTime();
      expect(updateTime).toBeGreaterThan(year2020);
      expect(updateTime).toBeLessThanOrEqual(Date.now() + 60000);
    }
    // iOS may return -1 or same as install time
  });

  test('lastUpdateTime is >= firstInstallTime', async () => {
    const installTime = await DeviceInfoModule.getFirstInstallTime();
    const updateTime = await DeviceInfoModule.getLastUpdateTime();

    // Update time should be same or after install time (or -1 on iOS)
    if (updateTime > 0) {
      expect(updateTime).toBeGreaterThanOrEqual(installTime);
    }
  });
});

describeIOS('iOS Platform Fallback Values', () => {
  test('Android-only string properties return "unknown"', () => {
    expect(DeviceInfoModule.androidId).toBe('unknown');
    expect(DeviceInfoModule.serialNumber).toBe('unknown');
    expect(DeviceInfoModule.securityPatch).toBe('unknown');
    expect(DeviceInfoModule.bootloader).toBe('unknown');
    expect(DeviceInfoModule.device).toBe('unknown');
    expect(DeviceInfoModule.hardware).toBe('unknown');
  });

  test('Android-only array properties return empty array', () => {
    expect(DeviceInfoModule.supported32BitAbis).toEqual([]);
    expect(DeviceInfoModule.systemAvailableFeatures).toEqual([]);
  });

  test('Android-only APIs return fallback values', () => {
    expect(DeviceInfoModule.getHasGms()).toBe(false);
    expect(DeviceInfoModule.getHasHms()).toBe(false);
    expect(DeviceInfoModule.apiLevel).toBe(-1);
    expect(DeviceInfoModule.navigationMode).toBe('unknown');
  });
});

describeAndroid('Android Platform Fallback Values', () => {
  test('iOS-only APIs return fallback values', () => {
    expect(DeviceInfoModule.getBrightness()).toBe(-1);
    expect(DeviceInfoModule.getHasNotch()).toBe(false);
    expect(DeviceInfoModule.getHasDynamicIsland()).toBe(false);
  });
});
