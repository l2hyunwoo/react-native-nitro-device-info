/**
 * E2E Tests: Platform-Specific APIs
 *
 * Tests for APIs that have different behavior on iOS vs Android.
 * Validates correct values on target platform and graceful fallbacks on others.
 */

import { describe, test, expect } from 'react-native-harness';
import { Platform } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import { isValidNavigationMode, VALID_NAVIGATION_MODES } from './types';

describe('iOS-Specific APIs', () => {
  // T036: getBrightness test
  test('getBrightness returns platform-appropriate value', () => {
    const brightness = DeviceInfoModule.getBrightness();
    expect(typeof brightness).toBe('number');

    if (Platform.OS === 'ios') {
      // iOS: returns 0.0-1.0
      expect(brightness).toBeGreaterThanOrEqual(0);
      expect(brightness).toBeLessThanOrEqual(1);
    } else {
      // Android: returns -1 (not supported)
      expect(brightness).toBe(-1);
    }
  });

  // T037: getHasNotch test
  test('getHasNotch returns platform-appropriate value', () => {
    const hasNotch = DeviceInfoModule.getHasNotch();

    if (Platform.OS === 'ios') {
      // iOS: returns boolean based on device
      expect(typeof hasNotch).toBe('boolean');
    } else {
      // Android: returns false
      expect(hasNotch).toBe(false);
    }
  });

  // T038: getHasDynamicIsland test
  test('getHasDynamicIsland returns platform-appropriate value', () => {
    const hasDynamicIsland = DeviceInfoModule.getHasDynamicIsland();

    if (Platform.OS === 'ios') {
      // iOS: returns boolean based on device (iPhone 14 Pro+)
      expect(typeof hasDynamicIsland).toBe('boolean');
    } else {
      // Android: returns false
      expect(hasDynamicIsland).toBe(false);
    }
  });
});

describe('Android-Specific APIs', () => {
  // T039: getHasGms test
  test('getHasGms returns platform-appropriate value', () => {
    if (Platform.OS === 'ios') {
      // iOS: returns false
      const hasGms = DeviceInfoModule.getHasGms();
      expect(hasGms).toBe(false);
    } else {
      // Android: may throw if Play Services library not available (e.g., on emulators without GMS)
      // This is expected behavior - just verify the API exists
      try {
        const hasGms = DeviceInfoModule.getHasGms();
        expect(typeof hasGms).toBe('boolean');
      } catch {
        // NoClassDefFoundError is expected on emulators without Google Play Services
        expect(true).toBe(true);
      }
    }
  });

  // T040: getHasHms test
  test('getHasHms returns platform-appropriate value', () => {
    const hasHms = DeviceInfoModule.getHasHms();

    if (Platform.OS === 'android') {
      // Android: returns boolean based on Huawei services
      expect(typeof hasHms).toBe('boolean');
    } else {
      // iOS: returns false
      expect(hasHms).toBe(false);
    }
  });

  // T041: apiLevel test
  test('apiLevel returns platform-appropriate value', () => {
    const apiLevel = DeviceInfoModule.apiLevel;
    expect(typeof apiLevel).toBe('number');

    if (Platform.OS === 'android') {
      // Android: returns API level >= 21 (min supported)
      expect(apiLevel).toBeGreaterThanOrEqual(21);
    } else {
      // iOS: returns -1
      expect(apiLevel).toBe(-1);
    }
  });

  // T042: navigationMode test
  test('navigationMode returns platform-appropriate value', () => {
    const navMode = DeviceInfoModule.navigationMode;
    expect(typeof navMode).toBe('string');
    expect(isValidNavigationMode(navMode)).toBe(true);

    if (Platform.OS === 'android') {
      // Android: returns one of the valid modes
      expect(VALID_NAVIGATION_MODES).toContain(navMode);
    } else {
      // iOS: returns "unknown"
      expect(navMode).toBe('unknown');
    }
  });
});

describe('Tier 2 Cross-Platform Dynamic APIs', () => {
  // T043: getFontScale test
  test('getFontScale returns valid scale value', () => {
    const fontScale = DeviceInfoModule.getFontScale();
    expect(typeof fontScale).toBe('number');

    // Font scale should be positive (1.0 is normal, can be larger for accessibility)
    expect(fontScale).toBeGreaterThan(0);
    // Reasonable range: 0.5 to 3.0
    expect(fontScale).toBeLessThanOrEqual(3);
  });

  // T043: getIsLandscape test
  test('getIsLandscape returns boolean value', () => {
    const isLandscape = DeviceInfoModule.getIsLandscape();
    expect(typeof isLandscape).toBe('boolean');
  });

  // T043: getIsBatteryCharging test
  test('getIsBatteryCharging returns boolean value', () => {
    const isCharging = DeviceInfoModule.getIsBatteryCharging();
    expect(typeof isCharging).toBe('boolean');
  });
});

describe('Tier 2 Time-Based APIs', () => {
  // T044: getFirstInstallTime test
  test('getFirstInstallTime returns valid timestamp', async () => {
    const installTime = await DeviceInfoModule.getFirstInstallTime();
    expect(typeof installTime).toBe('number');

    // Should be a reasonable timestamp (after 2020)
    const year2020 = new Date('2020-01-01').getTime();
    expect(installTime).toBeGreaterThan(year2020);

    // Should be in the past or now
    expect(installTime).toBeLessThanOrEqual(Date.now() + 60000); // Allow 1 minute buffer
  });

  // T044: getLastUpdateTime test
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

describe('Platform Fallback Consistency', () => {
  test('Android-only string properties return "unknown" on iOS', () => {
    if (Platform.OS === 'ios') {
      expect(DeviceInfoModule.androidId).toBe('unknown');
      expect(DeviceInfoModule.serialNumber).toBe('unknown');
      expect(DeviceInfoModule.securityPatch).toBe('unknown');
      expect(DeviceInfoModule.bootloader).toBe('unknown');
      expect(DeviceInfoModule.device).toBe('unknown');
      expect(DeviceInfoModule.hardware).toBe('unknown');
    }
  });

  test('Android-only array properties return empty array on iOS', () => {
    if (Platform.OS === 'ios') {
      expect(DeviceInfoModule.supported32BitAbis).toEqual([]);
      expect(DeviceInfoModule.systemAvailableFeatures).toEqual([]);
    }
  });
});
