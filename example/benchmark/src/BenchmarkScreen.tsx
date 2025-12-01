/**
 * BenchmarkScreen.tsx
 * Performance comparison benchmarking between Nitro and react-native-device-info
 *
 * Displays side-by-side performance metrics with speedup multipliers
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
// @ts-ignore - react-native-device-info is a peer dependency that may not be installed during type checking
import DeviceInfo from 'react-native-device-info';
import { runBenchmark } from './utils/timer';
import { createComparison, calculateMetrics } from './benchmarks/comparator';
import { BENCHMARK_METHODS } from './config/benchmarkMethods';
import { runAllHookBenchmarks } from './benchmarks/hooks-benchmarks';
import type { HookBenchmarkResult } from './benchmarks/hooks-benchmarks';
import { ComparisonRow } from './components/ComparisonRow';
import { StatisticsPanel } from './components/StatisticsPanel';
import type { BenchmarkResult, ComparisonResult, PerformanceMetrics } from './types';
import { LibraryType } from './types';

export default function BenchmarkScreen() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [hookResults, setHookResults] = useState<HookBenchmarkResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [runningHooks, setRunningHooks] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [dependencyError, setDependencyError] = useState<string | null>(null);

  // Check if react-native-device-info is available
  React.useEffect(() => {
    try {
      if (!DeviceInfo || typeof DeviceInfo.getDeviceId !== 'function') {
        setDependencyError(
          'react-native-device-info is not properly installed. Please run:\n\n' +
            'cd example/benchmark\n' +
            'yarn add react-native-device-info\n' +
            'cd ios && pod install'
        );
      }
    } catch {
      setDependencyError(
        'Failed to load react-native-device-info. Ensure it is installed and linked correctly.'
      );
    }
  }, []);

  /**
   * Run benchmarks for both Nitro and react-native-device-info
   * Creates side-by-side comparisons with speedup metrics
   */
  const runAllBenchmarks = async () => {
    setRunning(true);
    setProgress({ current: 0, total: BENCHMARK_METHODS.length * 2 });

    try {
      console.log('Starting performance comparison benchmarks...');
      const comparisons: ComparisonResult[] = [];

      for (let i = 0; i < BENCHMARK_METHODS.length; i++) {
        const method = BENCHMARK_METHODS[i];
        if (!method) continue;

        console.log(`Benchmarking: ${method.name}`);

        try {
          // Benchmark Nitro implementation
          setProgress({ current: i * 2 + 1, total: BENCHMARK_METHODS.length * 2 });
          const nitroBenchmark = await runBenchmark(
            method.name,
            method.nitroFn,
            LibraryType.NITRO,
            method.iterations,
            method.target,
            method.isAsync
          );

          // Benchmark react-native-device-info implementation
          setProgress({ current: i * 2 + 2, total: BENCHMARK_METHODS.length * 2 });
          const deviceInfoBenchmark = await runBenchmark(
            method.name,
            method.deviceInfoFn,
            LibraryType.DEVICE_INFO,
            method.iterations,
            method.target,
            method.isAsync
          );

          // Create comparison
          const comparison = createComparison(nitroBenchmark, deviceInfoBenchmark);
          comparisons.push(comparison);

          console.log(
            `${method.name}: Nitro ${nitroBenchmark.avgTime.toFixed(3)}ms vs DeviceInfo ${deviceInfoBenchmark.avgTime.toFixed(3)}ms (${comparison.speedupMultiplier.toFixed(1)}x)`
          );
        } catch (error) {
          console.error(`Error benchmarking ${method.name}:`, error);
          // Create error comparison
          const errorBenchmark: BenchmarkResult = {
            methodName: method.name,
            library: LibraryType.NITRO,
            iterations: 0,
            avgTime: 0,
            minTime: 0,
            maxTime: 0,
            stdDev: 0,
            target: method.target,
            passed: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
          comparisons.push(
            createComparison(errorBenchmark, { ...errorBenchmark, library: LibraryType.DEVICE_INFO })
          );
        }
      }

      // Calculate aggregate metrics
      const performanceMetrics = calculateMetrics(comparisons);
      setMetrics(performanceMetrics);

      console.log('Benchmarks complete!');
      console.log(`Average speedup: ${performanceMetrics.avgSpeedupMultiplier.toFixed(2)}x`);
      console.log(`Max speedup: ${performanceMetrics.maxSpeedupMultiplier.toFixed(2)}x`);
      console.log(`Catchphrase: ${performanceMetrics.marketingCatchphrase}`);
    } catch (error) {
      console.error('Benchmark error:', error);
    } finally {
      setRunning(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  /**
   * Run React hooks performance benchmarks
   * Tests hook registration, cleanup, and callback latency
   */
  const runHooksBenchmarks = async () => {
    setRunningHooks(true);
    try {
      console.log('Starting hooks performance benchmarks...');
      const results = await runAllHookBenchmarks();
      setHookResults(results);
      console.log('Hooks benchmarks complete!');
      results.forEach((r) => {
        console.log(`${r.name}: ${r.value.toFixed(3)}${r.unit} (${r.passed ? 'PASS' : 'FAIL'})`);
      });
    } catch (error) {
      console.error('Hooks benchmark error:', error);
    } finally {
      setRunningHooks(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Performance Comparison</Text>
          <Text style={styles.subtitle}>Nitro vs react-native-device-info</Text>
          <Text style={styles.methodCount}>Testing {BENCHMARK_METHODS.length} methods</Text>
        </View>

        {/* Dependency Error Card */}
        {dependencyError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>❌ Dependency Missing</Text>
            <Text style={styles.errorText}>{dependencyError}</Text>
          </View>
        )}

        {/* Run Button */}
        <TouchableOpacity
          style={[styles.runButton, (running || dependencyError) && styles.runButtonDisabled]}
          onPress={runAllBenchmarks}
          disabled={running || !!dependencyError}
          activeOpacity={0.7}
        >
          {running ? (
            <View style={styles.runButtonContent}>
              <ActivityIndicator color="#FFF" />
              <Text style={styles.runButtonText}>
                Running... {progress.current}/{progress.total}
              </Text>
            </View>
          ) : (
            <Text style={styles.runButtonText}>Run Performance Comparison</Text>
          )}
        </TouchableOpacity>

        {/* Results */}
        {metrics && (
          <>
            {/* Statistics Panel */}
            <StatisticsPanel metrics={metrics} />

            {/* Comparisons Section */}
            <View style={styles.comparisonsSection}>
              <Text style={styles.sectionTitle}>Detailed Comparisons</Text>
              <View style={styles.comparisonsHeader}>
                <Text style={styles.headerHint}>
                  Green = Significant improvement (≥2x faster) • Blue = Passed target
                </Text>
              </View>

              {metrics.comparisons.map((comparison, index) => (
                <ComparisonRow key={`${comparison.methodName}-${index}`} comparison={comparison} />
              ))}
            </View>

            {/* Platform Info */}
            <View style={styles.platformInfo}>
              <Text style={styles.platformText}>Platform: {Platform.OS === 'ios' ? 'iOS' : 'Android'}</Text>
              <Text style={styles.platformSubtext}>
                Benchmark completed at {new Date(metrics.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          </>
        )}

        {/* Hooks Benchmarks Section */}
        <View style={styles.hooksSection}>
          <Text style={styles.sectionTitle}>React Hooks Performance</Text>
          <Text style={styles.hooksSectionSubtitle}>
            Validate hook registration, cleanup, and callback latency
          </Text>

          <TouchableOpacity
            style={[styles.hooksRunButton, runningHooks && styles.runButtonDisabled]}
            onPress={runHooksBenchmarks}
            disabled={runningHooks}
            activeOpacity={0.7}
          >
            {runningHooks ? (
              <View style={styles.runButtonContent}>
                <ActivityIndicator color="#FFF" />
                <Text style={styles.runButtonText}>Running hooks benchmarks...</Text>
              </View>
            ) : (
              <Text style={styles.runButtonText}>Run Hooks Benchmarks</Text>
            )}
          </TouchableOpacity>

          {hookResults && (
            <View style={styles.hookResultsContainer}>
              {hookResults.map((result, index) => (
                <View key={index} style={styles.hookResultRow}>
                  <View style={styles.hookResultHeader}>
                    <Text style={styles.hookResultName}>{result.name}</Text>
                    <View
                      style={[
                        styles.hookResultBadge,
                        result.passed ? styles.hookResultPass : styles.hookResultFail,
                      ]}
                    >
                      <Text style={styles.hookResultBadgeText}>
                        {result.passed ? 'PASS' : 'FAIL'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.hookResultDetails}>
                    <Text style={styles.hookResultValue}>
                      {result.value.toFixed(3)} {result.unit}
                    </Text>
                    <Text style={styles.hookResultThreshold}>
                      Threshold: {'<'}{result.threshold} {result.unit}
                    </Text>
                  </View>
                  {result.error && (
                    <Text style={styles.hookResultError}>{result.error}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Instructions */}
        {!metrics && !running && (
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>About Performance Comparison</Text>
            <Text style={styles.instructionsText}>
              • Tap "Run Performance Comparison" to benchmark both libraries
            </Text>
            <Text style={styles.instructionsText}>
              • Each method is tested multiple times for accuracy
            </Text>
            <Text style={styles.instructionsText}>
              • Sync methods target: {'<'}1ms | Async methods target: {'<'}100ms
            </Text>
            <Text style={styles.instructionsText}>
              • Speedup multiplier shows how many times faster Nitro is
            </Text>
            <Text style={styles.instructionsText}>
              • Significant improvements (≥2x) are highlighted in green
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 4,
  },
  methodCount: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '400',
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C62828',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  runButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  runButtonDisabled: {
    backgroundColor: '#999999',
  },
  runButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  comparisonsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    padding: 16,
    paddingBottom: 8,
  },
  comparisonsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  headerHint: {
    fontSize: 11,
    color: '#666666',
    fontStyle: 'italic',
  },
  platformInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  platformText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  platformSubtext: {
    fontSize: 12,
    color: '#999999',
  },
  instructions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666666',
    marginVertical: 4,
    lineHeight: 20,
  },
  // Hooks benchmark styles
  hooksSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hooksSectionSubtitle: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 16,
  },
  hooksRunButton: {
    backgroundColor: '#34C759',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  hookResultsContainer: {
    marginTop: 8,
  },
  hookResultRow: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  hookResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hookResultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  hookResultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  hookResultPass: {
    backgroundColor: '#34C759',
  },
  hookResultFail: {
    backgroundColor: '#FF3B30',
  },
  hookResultBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hookResultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hookResultValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  hookResultThreshold: {
    fontSize: 12,
    color: '#999999',
  },
  hookResultError: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
});
