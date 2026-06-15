/**
 * E2E Tests: react-native-device-info (RNDI) compatibility layer
 *
 * Validates the `react-native-nitro-device-info/compat` drop-in surface against
 * the real native module on a device/simulator. The Jest unit tests for compat
 * run against a mocked native module, so they verify wiring/shape only — these
 * tests verify the transforms behave correctly with actual native values and
 * that compat getters agree with the core `DeviceInfoModule`.
 */

import { describe, test, expect } from 'react-native-harness';
import { Platform } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import DeviceInfo, * as compat from 'react-native-nitro-device-info/compat';

describe('compat: async getters resolve and agree with core', () => {
  test('getUniqueId resolves to the core uniqueId', async () => {
    const result = compat.getUniqueId();
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(DeviceInfoModule.uniqueId);
  });

  test('getManufacturer resolves to the core manufacturer', async () => {
    await expect(compat.getManufacturer()).resolves.toBe(
      DeviceInfoModule.manufacturer
    );
    if (Platform.OS === 'ios') {
      await expect(compat.getManufacturer()).resolves.toBe('Apple');
    }
  });

  test('getBatteryLevel resolves to a number in [0, 1]', async () => {
    const value = await compat.getBatteryLevel();
    expect(typeof value).toBe('number');
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(1);
  });

  test('isEmulator resolves to a boolean matching core', async () => {
    const value = await compat.isEmulator();
    expect(typeof value).toBe('boolean');
    expect(value).toBe(DeviceInfoModule.isEmulator);
  });
});

describe('compat: sync variants return bare values, not Promises', () => {
  test('getUniqueIdSync returns a string equal to core', () => {
    const value = compat.getUniqueIdSync();
    expect(value).not.toBeInstanceOf(Promise);
    expect(typeof value).toBe('string');
    expect(value).toBe(DeviceInfoModule.uniqueId);
  });

  test('isEmulatorSync returns a bare boolean', () => {
    const value = compat.isEmulatorSync();
    expect(typeof value).toBe('boolean');
    expect(value).toBe(DeviceInfoModule.isEmulator);
  });

  test('getManufacturerSync returns a bare string', () => {
    expect(compat.getManufacturerSync()).toBe(DeviceInfoModule.manufacturer);
  });

  test('async and sync variants return the same value', async () => {
    await expect(compat.getUniqueId()).resolves.toBe(compat.getUniqueIdSync());
    await expect(compat.isEmulator()).resolves.toBe(compat.isEmulatorSync());
  });
});

describe('compat: property getters expose core readonly values', () => {
  test('getModel / getBrand / getDeviceId match core', () => {
    expect(compat.getModel()).toBe(DeviceInfoModule.model);
    expect(compat.getBrand()).toBe(DeviceInfoModule.brand);
    expect(compat.getDeviceId()).toBe(DeviceInfoModule.deviceId);
  });

  test('app metadata getters match core', () => {
    expect(compat.getVersion()).toBe(DeviceInfoModule.version);
    expect(compat.getBuildNumber()).toBe(DeviceInfoModule.buildNumber);
    expect(compat.getBundleId()).toBe(DeviceInfoModule.bundleId);
    expect(compat.getApplicationName()).toBe(DeviceInfoModule.applicationName);
    expect(compat.getReadableVersion()).toBe(DeviceInfoModule.readableVersion);
  });
});

describe('compat: renamed / aliased methods hit the right core path', () => {
  test('hasNotch maps to core getHasNotch', () => {
    const value = compat.hasNotch();
    expect(typeof value).toBe('boolean');
    expect(value).toBe(DeviceInfoModule.getHasNotch());
  });

  test('hasDynamicIsland maps to core getHasDynamicIsland', () => {
    const value = compat.hasDynamicIsland();
    expect(typeof value).toBe('boolean');
    expect(value).toBe(DeviceInfoModule.getHasDynamicIsland());
  });

  test('isBatteryCharging (async) and isBatteryChargingSync map to core', async () => {
    const core = DeviceInfoModule.getIsBatteryCharging();
    await expect(compat.isBatteryCharging()).resolves.toBe(core);
    expect(compat.isBatteryChargingSync()).toBe(core);
  });

  test('isAirplaneMode wraps async; isAirplaneModeSync renames', async () => {
    const value = await compat.isAirplaneMode();
    expect(typeof value).toBe('boolean');
    expect(typeof compat.isAirplaneModeSync()).toBe('boolean');
    if (Platform.OS === 'ios') {
      expect(value).toBe(false);
    }
  });
});

describe('compat: location providers transform array -> map', () => {
  test('getAvailableLocationProviders resolves to a map shape', async () => {
    const providers = await compat.getAvailableLocationProviders();
    expect(Array.isArray(providers)).toBe(false);
    expect(typeof providers).toBe('object');

    // Every key from the core array must be present and true.
    const coreArray = DeviceInfoModule.getAvailableLocationProviders();
    for (const name of coreArray) {
      expect(providers[name]).toBe(true);
    }
    // Every value in the map must be a boolean true.
    Object.values(providers).forEach((v) => expect(v).toBe(true));
  });

  test('getAvailableLocationProvidersSync returns the same map shape', () => {
    const providers = compat.getAvailableLocationProvidersSync();
    expect(Array.isArray(providers)).toBe(false);
    expect(typeof providers).toBe('object');
  });
});

describe('compat: getFreeDiskStorage accepts and ignores storageType', () => {
  // The storageType argument must be accepted (RNDI signature parity) and
  // ignored — passing it must not change the query path. Free disk space can
  // drift by a few KB between back-to-back native calls (the OS writes), so we
  // assert both calls return a valid number rather than byte-exact equality.
  test('async variant accepts the storageType argument', async () => {
    const noArg = await compat.getFreeDiskStorage();
    const withArg = await compat.getFreeDiskStorage('important');
    expect(typeof noArg).toBe('number');
    expect(noArg).toBeGreaterThan(0);
    expect(typeof withArg).toBe('number');
    expect(withArg).toBeGreaterThan(0);
  });

  test('sync variant accepts the storageType argument', () => {
    const noArg = compat.getFreeDiskStorageSync();
    const withArg = compat.getFreeDiskStorageSync('opportunistic');
    expect(typeof noArg).toBe('number');
    expect(noArg).toBeGreaterThan(0);
    expect(typeof withArg).toBe('number');
  });
});

describe('compat: documented stubs return RNDI-parity values', () => {
  test('getInstanceId / getInstanceIdSync return "unknown"', async () => {
    await expect(compat.getInstanceId()).resolves.toBe('unknown');
    expect(compat.getInstanceIdSync()).toBe('unknown');
  });

  test('getAppSetId returns the no-dependency RNDI value', async () => {
    await expect(compat.getAppSetId()).resolves.toEqual({
      id: 'unknown',
      scope: -1,
    });
  });

  test('getUserAgentSync returns empty placeholder', () => {
    expect(compat.getUserAgentSync()).toBe('');
  });

  test('getInstallReferrerSync returns "unknown" placeholder', () => {
    expect(compat.getInstallReferrerSync()).toBe('unknown');
  });
});

describe('compat: power state shape matches core', () => {
  test('getPowerState resolves with PowerState fields', async () => {
    const state = await compat.getPowerState();
    expect(typeof state).toBe('object');
    expect(typeof state.batteryLevel).toBe('number');
    expect(['unknown', 'unplugged', 'charging', 'full']).toContain(
      state.batteryState
    );
    expect(typeof state.lowPowerMode).toBe('boolean');
  });
});

describe('compat: passthrough async methods resolve to strings', () => {
  test('getIpAddress / getCarrier / getMacAddress', async () => {
    await expect(compat.getIpAddress()).resolves.toEqual(expect.any(String));
    await expect(compat.getCarrier()).resolves.toEqual(expect.any(String));
    const mac = await compat.getMacAddress();
    expect(typeof mac).toBe('string');
    if (Platform.OS === 'ios') {
      expect(mac).toBe('02:00:00:00:00:00');
    }
  });

  // Sync passthroughs must return the same string type as their async
  // counterparts. IP can change between calls so we only assert its type. The
  // MAC sync passthrough must equal core (a stable privacy-fixed value).
  test('sync passthroughs return strings; MAC matches core', () => {
    expect(typeof compat.getIpAddressSync()).toBe('string');
    expect(typeof compat.getCarrierSync()).toBe('string');
    expect(compat.getMacAddressSync()).toBe(DeviceInfoModule.getMacAddressSync());
  });

  // Regression: async getCarrier must return the SAME carrier as the sync
  // path. The iOS native getCarrier() async previously returned a hardcoded
  // '' while getCarrierSync() did the real CTTelephony query, so async callers
  // silently got an empty string. Both read the same 5s-cached value now.
  test('async getCarrier agrees with sync carrier', async () => {
    const asyncCarrier = await compat.getCarrier();
    expect(typeof asyncCarrier).toBe('string');
    expect(asyncCarrier).toBe(compat.getCarrierSync());
  });
});

describe('compat: default object aggregates named exports', () => {
  test('default object exposes named functions as methods', async () => {
    expect(typeof DeviceInfo.getModel).toBe('function');
    expect(DeviceInfo.getModel()).toBe(compat.getModel());
    await expect(DeviceInfo.getUniqueId()).resolves.toBe(
      await compat.getUniqueId()
    );
  });

  test('default object and named exports reference the same functions', () => {
    expect(DeviceInfo.getModel).toBe(compat.getModel);
    expect(DeviceInfo.getUniqueId).toBe(compat.getUniqueId);
  });

  test('DeviceInfo named export equals the default export', () => {
    expect(compat.DeviceInfo).toBe(DeviceInfo);
  });

  test('default object re-exposes hooks as methods', () => {
    expect(typeof DeviceInfo.useBatteryLevel).toBe('function');
    expect(typeof DeviceInfo.useIsHeadphonesConnected).toBe('function');
    expect(typeof DeviceInfo.useManufacturer).toBe('function');
  });
});
