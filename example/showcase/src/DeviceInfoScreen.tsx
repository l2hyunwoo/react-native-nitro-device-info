/**
 * DeviceInfoScreen.tsx
 * Main screen displaying comprehensive device information
 */

import React, { useEffect, useState } from 'react';
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

// Create device info instance
const deviceInfo = createDeviceInfo();

export default function DeviceInfoScreen() {
  // Synchronous data
  const [_, setRefreshKey] = useState(0);

  // These values are recomputed on each render when refreshKey changes
  const uniqueId = deviceInfo.getUniqueId();
  const manufacturer = deviceInfo.getManufacturer();
  const batteryLevel = deviceInfo.getBatteryLevel();
  const appVersion = deviceInfo.getVersion();

  const isBatteryCharging = deviceInfo.isBatteryCharging();
  const powerState = deviceInfo.getPowerState();

  // Async data - still requires state management (truly async I/O operations)
  const [totalMemory, setTotalMemory] = useState<number>(0);
  const [freeStorage, setFreeStorage] = useState<number>(0);
  const [buildNumber, setBuildNumber] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAsyncDeviceInfo();
  }, []);

  const loadAsyncDeviceInfo = async () => {
    try {
      setLoading(true);

      // Only load truly async device information (I/O operations)
      const [memory, storage, build] = await Promise.all([
        deviceInfo.getTotalMemory(),
        deviceInfo.getFreeDiskStorage(),
        deviceInfo.getBuildNumber(),
      ]);

      setTotalMemory(memory);
      setFreeStorage(storage);
      setBuildNumber(build);
    } catch (error) {
      console.error('Error loading device info:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSyncData = () => {
    // Force re-render to get fresh synchronous values (instant!)
    setRefreshKey((prev) => prev + 1);
  };

  const formatBytes = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading device information...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Device Information</Text>
          <Text style={styles.subtitle}>react-native-nitro-device-info</Text>
        </View>

        {/* Device Identity Section */}
        <Section title="Device Identity">
          <InfoRow label="Device ID" value={deviceInfo.deviceId} />
          <InfoRow label="Brand" value={deviceInfo.brand} />
          <InfoRow label="Manufacturer" value={manufacturer} />
          <InfoRow label="Model" value={deviceInfo.model} />
          <InfoRow
            label="System"
            value={`${deviceInfo.systemName} ${deviceInfo.systemVersion}`}
          />
          <InfoRow label="Device Type" value={deviceInfo.deviceType} />
          <InfoRow
            label="Unique ID"
            value={uniqueId.substring(0, 20) + '...'}
          />
        </Section>

        {/* Device Capabilities Section */}
        <Section title="Device Capabilities">
          <InfoRow
            label="Is Tablet"
            value={deviceInfo.isTablet() ? 'Yes' : 'No'}
          />
          <InfoRow
            label="Has Notch"
            value={deviceInfo.hasNotch() ? 'Yes' : 'No'}
          />
          <InfoRow
            label="Dynamic Island"
            value={deviceInfo.hasDynamicIsland() ? 'Yes' : 'No'}
          />
        </Section>

        {/* Battery Monitoring Section */}
        <Section title="Battery Monitoring (Sync)">
          <InfoRow
            label="Battery Level"
            value={`${(batteryLevel * 100).toFixed(0)}%`}
          />
          <InfoRow
            label="Is Charging"
            value={isBatteryCharging ? 'Yes ⚡' : 'No'}
          />
          <InfoRow label="Battery State" value={powerState.batteryState} />
          <InfoRow
            label="Low Power Mode"
            value={powerState.lowPowerMode ? 'Enabled 🔋' : 'Disabled'}
          />
          <InfoRow
            label="Power State (Full)"
            value={`${(powerState.batteryLevel * 100).toFixed(0)}% • ${powerState.batteryState}`}
          />
        </Section>

        {/* System Resources Section */}
        <Section title="System Resources">
          <InfoRow label="Total Memory" value={formatBytes(totalMemory)} />
          <InfoRow label="Free Storage" value={formatBytes(freeStorage)} />
        </Section>

        {/* App Metadata Section */}
        <Section title="App Metadata">
          <InfoRow label="App Version" value={appVersion} />
          <InfoRow label="Build Number" value={buildNumber} />
          <InfoRow
            label="Bundle ID"
            value={
              Platform.OS === 'ios' ? 'com.example.app' : 'com.example.app'
            }
          />
        </Section>

        {/* Refresh Buttons */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshSyncData}
          activeOpacity={0.7}
        >
          <Text style={styles.refreshButtonText}>
            Refresh Sync Data (Instant!)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.refreshButton, styles.asyncButton]}
          onPress={loadAsyncDeviceInfo}
          activeOpacity={0.7}
        >
          <Text style={styles.refreshButtonText}>Refresh Async Data</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Nitro Modules</Text>
          <Text style={styles.footerSubtext}>Zero-overhead JSI bindings</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Section component
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

// InfoRow component
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
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
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
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
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionContent: {
    padding: 16,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 15,
    color: '#000',
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
  benchmarkButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#34C759',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  benchmarkButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
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
  refreshButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  asyncButton: {
    backgroundColor: '#5856D6',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
