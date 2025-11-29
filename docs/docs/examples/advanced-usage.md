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
      hasNotch: DeviceInfoModule.hasNotch,
      hasDynamicIsland: DeviceInfoModule.hasDynamicIsland,
      isDisplayZoomed: DeviceInfoModule.isDisplayZoomed,
      brightness: DeviceInfoModule.brightness,
    };
  } else {
    return {
      apiLevel: DeviceInfoModule.apiLevel,
      securityPatch: DeviceInfoModule.securityPatch,
      hasGms: DeviceInfoModule.hasGms,
      hasHms: DeviceInfoModule.hasHms,
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
    hasGooglePlayServices: DeviceInfoModule.hasGms,
    hasHuaweiMobileServices: DeviceInfoModule.hasHms,

    // Device State
    isAirplaneMode: DeviceInfoModule.isAirplaneMode,
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
    hasNotch: DeviceInfoModule.hasNotch,
    hasDynamicIsland: DeviceInfoModule.hasDynamicIsland,
    isDisplayZoomed: DeviceInfoModule.isDisplayZoomed,

    // Screen Brightness
    brightness: DeviceInfoModule.brightness,

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
    return DeviceInfoModule.ipAddressSync;
  }

  static getCarrierSync(): string {
    return DeviceInfoModule.carrierSync;
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
    ipAddress: DeviceInfoModule.ipAddressSync,
    macAddress: DeviceInfoModule.macAddressSync,
    carrier: DeviceInfoModule.carrierSync,

    // Cached install times
    firstInstallTime: DeviceInfoModule.firstInstallTimeSync,
    lastUpdateTime: DeviceInfoModule.lastUpdateTimeSync,

    // Cached connectivity
    isLocationEnabled: DeviceInfoModule.isLocationEnabledSync,
    isHeadphonesConnected: DeviceInfoModule.isHeadphonesConnectedSync,
  };
}
```

## React Hooks

### Custom Device Info Hook

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
  const batteryLevel = DeviceInfoModule.batteryLevel;

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

### Battery Monitoring Hook

```typescript
import { useEffect, useState } from 'react';
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { PowerState } from 'react-native-nitro-device-info';

export function useBatteryMonitor(intervalMs: number = 5000) {
  const [powerState, setPowerState] = useState<PowerState>(
    DeviceInfoModule.powerState
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPowerState(DeviceInfoModule.powerState);
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

### Memory Monitoring Hook

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
    const used = DeviceInfoModule.usedMemory;
    return {
      totalMemory: total,
      usedMemory: used,
      usedPercentage: (used / total) * 100,
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const total = DeviceInfoModule.totalMemory;
      const used = DeviceInfoModule.usedMemory;
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
  const hasNotch = DeviceInfoModule.hasNotch;

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
  const hasNotch = DeviceInfoModule.hasNotch;
  const hasDynamicIsland = DeviceInfoModule.hasDynamicIsland;
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
  const powerState = DeviceInfoModule.powerState;
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
  const providers = DeviceInfoModule.availableLocationProviders;

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
    DeviceInfoModule.powerState
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
      setPowerState(DeviceInfoModule.powerState);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Sync device info
  const deviceId = DeviceInfoModule.deviceId;
  const brand = DeviceInfoModule.brand;
  const model = DeviceInfoModule.model;
  const isTablet = DeviceInfoModule.isTablet;
  const totalMemory = DeviceInfoModule.totalMemory;
  const usedMemory = DeviceInfoModule.usedMemory;

  // Platform-specific info
  const platformInfo = Platform.OS === 'ios' ? {
    hasNotch: DeviceInfoModule.hasNotch,
    hasDynamicIsland: DeviceInfoModule.hasDynamicIsland,
    brightness: DeviceInfoModule.brightness,
  } : {
    apiLevel: DeviceInfoModule.apiLevel,
    hasGms: DeviceInfoModule.hasGms,
    isAirplaneMode: DeviceInfoModule.isAirplaneMode,
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

- Check the [API Reference](/api/device-info) for all available methods
- View [Type Definitions](/api/types) for TypeScript types
- Read the [Migration Guide](/api/migration) for upgrading from other libraries
