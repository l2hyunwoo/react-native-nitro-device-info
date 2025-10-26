/**
 * Benchmark Comparison Calculator
 * Compares Nitro vs react-native-device-info performance and generates metrics
 */

import type {
  ComparisonResult,
  BenchmarkResult,
  PerformanceMetrics,
} from '../types';
import { ComparisonStatus } from '../types';

/**
 * Create a comparison result from two benchmark results
 *
 * @param nitro - Benchmark result for Nitro implementation
 * @param deviceInfo - Benchmark result for react-native-device-info
 * @returns Comparison with speedup multiplier and status
 */
export function createComparison(
  nitro: BenchmarkResult,
  deviceInfo: BenchmarkResult
): ComparisonResult {
  // Calculate speedup multiplier (how many times faster Nitro is)
  const speedupMultiplier =
    nitro.avgTime > 0 ? deviceInfo.avgTime / nitro.avgTime : 1;

  // Consider significant if 2x or better AND both completed successfully
  const isSignificant =
    speedupMultiplier >= 2.0 && !nitro.error && !deviceInfo.error;

  // Determine comparison status
  let status: ComparisonStatus;
  if (nitro.error || deviceInfo.error) {
    status = ComparisonStatus.ERROR;
  } else if (nitro.passed && deviceInfo.passed) {
    status = ComparisonStatus.BOTH_PASSED;
  } else if (nitro.passed && !deviceInfo.passed) {
    status = ComparisonStatus.NITRO_ONLY_PASSED;
  } else if (!nitro.passed && deviceInfo.passed) {
    status = ComparisonStatus.DEVICE_INFO_ONLY_PASSED;
  } else {
    status = ComparisonStatus.BOTH_FAILED;
  }

  return {
    methodName: nitro.methodName,
    nitroBenchmark: nitro,
    deviceInfoBenchmark: deviceInfo,
    speedupMultiplier,
    isSignificant,
    status,
  };
}

/**
 * Calculate aggregate performance metrics from all comparisons
 *
 * @param comparisons - Array of comparison results
 * @returns Performance metrics including averages and marketing catchphrase
 */
export function calculateMetrics(
  comparisons: ComparisonResult[]
): PerformanceMetrics {
  // Filter out error comparisons for calculations
  const validComparisons = comparisons.filter(
    (c) => c.status !== ComparisonStatus.ERROR
  );

  // Filter significant improvements (>2x) for average calculation
  const significantComparisons = comparisons.filter((c) => c.isSignificant);

  // Calculate average speedup (only from significant improvements)
  const avgSpeedupMultiplier =
    significantComparisons.length > 0
      ? significantComparisons.reduce((sum, c) => sum + c.speedupMultiplier, 0) /
        significantComparisons.length
      : 1.0;

  // Calculate maximum speedup across all methods
  const maxSpeedupMultiplier =
    validComparisons.length > 0
      ? Math.max(...validComparisons.map((c) => c.speedupMultiplier))
      : 1.0;

  // Calculate pass rates
  const nitroPassCount = comparisons.filter((c) => c.nitroBenchmark.passed).length;
  const deviceInfoPassCount = comparisons.filter(
    (c) => c.deviceInfoBenchmark.passed
  ).length;

  const nitroPassRate =
    comparisons.length > 0 ? (nitroPassCount / comparisons.length) * 100 : 0;
  const deviceInfoPassRate =
    comparisons.length > 0 ? (deviceInfoPassCount / comparisons.length) * 100 : 0;

  // Generate marketing catchphrase
  const marketingCatchphrase = generateMarketingCatchphrase(
    avgSpeedupMultiplier,
    maxSpeedupMultiplier,
    significantComparisons.length
  );

  return {
    comparisons,
    totalMethods: comparisons.length,
    successfulComparisons: validComparisons.length,
    avgSpeedupMultiplier,
    maxSpeedupMultiplier,
    nitroPassRate,
    deviceInfoPassRate,
    marketingCatchphrase,
    timestamp: Date.now(),
  };
}

/**
 * Generate marketing-ready catchphrase based on performance data
 *
 * @param avgSpeedup - Average speedup multiplier
 * @param maxSpeedup - Maximum speedup multiplier
 * @param significantCount - Number of methods with significant improvements
 * @returns Marketing catchphrase string
 */
function generateMarketingCatchphrase(
  avgSpeedup: number,
  maxSpeedup: number,
  significantCount: number
): string {
  if (avgSpeedup >= 2.0 && significantCount > 0) {
    return `⚡ Get device info up to ${maxSpeedup.toFixed(1)}x faster with zero-overhead JSI`;
  } else if (maxSpeedup >= 2.0) {
    return `⚡ Up to ${maxSpeedup.toFixed(1)}x faster on key operations with Nitro`;
  } else {
    return 'Performance comparable to react-native-device-info';
  }
}

/**
 * Get comparison status color for UI display
 *
 * @param status - Comparison status enum
 * @returns Color string for UI (#hex format)
 */
export function getStatusColor(status: ComparisonStatus): string {
  switch (status) {
    case ComparisonStatus.BOTH_PASSED:
      return '#34C759'; // Green
    case ComparisonStatus.NITRO_ONLY_PASSED:
      return '#007AFF'; // Blue
    case ComparisonStatus.DEVICE_INFO_ONLY_PASSED:
      return '#FF9500'; // Orange
    case ComparisonStatus.BOTH_FAILED:
      return '#FF3B30'; // Red
    case ComparisonStatus.ERROR:
      return '#8E8E93'; // Gray
    default:
      return '#8E8E93';
  }
}

/**
 * Get comparison status label for UI display
 *
 * @param status - Comparison status enum
 * @returns Human-readable label
 */
export function getStatusLabel(status: ComparisonStatus): string {
  switch (status) {
    case ComparisonStatus.BOTH_PASSED:
      return 'Both Passed';
    case ComparisonStatus.NITRO_ONLY_PASSED:
      return 'Nitro Passed';
    case ComparisonStatus.DEVICE_INFO_ONLY_PASSED:
      return 'DeviceInfo Passed';
    case ComparisonStatus.BOTH_FAILED:
      return 'Both Failed';
    case ComparisonStatus.ERROR:
      return 'Error';
    default:
      return 'Unknown';
  }
}
