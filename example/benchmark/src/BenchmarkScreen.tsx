/**
 * BenchmarkScreen.tsx
 * Performance benchmarking component for react-native-nitro-device-info
 *
 * Tests synchronous methods (<1ms target) and asynchronous methods (<100ms target)
 */

import { useState } from 'react';
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
import { createDeviceInfo } from 'react-native-nitro-device-info';

const deviceInfo = createDeviceInfo();

interface BenchmarkResult {
  methodName: string;
  avgTime: number;
  minTime: number;
  maxTime: number;
  iterations: number;
  passed: boolean;
  target: number;
}

interface BenchmarkResults {
  sync: BenchmarkResult[];
  async: BenchmarkResult[];
}

export default function BenchmarkScreen() {
  const [results, setResults] = useState<BenchmarkResults | null>(null);
  const [running, setRunning] = useState(false);

  const runSyncBenchmarks = (): BenchmarkResult[] => {
    const syncMethods = [
      { name: 'deviceId', fn: () => deviceInfo.deviceId },
      { name: 'brand', fn: () => deviceInfo.brand },
      { name: 'systemName', fn: () => deviceInfo.systemName },
      { name: 'systemVersion', fn: () => deviceInfo.systemVersion },
      { name: 'model', fn: () => deviceInfo.model },
      { name: 'deviceType', fn: () => deviceInfo.deviceType },
      { name: 'isTablet()', fn: () => deviceInfo.isTablet() },
      { name: 'hasNotch()', fn: () => deviceInfo.hasNotch() },
      { name: 'hasDynamicIsland()', fn: () => deviceInfo.hasDynamicIsland() },
    ];

    const syncResults: BenchmarkResult[] = [];
    const iterations = 1000; // Run each method 1000 times
    const target = 1; // <1ms target

    for (const method of syncMethods) {
      const times: number[] = [];

      // Warmup
      for (let i = 0; i < 100; i++) {
        method.fn();
      }

      // Benchmark
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        method.fn();
        const end = performance.now();
        times.push(end - start);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      syncResults.push({
        methodName: method.name,
        avgTime,
        minTime,
        maxTime,
        iterations,
        passed: avgTime < target,
        target,
      });
    }

    return syncResults;
  };

  const runAsyncBenchmarks = async (): Promise<BenchmarkResult[]> => {
    const asyncMethods = [
      { name: 'getUniqueId()', fn: () => deviceInfo.getUniqueId() },
      { name: 'getManufacturer()', fn: () => deviceInfo.getManufacturer() },
      { name: 'getTotalMemory()', fn: () => deviceInfo.getTotalMemory() },
      { name: 'getUsedMemory()', fn: () => deviceInfo.getUsedMemory() },
      {
        name: 'getFreeDiskStorage()',
        fn: () => deviceInfo.getFreeDiskStorage(),
      },
      { name: 'getBatteryLevel()', fn: () => deviceInfo.getBatteryLevel() },
      { name: 'getPowerState()', fn: () => deviceInfo.getPowerState() },
      { name: 'getVersion()', fn: () => deviceInfo.getVersion() },
      { name: 'getBuildNumber()', fn: () => deviceInfo.getBuildNumber() },
      { name: 'isCameraPresent()', fn: () => deviceInfo.isCameraPresent() },
    ];

    const asyncResults: BenchmarkResult[] = [];
    const iterations = 10; // Run each async method 10 times
    const target = 100; // <100ms target

    for (const method of asyncMethods) {
      const times: number[] = [];

      // Warmup
      await method.fn();

      // Benchmark
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await method.fn();
        const end = performance.now();
        times.push(end - start);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      asyncResults.push({
        methodName: method.name,
        avgTime,
        minTime,
        maxTime,
        iterations,
        passed: avgTime < target,
        target,
      });
    }

    return asyncResults;
  };

  const runAllBenchmarks = async () => {
    setRunning(true);
    try {
      console.log('Running synchronous benchmarks...');
      const syncResults = runSyncBenchmarks();

      console.log('Running asynchronous benchmarks...');
      const asyncResults = await runAsyncBenchmarks();

      setResults({
        sync: syncResults,
        async: asyncResults,
      });

      console.log('Benchmarks complete!');
    } catch (error) {
      console.error('Benchmark error:', error);
    } finally {
      setRunning(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Performance Benchmarks</Text>
          <Text style={styles.subtitle}>Nitro Module Performance Testing</Text>
        </View>

        {/* Run Button */}
        <TouchableOpacity
          style={[styles.runButton, running && styles.runButtonDisabled]}
          onPress={runAllBenchmarks}
          disabled={running}
          activeOpacity={0.7}
        >
          {running ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.runButtonText}>Run Benchmarks</Text>
          )}
        </TouchableOpacity>

        {/* Results */}
        {results && (
          <>
            {/* Synchronous Results */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Synchronous Methods (Target: &lt;1ms)
              </Text>
              <View style={styles.resultsHeader}>
                <Text style={[styles.headerText, styles.methodCol]}>
                  Method
                </Text>
                <Text style={[styles.headerText, styles.avgCol]}>Avg</Text>
                <Text style={[styles.headerText, styles.minCol]}>Min</Text>
                <Text style={[styles.headerText, styles.maxCol]}>Max</Text>
                <Text style={[styles.headerText, styles.statusCol]}>
                  Status
                </Text>
              </View>
              {results.sync.map((result, index) => (
                <BenchmarkRow key={index} result={result} />
              ))}
            </View>

            {/* Asynchronous Results */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Asynchronous Methods (Target: &lt;100ms)
              </Text>
              <View style={styles.resultsHeader}>
                <Text style={[styles.headerText, styles.methodCol]}>
                  Method
                </Text>
                <Text style={[styles.headerText, styles.avgCol]}>Avg</Text>
                <Text style={[styles.headerText, styles.minCol]}>Min</Text>
                <Text style={[styles.headerText, styles.maxCol]}>Max</Text>
                <Text style={[styles.headerText, styles.statusCol]}>
                  Status
                </Text>
              </View>
              {results.async.map((result, index) => (
                <BenchmarkRow key={index} result={result} />
              ))}
            </View>

            {/* Summary */}
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <Text style={styles.summaryText}>
                Sync Passed: {results.sync.filter((r) => r.passed).length}/
                {results.sync.length}
              </Text>
              <Text style={styles.summaryText}>
                Async Passed: {results.async.filter((r) => r.passed).length}/
                {results.async.length}
              </Text>
              <Text style={styles.summaryText}>
                Platform: {Platform.OS === 'ios' ? 'iOS' : 'Android'}
              </Text>
            </View>
          </>
        )}

        {/* Instructions */}
        {!results && !running && (
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Instructions</Text>
            <Text style={styles.instructionsText}>
              • Tap "Run Benchmarks" to test performance
            </Text>
            <Text style={styles.instructionsText}>
              • Synchronous methods target: &lt;1ms per call
            </Text>
            <Text style={styles.instructionsText}>
              • Asynchronous methods target: &lt;100ms per call
            </Text>
            <Text style={styles.instructionsText}>
              • Results show average, min, and max times
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BenchmarkRow({ result }: { result: BenchmarkResult }) {
  return (
    <View style={styles.resultRow}>
      <Text style={[styles.resultText, styles.methodCol]} numberOfLines={1}>
        {result.methodName}
      </Text>
      <Text style={[styles.resultText, styles.avgCol]}>
        {formatTime(result.avgTime)}
      </Text>
      <Text style={[styles.resultText, styles.minCol]}>
        {formatTime(result.minTime)}
      </Text>
      <Text style={[styles.resultText, styles.maxCol]}>
        {formatTime(result.maxTime)}
      </Text>
      <Text
        style={[
          styles.statusText,
          result.passed ? styles.passed : styles.failed,
        ]}
      >
        {result.passed ? '✓' : '✗'}
      </Text>
    </View>
  );
}

function formatTime(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(1)}μs`;
  }
  return `${ms.toFixed(1)}ms`;
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
    marginBottom: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  runButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
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
    backgroundColor: '#999',
  },
  runButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  resultsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E5EA',
    paddingBottom: 8,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
  },
  resultRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultText: {
    fontSize: 14,
    color: '#000',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  passed: {
    color: '#34C759',
  },
  failed: {
    color: '#FF3B30',
  },
  methodCol: {
    flex: 3,
  },
  avgCol: {
    flex: 1.5,
    textAlign: 'right',
  },
  minCol: {
    flex: 1.5,
    textAlign: 'right',
  },
  maxCol: {
    flex: 1.5,
    textAlign: 'right',
  },
  statusCol: {
    flex: 0.8,
    textAlign: 'center',
  },
  summary: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    color: '#666',
    marginVertical: 4,
  },
  instructions: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 15,
    color: '#666',
    marginVertical: 4,
  },
});
