# Advanced Usage Examples

Advanced patterns and techniques for using `react-native-nitro-device-info`.

## Platform-Specific Code

### Conditional Logic Based on Platform

```typescript
import { Platform } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function getDeviceDetails() {
  if (Platform.OS === 'ios') {
    return {
      hasNotch: DeviceInfoModule.getHasNotch(),
      hasDynamicIsland: DeviceInfoModule.getHasDynamicIsland(),
      isDisplayZoomed: DeviceInfoModule.isDisplayZoomed,
      brightness: DeviceInfoModule.getBrightness(),
    };
  } else {
    return {
      apiLevel: DeviceInfoModule.apiLevel,
      securityPatch: DeviceInfoModule.securityPatch,
      hasGms: DeviceInfoModule.getHasGms(),
      hasHms: DeviceInfoModule.getHasHms(),
    };
  }
}
```

### Android-Specific Features

```typescript
import { Platform } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function getAndroidDetails() {
  if (Platform.OS !== 'android') {
    return null;
  }

  return {
    // API Level
    apiLevel: DeviceInfoModule.apiLevel,

    // Build Information
    androidId: DeviceInfoModule.androidId,
    securityPatch: DeviceInfoModule.securityPatch,
    fingerprint: DeviceInfoModule.fingerprint,

    // ABIs (CPU architectures)
    supportedAbis: DeviceInfoModule.supportedAbis,
    supported32BitAbis: DeviceInfoModule.supported32BitAbis,
    supported64BitAbis: DeviceInfoModule.supported64BitAbis,

    // Mobile Services
    hasGooglePlayServices: DeviceInfoModule.getHasGms(),
    hasHuaweiMobileServices: DeviceInfoModule.getHasHms(),

    // Device State
    isAirplaneMode: DeviceInfoModule.getIsAirplaneMode(),
    isLowRamDevice: DeviceInfoModule.isLowRamDevice,

    // System Features
    hasNfc: DeviceInfoModule.hasSystemFeature('android.hardware.nfc'),
    hasBluetooth: DeviceInfoModule.hasSystemFeature('android.hardware.bluetooth'),

    // All Available Features
    availableFeatures: DeviceInfoModule.systemAvailableFeatures,
  };
}
```

### iOS-Specific Features

```typescript
import { Platform } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

async function getIOSDetails() {
  if (Platform.OS !== 'ios') {
    return null;
  }

  return {
    // Display Features
    hasNotch: DeviceInfoModule.getHasNotch(),
    hasDynamicIsland: DeviceInfoModule.getHasDynamicIsland(),
    isDisplayZoomed: DeviceInfoModule.isDisplayZoomed,

    // Screen Brightness
    brightness: DeviceInfoModule.getBrightness(),

    // DeviceCheck Token (async, requires network)
    deviceToken: await DeviceInfoModule.getDeviceToken().catch(() => null),

    // Unique ID with iCloud Keychain Sync
    syncedUniqueId: await DeviceInfoModule.syncUniqueId(),
  };
}
```

## Performance Optimization

### Caching Expensive Operations

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

class DeviceInfoCache {
  private static cache: Map<string, any> = new Map();

  // Cache User-Agent (slow on iOS first call)
  static async getUserAgent(): Promise<string> {
    if (this.cache.has('userAgent')) {
      return this.cache.get('userAgent');
    }

    const userAgent = await DeviceInfoModule.getUserAgent();
    this.cache.set('userAgent', userAgent);
    return userAgent;
  }

  // Cache IP address with TTL
  static async getIpAddress(ttlMs: number = 60000): Promise<string> {
    const now = Date.now();
    const cached = this.cache.get('ipAddress');

    if (cached && (now - cached.timestamp) < ttlMs) {
      return cached.value;
    }

    const ipAddress = await DeviceInfoModule.getIpAddress();
    this.cache.set('ipAddress', { value: ipAddress, timestamp: now });
    return ipAddress;
  }

  // Use synchronous cached values when available
  static getIpAddressSync(): string {
    return DeviceInfoModule.getIpAddressSync();
  }

  static getCarrierSync(): string {
    return DeviceInfoModule.getCarrierSync();
  }
}
```

### Batch Async Calls

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

async function fetchAllNetworkInfo() {
  // Fetch multiple async values in parallel
  const [ipAddress, macAddress, carrier, locationEnabled, headphones] =
    await Promise.all([
      DeviceInfoModule.getIpAddress(),
      DeviceInfoModule.getMacAddress(),
      DeviceInfoModule.getCarrier(),
      DeviceInfoModule.isLocationEnabled(),
      DeviceInfoModule.isHeadphonesConnected(),
    ]);

  return {
    ipAddress,
    macAddress,
    carrier,
    locationEnabled,
    headphones,
  };
}
```

### Use Synchronous Variants

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// Prefer synchronous cached variants for better performance
function getNetworkInfoFast() {
  return {
    // 5-second cache, instant access
    ipAddress: DeviceInfoModule.getIpAddressSync(),
    macAddress: DeviceInfoModule.getMacAddressSync(),
    carrier: DeviceInfoModule.getCarrierSync(),

    // Cached install times
    firstInstallTime: DeviceInfoModule.firstInstallTimeSync,
    lastUpdateTime: DeviceInfoModule.lastUpdateTimeSync,

    // Cached connectivity
    isLocationEnabled: DeviceInfoModule.getIsLocationEnabled(),
    isHeadphonesConnected: DeviceInfoModule.getIsHeadphonesConnected(),
  };
}
```

## React Hooks

### Built-in Hooks (Recommended)

The library provides built-in React hooks for common reactive state monitoring. These are the recommended way to monitor device state:

```typescript
import {
  useBatteryLevel,
  useBatteryLevelIsLow,
  usePowerState,
  useIsHeadphonesConnected,
  useIsWiredHeadphonesConnected,
  useIsBluetoothHeadphonesConnected,
  useBrightness,
} from 'react-native-nitro-device-info';

function DeviceMonitor() {
  // Battery monitoring
  const batteryLevel = useBatteryLevel();         // 0.0 - 1.0
  const lowBattery = useBatteryLevelIsLow();      // null or level when low
  const powerState = usePowerState();             // { batteryLevel, batteryState, lowPowerMode }

  // Audio monitoring
  const headphones = useIsHeadphonesConnected();  // boolean
  const wired = useIsWiredHeadphonesConnected();  // boolean
  const bluetooth = useIsBluetoothHeadphonesConnected(); // boolean

  // Display monitoring (iOS only)
  const brightness = useBrightness();             // 0.0 - 1.0 on iOS, -1 on Android

  return (
    <View>
      <Text>Battery: {batteryLevel !== null ? `${Math.round(batteryLevel * 100)}%` : 'Loading...'}</Text>
      <Text>Charging: {powerState.batteryState === 'charging' ? 'Yes' : 'No'}</Text>
      <Text>Headphones: {headphones ? 'Connected' : 'Disconnected'}</Text>
      {lowBattery !== null && <Text>⚠️ Low Battery Warning!</Text>}
    </View>
  );
}
```

For complete documentation, see the [React Hooks Guide](/guide/react-hooks).

### Custom Hooks for Extended Functionality

For use cases not covered by the built-in hooks, you can create custom hooks:

#### Custom Device Info Hook

```typescript
import { useEffect, useState } from 'react';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

type DeviceInfo = {
  deviceId: string;
  brand: string;
  model: string;
  systemVersion: string;
  isTablet: boolean;
  batteryLevel: number;
  ipAddress?: string;
};

export function useDeviceInfo(): DeviceInfo {
  const [ipAddress, setIpAddress] = useState<string | undefined>();

  // Sync values - instant access
  const deviceId = DeviceInfoModule.deviceId;
  const brand = DeviceInfoModule.brand;
  const model = DeviceInfoModule.model;
  const systemVersion = DeviceInfoModule.systemVersion;
  const isTablet = DeviceInfoModule.isTablet;
  const batteryLevel = DeviceInfoModule.getBatteryLevel();

  // Async values - fetch on mount
  useEffect(() => {
    DeviceInfoModule.getIpAddress()
      .then(setIpAddress)
      .catch(() => setIpAddress(undefined));
  }, []);

  return {
    deviceId,
    brand,
    model,
    systemVersion,
    isTablet,
    batteryLevel,
    ipAddress,
  };
}

// Usage
function MyComponent() {
  const deviceInfo = useDeviceInfo();

  return (
    <Text>Running on {deviceInfo.brand} {deviceInfo.model}</Text>
  );
}
```

#### Custom Battery Monitoring Hook

For custom polling intervals or additional logic, you can extend the built-in hooks:

```typescript
import { useEffect, useState } from 'react';
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { PowerState } from 'react-native-nitro-device-info';

// Custom hook with configurable polling interval
export function useBatteryMonitor(intervalMs: number = 5000) {
  const [powerState, setPowerState] = useState<PowerState>(
    DeviceInfoModule.getPowerState()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPowerState(DeviceInfoModule.getPowerState());
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return powerState;
}

// Usage
function BatteryMonitor() {
  const powerState = useBatteryMonitor(5000); // Update every 5 seconds

  return (
    <View>
      <Text>Battery: {(powerState.batteryLevel * 100).toFixed(0)}%</Text>
      <Text>Status: {powerState.batteryState}</Text>
      {powerState.lowPowerMode && <Text>Low Power Mode Active</Text>}
    </View>
  );
}
```

#### Memory Monitoring Hook

```typescript
import { useEffect, useState } from 'react';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

type MemoryInfo = {
  totalMemory: number;
  usedMemory: number;
  usedPercentage: number;
};

export function useMemoryMonitor(intervalMs: number = 1000): MemoryInfo {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo>(() => {
    const total = DeviceInfoModule.totalMemory;
    const used = DeviceInfoModule.getUsedMemory();
    return {
      totalMemory: total,
      usedMemory: used,
      usedPercentage: (used / total) * 100,
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const total = DeviceInfoModule.totalMemory;
      const used = DeviceInfoModule.getUsedMemory();
      setMemoryInfo({
        totalMemory: total,
        usedMemory: used,
        usedPercentage: (used / total) * 100,
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return memoryInfo;
}

// Usage
function MemoryMonitor() {
  const memory = useMemoryMonitor(1000); // Update every second

  return (
    <View>
      <Text>Used: {(memory.usedMemory / 1024 / 1024).toFixed(0)} MB</Text>
      <Text>Total: {(memory.totalMemory / 1024 / 1024).toFixed(0)} MB</Text>
      <Text>Usage: {memory.usedPercentage.toFixed(1)}%</Text>
    </View>
  );
}
```

## Adaptive UI Based on Device

### Responsive Layout

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function AdaptiveLayout({ children }: { children: React.ReactNode }) {
  const isTablet = DeviceInfoModule.isTablet;
  const hasNotch = DeviceInfoModule.getHasNotch();

  return (
    <View style={[
      styles.container,
      isTablet && styles.tabletContainer,
      hasNotch && styles.notchContainer,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tabletContainer: {
    padding: 32,
    maxWidth: 768,
    alignSelf: 'center',
  },
  notchContainer: {
    paddingTop: 44, // Extra padding for notch
  },
});
```

### Feature Detection UI

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function FeatureAwareUI() {
  const hasNotch = DeviceInfoModule.getHasNotch();
  const hasDynamicIsland = DeviceInfoModule.getHasDynamicIsland();
  const hasCamera = DeviceInfoModule.isCameraPresent;

  return (
    <View>
      {hasDynamicIsland && (
        <Text>🏝️ Dynamic Island Detected</Text>
      )}
      {hasNotch && !hasDynamicIsland && (
        <Text>📱 Notch Detected</Text>
      )}
      {!hasCamera && (
        <Text>⚠️ No Camera Available</Text>
      )}
    </View>
  );
}
```

## Error Handling

### Graceful Async Error Handling

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

async function getDeviceInfoSafely() {
  const deviceInfo = {
    // Sync values - always available
    deviceId: DeviceInfoModule.deviceId,
    brand: DeviceInfoModule.brand,
    model: DeviceInfoModule.model,

    // Async values - may fail
    ipAddress: 'Unknown',
    carrier: 'Unknown',
    deviceToken: null as string | null,
  };

  // Try to get IP address
  try {
    deviceInfo.ipAddress = await DeviceInfoModule.getIpAddress();
  } catch (error) {
    console.warn('Failed to get IP address:', error);
  }

  // Try to get carrier
  try {
    deviceInfo.carrier = await DeviceInfoModule.getCarrier();
  } catch (error) {
    console.warn('Failed to get carrier:', error);
  }

  // Try to get device token (iOS only, may fail)
  try {
    deviceInfo.deviceToken = await DeviceInfoModule.getDeviceToken();
  } catch (error) {
    console.log('DeviceCheck not available:', error);
  }

  return deviceInfo;
}
```

### TypeScript Type Guards

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { BatteryState } from 'react-native-nitro-device-info';

function getBatteryStatusMessage(state: BatteryState): string {
  switch (state) {
    case 'charging':
      return '⚡ Charging';
    case 'full':
      return '✅ Fully Charged';
    case 'unplugged':
      return '🔋 On Battery';
    case 'unknown':
      return '❓ Unknown';
    default:
      // TypeScript ensures exhaustive checking
      const _exhaustive: never = state;
      return 'Unknown';
  }
}

function checkBattery() {
  const powerState = DeviceInfoModule.getPowerState();
  const message = getBatteryStatusMessage(powerState.batteryState);
  console.log(message);
}
```

## Advanced Android Features

### Check System Features

```typescript
import { Platform } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function getAndroidCapabilities() {
  if (Platform.OS !== 'android') {
    return {};
  }

  return {
    hasNfc: DeviceInfoModule.hasSystemFeature('android.hardware.nfc'),
    hasBluetooth: DeviceInfoModule.hasSystemFeature('android.hardware.bluetooth'),
    hasWifi: DeviceInfoModule.hasSystemFeature('android.hardware.wifi'),
    hasCamera: DeviceInfoModule.hasSystemFeature('android.hardware.camera'),
    hasCameraFlash: DeviceInfoModule.hasSystemFeature('android.hardware.camera.flash'),
    hasFingerprint: DeviceInfoModule.hasSystemFeature('android.hardware.fingerprint'),
    hasGps: DeviceInfoModule.hasSystemFeature('android.hardware.location.gps'),
  };
}
```

### Location Providers

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function getLocationCapabilities() {
  const providers = DeviceInfoModule.getAvailableLocationProviders();

  return {
    hasGps: providers['gps'] || false,
    hasNetwork: providers['network'] || false,
    hasFused: providers['fused'] || false,
  };
}
```

## Complete Advanced Example

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { PowerState } from 'react-native-nitro-device-info';

export default function AdvancedDeviceInfo() {
  const [asyncData, setAsyncData] = useState({
    ipAddress: 'Loading...',
    carrier: 'Loading...',
  });

  const [powerState, setPowerState] = useState<PowerState>(
    DeviceInfoModule.getPowerState()
  );

  // Fetch async data on mount
  useEffect(() => {
    Promise.all([
      DeviceInfoModule.getIpAddress(),
      DeviceInfoModule.getCarrier(),
    ])
      .then(([ip, carrier]) => {
        setAsyncData({ ipAddress: ip, carrier });
      })
      .catch(error => {
        console.error('Failed to fetch async data:', error);
      });
  }, []);

  // Monitor battery every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPowerState(DeviceInfoModule.getPowerState());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Sync device info
  const deviceId = DeviceInfoModule.deviceId;
  const brand = DeviceInfoModule.brand;
  const model = DeviceInfoModule.model;
  const isTablet = DeviceInfoModule.isTablet;
  const totalMemory = DeviceInfoModule.totalMemory;
  const usedMemory = DeviceInfoModule.getUsedMemory();

  // Platform-specific info
  const platformInfo = Platform.OS === 'ios' ? {
    hasNotch: DeviceInfoModule.getHasNotch(),
    hasDynamicIsland: DeviceInfoModule.getHasDynamicIsland(),
    brightness: DeviceInfoModule.getBrightness(),
  } : {
    apiLevel: DeviceInfoModule.apiLevel,
    hasGms: DeviceInfoModule.getHasGms(),
    isAirplaneMode: DeviceInfoModule.getIsAirplaneMode(),
  };

  return (
    <ScrollView style={styles.container}>
      <Section title="Device">
        <Info label="Brand" value={brand} />
        <Info label="Model" value={model} />
        <Info label="Device ID" value={deviceId} />
        <Info label="Type" value={isTablet ? 'Tablet' : 'Phone'} />
      </Section>

      <Section title="Power">
        <Info
          label="Battery"
          value={`${(powerState.batteryLevel * 100).toFixed(0)}%`}
        />
        <Info label="Status" value={powerState.batteryState} />
        {powerState.lowPowerMode && (
          <Info label="Low Power Mode" value="Active" />
        )}
      </Section>

      <Section title="Memory">
        <Info
          label="Total RAM"
          value={`${(totalMemory / 1024 / 1024 / 1024).toFixed(1)} GB`}
        />
        <Info
          label="Used"
          value={`${(usedMemory / 1024 / 1024).toFixed(0)} MB`}
        />
      </Section>

      <Section title="Network">
        <Info label="IP Address" value={asyncData.ipAddress} />
        <Info label="Carrier" value={asyncData.carrier} />
      </Section>

      <Section title={`${Platform.OS} Specific`}>
        {Object.entries(platformInfo).map(([key, value]) => (
          <Info key={key} label={key} value={String(value)} />
        ))}
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    marginRight: 8,
  },
  value: {
    flex: 1,
  },
});
```

## Next Steps

- Learn about [React Hooks](/guide/react-hooks) for reactive state monitoring
- Check the [API Reference](/api/device-info) for all available methods
- View [Type Definitions](/api/types) for TypeScript types
- Read the [Migration Guide](/api/migration) for upgrading from other libraries
