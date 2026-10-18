import type {
  ComparisonResult,
  BenchmarkResult,
  PerformanceMetrics,
} from '../types';
import { ComparisonStatus } from '../types';

export function createComparison(
  nitro: BenchmarkResult,
  deviceInfo: BenchmarkResult
): ComparisonResult {
  const speedupMultiplier =
    nitro.avgTime > 0 ? deviceInfo.avgTime / nitro.avgTime : 1;

  const isSignificant =
    speedupMultiplier >= 2.0 && !nitro.error && !deviceInfo.error;

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

export function calculateMetrics(
  comparisons: ComparisonResult[]
): PerformanceMetrics {
  const validComparisons = comparisons.filter(
    (c) => c.status !== ComparisonStatus.ERROR
  );

  const significantComparisons = comparisons.filter((c) => c.isSignificant);

  const avgSpeedupMultiplier =
    significantComparisons.length > 0
      ? significantComparisons.reduce((sum, c) => sum + c.speedupMultiplier, 0) /
        significantComparisons.length
      : 1.0;

  const maxSpeedupMultiplier =
    validComparisons.length > 0
      ? Math.max(...validComparisons.map((c) => c.speedupMultiplier))
      : 1.0;

  const nitroPassCount = comparisons.filter((c) => c.nitroBenchmark.passed).length;
  const deviceInfoPassCount = comparisons.filter(
    (c) => c.deviceInfoBenchmark.passed
  ).length;

  const nitroPassRate =
    comparisons.length > 0 ? (nitroPassCount / comparisons.length) * 100 : 0;
  const deviceInfoPassRate =
    comparisons.length > 0 ? (deviceInfoPassCount / comparisons.length) * 100 : 0;

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

export function getStatusColor(status: ComparisonStatus): string {
  switch (status) {
    case ComparisonStatus.BOTH_PASSED:
      return '#34C759';
    case ComparisonStatus.NITRO_ONLY_PASSED:
      return '#007AFF';
    case ComparisonStatus.DEVICE_INFO_ONLY_PASSED:
      return '#FF9500';
    case ComparisonStatus.BOTH_FAILED:
      return '#FF3B30';
    case ComparisonStatus.ERROR:
      return '#8E8E93';
    default:
      return '#8E8E93';
  }
}

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
