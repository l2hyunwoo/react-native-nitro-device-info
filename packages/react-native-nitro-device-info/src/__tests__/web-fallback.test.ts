/**
 * Web fallback tests.
 *
 * Two concerns:
 * 1. `DeviceInfo.web.ts` — the pure-JS fallback used on web/SSR targets — never
 *    throws, satisfies the full `DeviceInfo` surface, and degrades honestly when
 *    a browser global is missing (the SSR case).
 * 2. The native `index.ts` singleton is lazy: importing it must NOT instantiate
 *    the Nitro HybridObject, so a bare server-side import (e.g. Next.js SSR that
 *    ignores the `browser` export condition) does not crash at module load.
 */

import { createDeviceInfo, webDeviceInfo } from '../DeviceInfo.web';

describe('web fallback: DeviceInfo.web', () => {
  it('createDeviceInfo() returns the shared singleton without throwing', () => {
    const instance = createDeviceInfo();
    expect(instance).toBe(webDeviceInfo);
    expect(createDeviceInfo()).toBe(instance);
  });

  it('returns honest constants for platform-only values', () => {
    expect(webDeviceInfo.deviceId).toBe('unknown');
    expect(webDeviceInfo.apiLevel).toBe(-1);
    expect(webDeviceInfo.androidId).toBe('unknown');
    expect(webDeviceInfo.isDeviceCompromised()).toBe(false);
    expect(webDeviceInfo.isTablet).toBe(false);
    expect(webDeviceInfo.supportedAbis).toEqual([]);
    expect(webDeviceInfo.getAvailableLocationProviders()).toEqual([]);
  });

  it('implements the HybridObject base members', () => {
    expect(webDeviceInfo.name).toBe('DeviceInfo');
    expect(webDeviceInfo.toString()).toBe('[HybridObject DeviceInfo]');
    expect(webDeviceInfo.equals(webDeviceInfo)).toBe(true);
    expect(webDeviceInfo.equals({} as typeof webDeviceInfo)).toBe(false);
    expect(() => webDeviceInfo.dispose()).not.toThrow();
  });

  it('returns a well-formed PowerState', () => {
    const ps = webDeviceInfo.getPowerState();
    expect(typeof ps.batteryLevel).toBe('number');
    expect(typeof ps.batteryState).toBe('string');
    expect(ps.lowPowerMode).toBe(false);
  });

  it('keeps Promise signatures and never rejects for fallbackable methods', async () => {
    await expect(webDeviceInfo.getIpAddress()).resolves.toBe('unknown');
    await expect(webDeviceInfo.getCarrier()).resolves.toBe('unknown');
    await expect(webDeviceInfo.verifyDeviceIntegrity()).resolves.toBe(false);
    await expect(webDeviceInfo.getFirstInstallTime()).resolves.toBe(-1);
    await expect(webDeviceInfo.isHeadphonesConnected()).resolves.toBe(false);
    await expect(typeof (await webDeviceInfo.getUserAgent())).toBe('string');
  });

  it('rejects getDeviceToken (Apple DeviceCheck has no web equivalent, mirrors native Android)', async () => {
    await expect(webDeviceInfo.getDeviceToken()).rejects.toThrow();
  });

  describe('SSR safety (no browser globals)', () => {
    const originalScreen = (globalThis as { screen?: unknown }).screen;

    afterEach(() => {
      (globalThis as { screen?: unknown }).screen = originalScreen;
    });

    it('does not throw when screen is undefined and reports a safe orientation', () => {
      (globalThis as { screen?: unknown }).screen = undefined;
      expect(() => webDeviceInfo.getIsLandscape()).not.toThrow();
      expect(webDeviceInfo.getIsLandscape()).toBe(false);
    });

    it('battery getters fall back when the Battery Status API is unavailable', () => {
      // No getBattery() in the test environment, so the cache stays empty.
      expect(webDeviceInfo.getBatteryLevel()).toBe(-1);
      expect(webDeviceInfo.getIsBatteryCharging()).toBe(false);
      expect(webDeviceInfo.getPowerState().batteryState).toBe('unknown');
    });
  });
});

describe('native entry: lazy instantiation (SSR import-safety)', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('importing the package does not call createHybridObject', () => {
    const createHybridObject = jest.fn(() => ({}));
    jest.doMock('react-native-nitro-modules', () => ({
      NitroModules: { createHybridObject },
    }));

    // Importing must not eagerly instantiate the native HybridObject.
    require('../index');
    expect(createHybridObject).not.toHaveBeenCalled();
  });

  it('first property access on the singleton triggers exactly one instantiation', () => {
    const fakeNative = { deviceId: 'iPhone14,2' };
    const createHybridObject = jest.fn(() => fakeNative);
    jest.doMock('react-native-nitro-modules', () => ({
      NitroModules: { createHybridObject },
    }));

    const { DeviceInfoModule } = require('../index');
    expect(createHybridObject).not.toHaveBeenCalled();

    expect(DeviceInfoModule.deviceId).toBe('iPhone14,2');
    expect(createHybridObject).toHaveBeenCalledTimes(1);

    // Subsequent access reuses the cached instance.
    void DeviceInfoModule.deviceId;
    expect(createHybridObject).toHaveBeenCalledTimes(1);
  });
});
