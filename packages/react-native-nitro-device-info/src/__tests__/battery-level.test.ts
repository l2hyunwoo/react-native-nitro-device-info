describe.each([
  ['ios', 0.2],
  ['android', 0.15],
] as const)('low battery on %s', (platform, threshold) => {
  it('only classifies valid readings below the platform threshold as low', () => {
    jest.resetModules();
    jest.doMock('react-native', () => ({ Platform: { OS: platform } }));
    const { isLowBatteryLevel, LOW_BATTERY_THRESHOLD } =
      require('../hooks/utils') as typeof import('../hooks/utils');

    expect(LOW_BATTERY_THRESHOLD).toBe(threshold);
    for (const level of [-1, -0.01, NaN, -Infinity, Infinity, 1.01]) {
      expect(isLowBatteryLevel(level)).toBe(false);
    }
    expect(isLowBatteryLevel(0)).toBe(true);
    expect(isLowBatteryLevel(threshold - 0.01)).toBe(true);
    expect(isLowBatteryLevel(threshold)).toBe(false);
    expect(isLowBatteryLevel(1)).toBe(false);
  });
});
