/**
 * High-Precision Benchmark Timer
 * Uses performance.now() for microsecond-precision timing
 */

import type { BenchmarkResult } from '../types';
import { LibraryType } from '../types';
import './performancePolyfill'; // Ensure performance.now() is available

/**
 * Statistics for a set of timing measurements
 */
interface TimingStats {
  avgTime: number;
  minTime: number;
  maxTime: number;
  stdDev: number;
}

/**
 * Run a benchmark with warmup iterations and multiple measurements
 *
 * @param methodName - Name of the method being benchmarked
 * @param fn - Function to benchmark (sync or async)
 * @param library - Which library is being benchmarked
 * @param iterations - Number of measurement iterations
 * @param target - Performance target in milliseconds
 * @param isAsync - Whether the function is asynchronous
 * @returns BenchmarkResult with timing statistics
 */
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

    // Measurement phase
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

    // Calculate statistics
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
    // Return failed result on error
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

/**
 * Calculate statistical measures from timing measurements
 *
 * @param times - Array of timing measurements in milliseconds
 * @returns Statistical summary
 */
function calculateStats(times: number[]): TimingStats {
  if (times.length === 0) {
    return { avgTime: 0, minTime: 0, maxTime: 0, stdDev: 0 };
  }

  const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  // Calculate standard deviation
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

/**
 * Format timing value for display
 *
 * @param ms - Time in milliseconds
 * @param precision - Number of decimal places (default: 2)
 * @returns Formatted string like "0.05ms" or "123.45ms"
 */
export function formatTime(ms: number, precision: number = 2): string {
  return `${ms.toFixed(precision)}ms`;
}

/**
 * Determine if a timing result is considered "fast" based on target
 *
 * @param avgTime - Average execution time
 * @param target - Target threshold
 * @returns true if performance is good (well under target)
 */
export function isFast(avgTime: number, target: number): boolean {
  return avgTime < target * 0.5; // Fast if under 50% of target
}

/**
 * Determine if a timing result is considered "acceptable" (passes target)
 *
 * @param avgTime - Average execution time
 * @param target - Target threshold
 * @returns true if performance meets target
 */
export function isAcceptable(avgTime: number, target: number): boolean {
  return avgTime < target;
}
