describe('web airplane mode fallback', () => {
  const originalNavigator = Object.getOwnPropertyDescriptor(
    globalThis,
    'navigator'
  );

  afterEach(() => {
    if (originalNavigator) {
      Object.defineProperty(globalThis, 'navigator', originalNavigator);
    } else {
      Reflect.deleteProperty(globalThis, 'navigator');
    }
  });

  it.each([
    ['offline', { onLine: false }],
    ['online', { onLine: true }],
    ['missing onLine', {}],
    ['SSR', undefined],
  ])('returns false when %s', (_scenario, navigator) => {
    jest.resetModules();
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: navigator,
    });
    const { webDeviceInfo } = require('../DeviceInfo.web');
    expect(webDeviceInfo.getIsAirplaneMode()).toBe(false);
  });
});
