/**
 * Signature/shape parity tests for the RNDI compatibility layer.
 *
 * The native module is mocked in `jest.setup.js`; these tests assert that the
 * compat surface matches `react-native-device-info`'s public shapes.
 */

import DeviceInfo from '../compat';
import * as compat from '../compat';

describe('compat: async getters return Promises', () => {
  it('getUniqueId resolves to the core uniqueId string', async () => {
    const result = compat.getUniqueId();
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(
      'FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9'
    );
  });

  it('getManufacturer resolves to the core manufacturer', async () => {
    await expect(compat.getManufacturer()).resolves.toBe('Apple');
  });

  it('getBatteryLevel resolves to a number', async () => {
    const value = await compat.getBatteryLevel();
    expect(typeof value).toBe('number');
    expect(value).toBe(0.75);
  });

  it('isEmulator resolves to a boolean', async () => {
    await expect(compat.isEmulator()).resolves.toBe(true);
  });
});

describe('compat: sync variants return bare values', () => {
  it('getUniqueIdSync returns a string, not a Promise', () => {
    const value = compat.getUniqueIdSync();
    expect(value).not.toBeInstanceOf(Promise);
    expect(value).toBe('FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9');
  });

  it('isEmulatorSync returns a bare boolean', () => {
    expect(compat.isEmulatorSync()).toBe(true);
  });

  it('getManufacturerSync returns a bare string', () => {
    expect(compat.getManufacturerSync()).toBe('Apple');
  });
});

describe('compat: property getters expose core readonly values as functions', () => {
  it('getModel / getBrand / getDeviceId', () => {
    expect(compat.getModel()).toBe('iPhone 13 Pro');
    expect(compat.getBrand()).toBe('Apple');
    expect(compat.getDeviceId()).toBe('iPhone14,2');
  });

  it('getVersion / getBuildNumber / getBundleId / getReadableVersion', () => {
    expect(compat.getVersion()).toBe('1.2.3');
    expect(compat.getBuildNumber()).toBe('42');
    expect(compat.getBundleId()).toBe('com.example.app');
    expect(compat.getReadableVersion()).toBe('1.2.3.42');
  });
});

describe('compat: renamed methods are aliased', () => {
  it('hasNotch maps to core getHasNotch', () => {
    expect(compat.hasNotch()).toBe(true);
  });

  it('hasDynamicIsland maps to core getHasDynamicIsland', () => {
    expect(compat.hasDynamicIsland()).toBe(true);
  });

  it('isBatteryCharging (async) and isBatteryChargingSync map to core', async () => {
    await expect(compat.isBatteryCharging()).resolves.toBe(true);
    expect(compat.isBatteryChargingSync()).toBe(true);
  });

  it('isAirplaneMode wraps; isAirplaneModeSync renames', async () => {
    await expect(compat.isAirplaneMode()).resolves.toBe(false);
    expect(compat.isAirplaneModeSync()).toBe(false);
  });
});

describe('compat: location providers transform array -> map', () => {
  it('getAvailableLocationProviders resolves to a map shape', async () => {
    const providers = await compat.getAvailableLocationProviders();
    expect(providers).toEqual({ gps: true, network: true });
    expect(Array.isArray(providers)).toBe(false);
  });

  it('getAvailableLocationProvidersSync returns a map shape', () => {
    expect(compat.getAvailableLocationProvidersSync()).toEqual({
      gps: true,
      network: true,
    });
  });
});

describe('compat: getFreeDiskStorage accepts and ignores storageType', () => {
  it('async variant does not throw with an argument', async () => {
    await expect(compat.getFreeDiskStorage('important')).resolves.toBe(
      51539607552
    );
  });

  it('sync variant does not throw with an argument', () => {
    expect(compat.getFreeDiskStorageSync('opportunistic')).toBe(51539607552);
  });

  it('both work with no argument', async () => {
    await expect(compat.getFreeDiskStorage()).resolves.toBe(51539607552);
    expect(compat.getFreeDiskStorageSync()).toBe(51539607552);
  });
});

describe('compat: documented stubs', () => {
  it('getInstanceId / getInstanceIdSync return "unknown"', async () => {
    await expect(compat.getInstanceId()).resolves.toBe('unknown');
    expect(compat.getInstanceIdSync()).toBe('unknown');
  });

  it('getAppSetId returns RNDI no-dependency value', async () => {
    await expect(compat.getAppSetId()).resolves.toEqual({
      id: 'unknown',
      scope: -1,
    });
  });

  it('getUserAgentSync returns empty placeholder', () => {
    expect(compat.getUserAgentSync()).toBe('');
  });

  it('getInstallReferrerSync returns "unknown" placeholder', () => {
    expect(compat.getInstallReferrerSync()).toBe('unknown');
  });
});

describe('compat: power state shape', () => {
  it('getPowerState resolves with PowerState fields', async () => {
    const state = await compat.getPowerState();
    expect(state).toEqual({
      batteryLevel: 0.75,
      batteryState: 'charging',
      lowPowerMode: false,
    });
  });
});

describe('compat: passthrough async methods', () => {
  it('getIpAddress / getCarrier / getMacAddress / getDeviceToken', async () => {
    await expect(compat.getIpAddress()).resolves.toBe('192.168.1.100');
    await expect(compat.getCarrier()).resolves.toBe('Verizon');
    await expect(compat.getMacAddress()).resolves.toBe(
      '02:00:00:00:00:00'
    );
    await expect(compat.getDeviceToken()).resolves.toBe('device-token');
  });

  it('sync passthroughs', () => {
    expect(compat.getIpAddressSync()).toBe('192.168.1.100');
    expect(compat.getCarrierSync()).toBe('Verizon');
    expect(compat.getMacAddressSync()).toBe('02:00:00:00:00:00');
  });
});

describe('compat: default object is callable', () => {
  it('exposes named functions as methods', async () => {
    expect(typeof DeviceInfo.getModel).toBe('function');
    expect(DeviceInfo.getModel()).toBe('iPhone 13 Pro');
    expect(DeviceInfo.getBrand()).toBe('Apple');
    await expect(DeviceInfo.getUniqueId()).resolves.toBe(
      'FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9'
    );
  });

  it('re-exposes hooks as methods', () => {
    expect(typeof DeviceInfo.useBatteryLevel).toBe('function');
    expect(typeof DeviceInfo.useIsHeadphonesConnected).toBe('function');
    expect(typeof DeviceInfo.useManufacturer).toBe('function');
  });

  it('default object and named exports reference the same functions', () => {
    expect(DeviceInfo.getModel).toBe(compat.getModel);
    expect(DeviceInfo.getUniqueId).toBe(compat.getUniqueId);
  });

  it('exposes DeviceInfo as a named export equal to the default', () => {
    expect(compat.DeviceInfo).toBe(DeviceInfo);
  });
});

describe('compat: hooks are exported', () => {
  it('exports all 12 RNDI hooks as named functions', () => {
    const hookNames = [
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

    for (const name of hookNames) {
      expect(typeof (compat as Record<string, unknown>)[name]).toBe(
        'function'
      );
    }
  });
});
