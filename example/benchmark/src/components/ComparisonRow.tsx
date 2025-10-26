/**
 * ComparisonRow Component
 * Displays side-by-side performance comparison for a single method
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import type { ComparisonResult } from '../types';
import { formatTime } from '../utils/timer';
import { getStatusColor, getStatusLabel } from '../benchmarks/comparator';

interface Props {
  comparison: ComparisonResult;
}

export const ComparisonRow: React.FC<Props> = ({ comparison }) => {
  const { nitroBenchmark, deviceInfoBenchmark, speedupMultiplier, isSignificant, status } =
    comparison;

  const statusColor = getStatusColor(status);
  const hasError = nitroBenchmark.error || deviceInfoBenchmark.error;

  // Determine if method is async based on target (1ms = sync, 100ms = async)
  const isAsync = nitroBenchmark.target >= 100;
  const methodTypeBadgeColor = isAsync ? '#FF9500' : '#5856D6'; // Orange for async, Purple for sync

  return (
    <View style={styles.row}>
      {/* Method Name */}
      <View style={styles.methodColumn}>
        <Text style={styles.methodName} numberOfLines={1}>
          {comparison.methodName}
        </Text>
        <View style={styles.badgeContainer}>
          <Text style={[styles.typeBadge, { backgroundColor: methodTypeBadgeColor }]}>
            {isAsync ? 'ASYNC' : 'SYNC'}
          </Text>
          <Text style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            {getStatusLabel(status)}
          </Text>
        </View>
      </View>

      {/* Nitro Time */}
      <View style={styles.timeColumn}>
        <Text style={styles.timeLabel}>Nitro</Text>
        {nitroBenchmark.error ? (
          <Text style={styles.errorText}>Error</Text>
        ) : (
          <>
            <Text style={[styles.timeValue, nitroBenchmark.passed && styles.passedTime]}>
              {formatTime(nitroBenchmark.avgTime)}
            </Text>
            <Text style={styles.rangeText}>
              {formatTime(nitroBenchmark.minTime, 1)}-{formatTime(nitroBenchmark.maxTime, 1)}
            </Text>
          </>
        )}
      </View>

      {/* DeviceInfo Time */}
      <View style={styles.timeColumn}>
        <Text style={styles.timeLabel}>DeviceInfo</Text>
        {deviceInfoBenchmark.error ? (
          <Text style={styles.errorText}>Error</Text>
        ) : (
          <>
            <Text style={[styles.timeValue, deviceInfoBenchmark.passed && styles.passedTime]}>
              {formatTime(deviceInfoBenchmark.avgTime)}
            </Text>
            <Text style={styles.rangeText}>
              {formatTime(deviceInfoBenchmark.minTime, 1)}-{formatTime(deviceInfoBenchmark.maxTime, 1)}
            </Text>
          </>
        )}
      </View>

      {/* Speedup Multiplier */}
      <View style={styles.multiplierColumn}>
        {!hasError && (
          <>
            <Text style={[styles.multiplier, isSignificant && styles.significantMultiplier]}>
              {speedupMultiplier.toFixed(1)}x
            </Text>
            {isSignificant && <Text style={styles.significantLabel}>Significant</Text>}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  methodColumn: {
    flex: 2,
    marginRight: 12,
  },
  methodName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timeColumn: {
    flex: 1.5,
    alignItems: 'center',
    marginRight: 8,
  },
  timeLabel: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  passedTime: {
    color: '#34C759',
  },
  rangeText: {
    fontSize: 9,
    color: '#999999',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
  multiplierColumn: {
    flex: 1,
    alignItems: 'center',
  },
  multiplier: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  significantMultiplier: {
    color: '#34C759',
    fontSize: 18,
  },
  significantLabel: {
    fontSize: 8,
    color: '#34C759',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
