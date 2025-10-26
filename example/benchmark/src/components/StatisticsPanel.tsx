/**
 * StatisticsPanel Component
 * Displays aggregate performance metrics and marketing catchphrase
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import type { PerformanceMetrics } from '../types';
import { PerformanceMultiplier } from './PerformanceMultiplier';

interface Props {
  metrics: PerformanceMetrics;
}

export const StatisticsPanel: React.FC<Props> = ({ metrics }) => {
  const {
    totalMethods,
    successfulComparisons,
    avgSpeedupMultiplier,
    maxSpeedupMultiplier,
    nitroPassRate,
    deviceInfoPassRate,
    marketingCatchphrase,
  } = metrics;

  const significantCount = metrics.comparisons.filter((c) => c.isSignificant).length;

  return (
    <View style={styles.panel}>
      {/* Marketing Catchphrase */}
      <View style={styles.catchphraseContainer}>
        <Text style={styles.catchphrase}>{marketingCatchphrase}</Text>
      </View>

      {/* Key Metrics Grid */}
      <View style={styles.metricsGrid}>
        {/* Average Speedup */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Average Speedup</Text>
          <PerformanceMultiplier
            speedupMultiplier={avgSpeedupMultiplier}
            isSignificant={avgSpeedupMultiplier >= 2.0}
            size="large"
          />
          <Text style={styles.metricSubtext}>
            {significantCount} significant improvement{significantCount !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Max Speedup */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Max Speedup</Text>
          <PerformanceMultiplier
            speedupMultiplier={maxSpeedupMultiplier}
            isSignificant={maxSpeedupMultiplier >= 2.0}
            size="large"
          />
          <Text style={styles.metricSubtext}>Best performance gain</Text>
        </View>
      </View>

      {/* Pass Rates */}
      <View style={styles.passRatesContainer}>
        <Text style={styles.sectionTitle}>Pass Rates (Meeting Target Times)</Text>
        <View style={styles.passRatesGrid}>
          {/* Nitro Pass Rate */}
          <View style={styles.passRateCard}>
            <Text style={styles.libraryLabel}>Nitro</Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  styles.nitroProgressBar,
                  { width: `${nitroPassRate}%` },
                ]}
              />
            </View>
            <Text style={styles.percentageText}>{nitroPassRate.toFixed(1)}%</Text>
            <Text style={styles.passRateSubtext}>
              {Math.round((nitroPassRate / 100) * totalMethods)}/{totalMethods} passed
            </Text>
          </View>

          {/* DeviceInfo Pass Rate */}
          <View style={styles.passRateCard}>
            <Text style={styles.libraryLabel}>DeviceInfo</Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  styles.deviceInfoProgressBar,
                  { width: `${deviceInfoPassRate}%` },
                ]}
              />
            </View>
            <Text style={styles.percentageText}>{deviceInfoPassRate.toFixed(1)}%</Text>
            <Text style={styles.passRateSubtext}>
              {Math.round((deviceInfoPassRate / 100) * totalMethods)}/{totalMethods} passed
            </Text>
          </View>
        </View>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Methods Tested:</Text>
          <Text style={styles.summaryValue}>{totalMethods}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Successful Comparisons:</Text>
          <Text style={styles.summaryValue}>{successfulComparisons}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  catchphraseContainer: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  catchphrase: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  metricSubtext: {
    fontSize: 10,
    color: '#999999',
    marginTop: 4,
    textAlign: 'center',
  },
  passRatesContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  passRatesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passRateCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  libraryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 6,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  nitroProgressBar: {
    backgroundColor: '#34C759',
  },
  deviceInfoProgressBar: {
    backgroundColor: '#007AFF',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  passRateSubtext: {
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
    marginTop: 2,
  },
  summaryContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
