/**
 * HooksDemo Screen
 *
 * Demonstrates all React hooks for device info monitoring with real-time updates.
 * Shows battery, headphone, and brightness status with last update timestamps.
 */

import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  SafeAreaView,
} from 'react-native';
import {
  useBatteryLevel,
  useBatteryLevelIsLow,
  usePowerState,
  useIsHeadphonesConnected,
  useIsWiredHeadphonesConnected,
  useIsBluetoothHeadphonesConnected,
  useBrightness,
} from 'react-native-nitro-device-info';

interface TimestampedValue<T> {
  value: T;
  lastUpdated: Date;
}

function useTimestampedValue<T>(value: T): TimestampedValue<T> {
  const [state, setState] = useState<TimestampedValue<T>>({
    value,
    lastUpdated: new Date(),
  });

  useEffect(() => {
    if (value !== state.value) {
      setState({
        value,
        lastUpdated: new Date(),
      });
    }
  }, [value]);

  return state;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString();
}

function formatPercent(value: number | null): string {
  if (value === null) return 'Loading...';
  if (value < 0) return 'N/A';
  return `${Math.round(value * 100)}%`;
}

// Card component for sections
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

// Row component for displaying values
function Row({
  label,
  value,
  timestamp,
}: {
  label: string;
  value: string;
  timestamp?: Date;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      {timestamp && (
        <Text style={styles.timestamp}>Updated: {formatTime(timestamp)}</Text>
      )}
    </View>
  );
}

// Alert component for warnings
function Alert({ text }: { text: string }) {
  return (
    <View style={styles.alert}>
      <Text style={styles.alertText}>{text}</Text>
    </View>
  );
}

// Progress bar component for brightness
function ProgressBar({ value }: { value: number }) {
  const percentage = Math.max(0, Math.min(100, value * 100));
  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBar, { width: `${percentage}%` }]} />
    </View>
  );
}

export default function HooksDemo() {
  // Battery hooks
  const batteryLevel = useBatteryLevel();
  const lowBattery = useBatteryLevelIsLow();
  const powerState = usePowerState();

  // Headphone hooks
  const headphones = useIsHeadphonesConnected();
  const wiredHeadphones = useIsWiredHeadphonesConnected();
  const bluetoothHeadphones = useIsBluetoothHeadphonesConnected();

  // Display hooks
  const brightness = useBrightness();

  // Track timestamps
  const batteryTs = useTimestampedValue(batteryLevel);
  const powerStateTs = useTimestampedValue(powerState);
  const headphonesTs = useTimestampedValue(headphones);
  const brightnessTs = useTimestampedValue(brightness);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>React Hooks Demo</Text>
        <Text style={styles.subtitle}>Real-time device monitoring</Text>

        {/* Battery Section */}
        <Card title="🔋 Battery">
          <Row
            label="Level"
            value={formatPercent(batteryLevel)}
            timestamp={batteryTs.lastUpdated}
          />
          <Row
            label="State"
            value={powerState.batteryState ?? 'unknown'}
            timestamp={powerStateTs.lastUpdated}
          />
          <Row
            label="Low Power Mode"
            value={powerState.lowPowerMode ? 'Yes' : 'No'}
          />
          {lowBattery !== null && (
            <Alert text={`⚠️ Low Battery Warning: ${formatPercent(lowBattery)}`} />
          )}
        </Card>

        {/* Audio Output Section */}
        <Card title="🎧 Audio Output">
          <Row
            label="Any Headphones"
            value={headphones ? 'Connected' : 'Disconnected'}
            timestamp={headphonesTs.lastUpdated}
          />
          <Row
            label="Wired"
            value={wiredHeadphones ? 'Yes' : 'No'}
          />
          <Row
            label="Bluetooth"
            value={bluetoothHeadphones ? 'Yes' : 'No'}
          />
        </Card>

        {/* Display Section */}
        <Card title="📱 Display">
          {Platform.OS === 'ios' ? (
            <>
              <Row
                label="Brightness"
                value={formatPercent(brightness)}
                timestamp={brightnessTs.lastUpdated}
              />
              {brightness !== null && brightness >= 0 && (
                <ProgressBar value={brightness} />
              )}
            </>
          ) : (
            <Row label="Brightness" value="Not supported on Android" />
          )}
        </Card>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Values update automatically as device state changes.
          </Text>
          <Text style={styles.infoText}>
            Try plugging in headphones or changing brightness to see updates.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  row: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  rowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 15,
    color: '#666',
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  alert: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  alertText: {
    color: '#856404',
    fontWeight: '500',
    fontSize: 14,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  infoSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1565c0',
    marginBottom: 4,
  },
});
