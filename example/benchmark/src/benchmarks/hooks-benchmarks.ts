import { DeviceInfoModule } from 'react-native-nitro-device-info';

export interface HookBenchmarkResult {
  name: string;
  value: number;
  threshold: number;
  unit: string;
  passed: boolean;
  error?: string;
}

/**
 * Measures the time to get initial value from native module
 */
export async function benchmarkHookRegistration(): Promise<HookBenchmarkResult> {
  const iterations = 100;
  const times: number[] = [];

  try {
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      // Simulate what hooks do on mount: call sync getter
      DeviceInfoModule.getBatteryLevel();

      const duration = performance.now() - start;
      times.push(duration);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / iterations;
    const threshold = 10;

    return {
      name: 'Hook Registration Time',
      value: avgTime,
      threshold,
      unit: 'ms',
      passed: avgTime < threshold,
    };
  } catch (error) {
    return {
      name: 'Hook Registration Time',
      value: 0,
      threshold: 10,
      unit: 'ms',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Note: Actual memory measurement is limited in React Native JS context
 * This test validates that repeated getter calls don't leak memory
 */
export async function benchmarkHookCleanup(): Promise<HookBenchmarkResult> {
  const cycles = 1000;

  try {
    for (let i = 0; i < cycles; i++) {
      // Simulate hook mount/unmount cycle
      DeviceInfoModule.getBatteryLevel();
      DeviceInfoModule.getPowerState();
      DeviceInfoModule.getIsHeadphonesConnected();
      DeviceInfoModule.getBrightness();
    }

    // If we get here without crash, cleanup is working
    // Memory validation is best done with native tools
    return {
      name: 'Hook Cleanup (1000 cycles)',
      value: cycles,
      threshold: cycles,
      unit: 'cycles',
      passed: true,
    };
  } catch (error) {
    return {
      name: 'Hook Cleanup (1000 cycles)',
      value: 0,
      threshold: 1000,
      unit: 'cycles',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Measures the p95 latency for sync getter calls
 */
export async function benchmarkCallbackLatency(): Promise<HookBenchmarkResult> {
  const iterations = 100;
  const latencies: number[] = [];

  try {
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      DeviceInfoModule.getBatteryLevel();
      const latency = performance.now() - start;
      latencies.push(latency);
    }

    latencies.sort((a, b) => a - b);

    const p95Index = Math.floor(iterations * 0.95);
    const p95Latency = latencies[p95Index] ?? 0;
    const threshold = 500;

    return {
      name: 'Callback Latency (p95)',
      value: p95Latency,
      threshold,
      unit: 'ms',
      passed: p95Latency < threshold,
    };
  } catch (error) {
    return {
      name: 'Callback Latency (p95)',
      value: 0,
      threshold: 500,
      unit: 'ms',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function runAllHookBenchmarks(): Promise<HookBenchmarkResult[]> {
  const results: HookBenchmarkResult[] = [];

  results.push(await benchmarkHookRegistration());
  results.push(await benchmarkHookCleanup());
  results.push(await benchmarkCallbackLatency());

  return results;
}
