import type { BenchmarkResult } from '../types';
import { LibraryType } from '../types';
import './performancePolyfill'; // Ensure performance.now() is available

interface TimingStats {
  avgTime: number;
  minTime: number;
  maxTime: number;
  stdDev: number;
}

export async function runBenchmark(
  methodName: string,
  fn: () => any | Promise<any>,
  library: LibraryType,
  iterations: number,
  target: number,
  isAsync: boolean
): Promise<BenchmarkResult> {
  try {
    // Warmup phase: Allow JS engine to optimize
    const WARMUP_ITERATIONS = 100;
    for (let i = 0; i < WARMUP_ITERATIONS; i++) {
      if (isAsync) {
        await fn();
      } else {
        fn();
      }
    }

    const times: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      if (isAsync) {
        await fn();
      } else {
        fn();
      }

      const end = performance.now();
      times.push(end - start);
    }

    const stats = calculateStats(times);

    return {
      methodName,
      library,
      iterations,
      avgTime: stats.avgTime,
      minTime: stats.minTime,
      maxTime: stats.maxTime,
      stdDev: stats.stdDev,
      target,
      passed: stats.avgTime < target,
    };
  } catch (error) {
    return {
      methodName,
      library,
      iterations: 0,
      avgTime: 0,
      minTime: 0,
      maxTime: 0,
      stdDev: 0,
      target,
      passed: false,
      error: error instanceof Error ? error.message : 'Benchmark failed',
    };
  }
}

function calculateStats(times: number[]): TimingStats {
  if (times.length === 0) {
    return { avgTime: 0, minTime: 0, maxTime: 0, stdDev: 0 };
  }

  const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  const squareDiffs = times.map((time) => Math.pow(time - avgTime, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, sq) => sum + sq, 0) / times.length;
  const stdDev = Math.sqrt(avgSquareDiff);

  return {
    avgTime,
    minTime,
    maxTime,
    stdDev,
  };
}

export function formatTime(ms: number, precision: number = 2): string {
  return `${ms.toFixed(precision)}ms`;
}

export function isFast(avgTime: number, target: number): boolean {
  return avgTime < target * 0.5; // Fast if under 50% of target
}

export function isAcceptable(avgTime: number, target: number): boolean {
  return avgTime < target;
}
