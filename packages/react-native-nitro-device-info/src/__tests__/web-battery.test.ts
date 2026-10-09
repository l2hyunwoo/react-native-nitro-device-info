import type { webDeviceInfo as WebDeviceInfo } from '../DeviceInfo.web';

describe('web battery readings', () => {
  const originalNavigator = Object.getOwnPropertyDescriptor(
    globalThis,
    'navigator'
  );

  beforeEach(() => jest.resetModules());

  afterEach(() => {
    if (originalNavigator) {
      Object.defineProperty(globalThis, 'navigator', originalNavigator);
    } else {
      Reflect.deleteProperty(globalThis, 'navigator');
    }
  });

  function load(navigator: unknown): typeof WebDeviceInfo {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: navigator,
    });
    return require('../DeviceInfo.web').webDeviceInfo;
  }

  function expectUnavailable(device: typeof WebDeviceInfo) {
    expect(device.getBatteryLevel()).toBe(-1);
    expect(device.getIsBatteryCharging()).toBe(false);
    expect(device.getPowerState()).toEqual({
      batteryLevel: -1,
      batteryState: 'unknown',
      lowPowerMode: false,
    });
    expect(device.isLowBatteryLevel(0.2)).toBe(false);
  }

  it('reads later level and charging changes from the resolved BatteryManager', async () => {
    const battery = { level: 0.8, charging: false };
    const getBattery = jest.fn(() => Promise.resolve(battery));
    const nav = { getBattery };
    const device = load(nav);
    expectUnavailable(device);
    await Promise.resolve();

    expect(device.getBatteryLevel()).toBe(0.8);
    expect(device.getIsBatteryCharging()).toBe(false);
    expect(device.getPowerState().batteryState).toBe('unplugged');
    expect(device.isLowBatteryLevel(0.2)).toBe(false);

    battery.level = 0.1;
    expect(device.getBatteryLevel()).toBe(0.1);
    expect(device.getPowerState().batteryLevel).toBe(0.1);
    expect(device.isLowBatteryLevel(0.2)).toBe(true);
    expect(device.isLowBatteryLevel(0.1)).toBe(false);

    battery.charging = true;
    expect(device.getIsBatteryCharging()).toBe(true);
    expect(device.getPowerState().batteryState).toBe('charging');

    battery.level = 1;
    expect(device.getPowerState()).toEqual({
      batteryLevel: 1,
      batteryState: 'full',
      lowPowerMode: false,
    });
    expect(device.isLowBatteryLevel(0.2)).toBe(false);

    battery.charging = false;
    expect(device.getIsBatteryCharging()).toBe(false);
    expect(device.getPowerState().batteryState).toBe('unplugged');
    expect(getBattery).toHaveBeenCalledTimes(1);
    expect(getBattery.mock.contexts[0]).toBe(nav);
  });

  it.each([undefined, {}, { getBattery: false }])(
    'uses fallback values for an unavailable API (%p)',
    async nav => {
      const device = load(nav);
      await Promise.resolve();
      expectUnavailable(device);
    }
  );

  it('uses fallback values when the request rejects', async () => {
    const device = load({
      getBattery: () => Promise.reject(new Error('denied')),
    });
    await Promise.resolve();
    await Promise.resolve();
    expectUnavailable(device);
  });

  it('uses fallback values when the request throws synchronously', () => {
    const device = load({
      getBattery: () => {
        throw new Error('unsupported');
      },
    });
    expectUnavailable(device);
  });
});
