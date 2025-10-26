/**
 * Performance.now() Polyfill for React Native
 * Provides high-precision timing for benchmarks
 */

// Check if performance.now() is available, add polyfill if not
if (typeof global.performance === 'undefined') {
  global.performance = {} as any;
}

if (typeof global.performance.now === 'undefined') {
  const startTime = Date.now();
  global.performance.now = () => Date.now() - startTime;
}

// Export for explicit import if needed
export const performance = global.performance;
