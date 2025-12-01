# React Hooks Guide

This guide shows how to use React hooks for monitoring runtime device properties in your React Native application.

## Overview

React hooks provide a declarative way to subscribe to device state changes. Instead of manually managing event listeners and cleanup, hooks handle all the complexity for you.

**Benefits**:
- Automatic cleanup on component unmount
- Reactive updates when device state changes
- Familiar React hook pattern
- TypeScript support out of the box

## Installation

The hooks are included with `react-native-nitro-device-info`:

```bash
# npm
npm install react-native-nitro-device-info

# yarn
yarn add react-native-nitro-device-info

# Don't forget pod install for iOS
cd ios && pod install
```

## Quick Examples

### Battery Monitoring

Monitor battery level with automatic re-renders:

```tsx
import { useBatteryLevel, usePowerState } from 'react-native-nitro-device-info';

function BatteryWidget() {
  const batteryLevel = useBatteryLevel();
  const powerState = usePowerState();

  return (
    <View style={styles.widget}>
      <Text style={styles.label}>Battery</Text>
      <Text style={styles.value}>
        {batteryLevel !== null
          ? `${Math.round(batteryLevel * 100)}%`
          : 'Loading...'}
      </Text>
      <Text style={styles.status}>
        {powerState.batteryState === 'charging' ? '⚡ Charging' : '🔋 On Battery'}
      </Text>
    </View>
  );
}
// Note: styles (widget, label, value, status) need to be defined in a StyleSheet
```

### Low Battery Alerts

Show warnings when battery is low:

```tsx
import { useBatteryLevelIsLow } from 'react-native-nitro-device-info';

function LowBatteryAlert() {
  const lowBattery = useBatteryLevelIsLow();

  // Only renders when battery is below threshold
  if (lowBattery === null) {
    return null;
  }

  return (
    <View style={styles.alert}>
      <Text style={styles.alertText}>
        ⚠️ Low Battery: {Math.round(lowBattery * 100)}%
      </Text>
      <Text style={styles.alertHint}>
        Please connect your charger
      </Text>
    </View>
  );
}
// Note: styles (alert, alertText, alertHint) need to be defined in a StyleSheet
```

### Headphone Detection

Adapt your UI based on audio output:

```tsx
import {
  useIsHeadphonesConnected,
  useIsWiredHeadphonesConnected,
  useIsBluetoothHeadphonesConnected
} from 'react-native-nitro-device-info';

function AudioOutputIndicator() {
  const anyHeadphones = useIsHeadphonesConnected();
  const wiredHeadphones = useIsWiredHeadphonesConnected();
  const bluetoothHeadphones = useIsBluetoothHeadphonesConnected();

  const getOutputIcon = () => {
    if (bluetoothHeadphones) return '🎧 Bluetooth';
    if (wiredHeadphones) return '🔌 Wired';
    return '🔊 Speaker';
  };

  return (
    <View style={styles.indicator}>
      <Text>{getOutputIcon()}</Text>
    </View>
  );
}
```

### Brightness Monitoring (iOS)

Track screen brightness changes:

```tsx
import { useBrightness } from 'react-native-nitro-device-info';
import { Platform } from 'react-native';

function BrightnessDisplay() {
  const brightness = useBrightness();

  if (Platform.OS === 'android') {
    return <Text>Brightness monitoring is iOS only</Text>;
  }

  if (brightness === null) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <Text>Brightness: {Math.round(brightness * 100)}%</Text>
      <View
        style={[
          styles.brightnessBar,
          { width: `${brightness * 100}%` }
        ]}
      />
    </View>
  );
}
// Note: styles.brightnessBar needs to be defined in a StyleSheet
```

## Complete Example: Device Monitor Dashboard

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import {
  useBatteryLevel,
  usePowerState,
  useBatteryLevelIsLow,
  useIsHeadphonesConnected,
  useIsWiredHeadphonesConnected,
  useIsBluetoothHeadphonesConnected,
  useBrightness,
} from 'react-native-nitro-device-info';

export function DeviceMonitorDashboard() {
  // Battery hooks
  const batteryLevel = useBatteryLevel();
  const powerState = usePowerState();
  const lowBattery = useBatteryLevelIsLow();

  // Headphone hooks
  const headphones = useIsHeadphonesConnected();
  const wiredHeadphones = useIsWiredHeadphonesConnected();
  const bluetoothHeadphones = useIsBluetoothHeadphonesConnected();

  // Display hooks
  const brightness = useBrightness();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Device Monitor</Text>

      {/* Battery Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔋 Battery</Text>
        <Row label="Level" value={formatPercent(batteryLevel)} />
        <Row label="State" value={powerState.batteryState ?? 'unknown'} />
        <Row label="Low Power Mode" value={powerState.lowPowerMode ? 'Yes' : 'No'} />
        {lowBattery !== null && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>⚠️ Low Battery!</Text>
          </View>
        )}
      </View>

      {/* Audio Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎧 Audio Output</Text>
        <Row label="Any Headphones" value={headphones ? 'Connected' : 'Disconnected'} />
        <Row label="Wired" value={wiredHeadphones ? 'Yes' : 'No'} />
        <Row label="Bluetooth" value={bluetoothHeadphones ? 'Yes' : 'No'} />
      </View>

      {/* Display Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Display</Text>
        <Row
          label="Brightness"
          value={brightness !== null && brightness >= 0
            ? formatPercent(brightness)
            : 'N/A'
          }
        />
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function formatPercent(value: number | null): string {
  if (value === null) return 'Loading...';
  return `${Math.round(value * 100)}%`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontWeight: '500',
  },
  value: {
    color: '#666',
  },
  warning: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  warningText: {
    color: '#856404',
  },
});
```

## Troubleshooting

### Hook returns null indefinitely

Check that the native module is properly linked:

```tsx
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// Debug: check if module is available
console.log('DeviceInfoModule:', DeviceInfoModule);
```

### Updates not received

Ensure the app is in the foreground to receive updates from hooks.

### Brightness returns -1

This is expected on Android - brightness monitoring is iOS-only.

## See Also

- [Hooks API Reference](/api/hooks) - Complete hook signatures and types
- [Migration Guide](/api/migration) - Migrating from react-native-device-info
- [Basic Usage Examples](/examples/basic-usage) - More usage examples
