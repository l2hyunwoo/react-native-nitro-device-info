# Quick Start

This guide will show you how to quickly get up and running with `react-native-nitro-device-info`.

## Basic Usage

Import the module and start accessing device information:

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// Synchronous properties (immediate - <1ms)
console.log(DeviceInfoModule.deviceId); // "iPhone14,2"
console.log(DeviceInfoModule.systemVersion); // "15.0"
console.log(DeviceInfoModule.brand); // "Apple"
console.log(DeviceInfoModule.model); // "iPhone"
```

### Synchronous Properties

```typescript
// Device identification
const uniqueId = DeviceInfoModule.uniqueId;
console.log(uniqueId); // "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"

const manufacturer = DeviceInfoModule.manufacturer;
console.log(manufacturer); // "Apple"

// Device capabilities
const isTablet = DeviceInfoModule.isTablet;
console.log(isTablet); // false

// Battery information
const batteryLevel = DeviceInfoModule.batteryLevel;
console.log(`Battery: ${(batteryLevel * 100).toFixed(0)}%`); // "Battery: 85%"
```

### Asynchronous Methods

Only I/O-bound operations are asynchronous (~20-100ms):

```typescript
// Network information (requires I/O)
const ipAddress = await DeviceInfoModule.getIpAddress();
console.log(ipAddress); // "192.168.1.100"

// Carrier information (requires system query)
const carrier = await DeviceInfoModule.getCarrier();
console.log(carrier); // "T-Mobile"
```

## Advanced Usage

### Device Identification

Get comprehensive device identification information:

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

const deviceId = DeviceInfoModule.deviceId; // "iPhone14,2"
const manufacturer = DeviceInfoModule.manufacturer; // "Apple"
const uniqueId = DeviceInfoModule.uniqueId; // "FCDBD8EF-..."
const brand = DeviceInfoModule.brand; // "Apple"
const model = DeviceInfoModule.model; // "iPhone"
```

### Device Capabilities

Check what features the device supports:

```typescript
const isTablet = DeviceInfoModule.isTablet; // false
const hasNotch = DeviceInfoModule.hasNotch; // true
const hasDynamicIsland = DeviceInfoModule.hasDynamicIsland; // false
const isCameraPresent = DeviceInfoModule.isCameraPresent; // true
const isEmulator = DeviceInfoModule.isEmulator; // false
```

### System Resources

Monitor memory and storage:

```typescript
const totalMemory = DeviceInfoModule.totalMemory;
const usedMemory = DeviceInfoModule.usedMemory;
const totalDisk = DeviceInfoModule.totalDiskCapacity;
const freeDisk = DeviceInfoModule.freeDiskStorage;

console.log(
  `RAM: ${(usedMemory / 1024 / 1024).toFixed(0)}MB / ${(totalMemory / 1024 / 1024).toFixed(0)}MB`
);
console.log(
  `Storage: ${(freeDisk / 1024 / 1024 / 1024).toFixed(1)}GB free of ${(totalDisk / 1024 / 1024 / 1024).toFixed(1)}GB`
);
```

### Battery Information

Get detailed battery status with TypeScript types:

```typescript
import type { PowerState } from 'react-native-nitro-device-info';

const batteryLevel = DeviceInfoModule.batteryLevel;
const isCharging = DeviceInfoModule.isBatteryCharging;
const powerState: PowerState = DeviceInfoModule.powerState;

console.log(
  `Battery: ${(batteryLevel * 100).toFixed(0)}% ${isCharging ? '(charging)' : ''}`
);
console.log(`Low Power Mode: ${powerState.lowPowerMode}`);
```

### Application Metadata

Access information about your app:

```typescript
const version = DeviceInfoModule.version;
const buildNumber = DeviceInfoModule.buildNumber;
const bundleId = DeviceInfoModule.bundleId;
const appName = DeviceInfoModule.applicationName;

console.log(`${appName} (${bundleId})`);
console.log(`Version: ${version} (${buildNumber})`);
```

### Network & Connectivity

Query network information (async operations):

```typescript
const ipAddress = await DeviceInfoModule.getIpAddress();
const carrier = await DeviceInfoModule.getCarrier();
const isLocationEnabled = await DeviceInfoModule.isLocationEnabled();

console.log(`IP: ${ipAddress}`);
console.log(`Carrier: ${carrier}`);
console.log(`Location Services: ${isLocationEnabled ? 'enabled' : 'disabled'}`);
```

### Platform-Specific Information

Access platform-specific details:

```typescript
// Android: Returns API level (e.g., 33 for Android 13)
// iOS: Returns -1
const apiLevel = DeviceInfoModule.apiLevel;

// Android: Returns supported ABIs (e.g., ["arm64-v8a", "armeabi-v7a"])
// iOS: Returns ["arm64"]
const abis = DeviceInfoModule.supportedAbis;

// Android: Check if Google Mobile Services is available
// iOS: Returns false
const hasGms = DeviceInfoModule.hasGms;

console.log(`API Level: ${apiLevel}`);
console.log(`Supported ABIs: ${abis.join(', ')}`);
console.log(`Has GMS: ${hasGms}`);
```

## Type Definitions

The library includes full TypeScript definitions:

```typescript
import type {
  DeviceInfo,
  PowerState,
  BatteryState,
  DeviceType,
} from 'react-native-nitro-device-info';

// Use types for better IntelliSense and type safety
const powerState: PowerState = DeviceInfoModule.getPowerState();
// TypeScript knows: powerState.lowPowerMode, powerState.batteryLevel, etc.
```

## React Component Example

Here's a complete example using React hooks:

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { PowerState } from 'react-native-nitro-device-info';

export default function DeviceInfoScreen() {
  const [ipAddress, setIpAddress] = useState<string>('Loading...');

  // Sync properties - instant access
  const deviceId = DeviceInfoModule.deviceId;
  const brand = DeviceInfoModule.brand;
  const systemVersion = DeviceInfoModule.systemVersion;

  // Sync properties - instant access
  const isTablet = DeviceInfoModule.isTablet;
  const batteryLevel = DeviceInfoModule.batteryLevel;
  const powerState: PowerState = DeviceInfoModule.powerState;

  useEffect(() => {
    // Async methods - fetch on mount
    DeviceInfoModule.getIpAddress()
      .then(setIpAddress)
      .catch(() => setIpAddress('Unavailable'));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device Information</Text>

      <Text>Device: {brand} {deviceId}</Text>
      <Text>OS Version: {systemVersion}</Text>
      <Text>Device Type: {isTablet ? 'Tablet' : 'Phone'}</Text>
      <Text>Battery: {(batteryLevel * 100).toFixed(0)}%</Text>
      <Text>Low Power Mode: {powerState.lowPowerMode ? 'Yes' : 'No'}</Text>
      <Text>IP Address: {ipAddress}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
```

## Performance Tips

### 1. Use Direct Properties When Available

```typescript
// Prefer this (direct property access)
const brand = DeviceInfoModule.brand;

// Over this (if it were a method)
const brand = DeviceInfoModule.getBrand(); // Not needed - use property
```

### 2. Cache Async Results

Network queries are I/O-bound. Cache results if they won't change:

```typescript
// Cache on app startup
let cachedIpAddress: string | null = null;

async function getIpAddressCached() {
  if (!cachedIpAddress) {
    cachedIpAddress = await DeviceInfoModule.getIpAddress();
  }
  return cachedIpAddress;
}
```

### 3. Batch Multiple Queries

If you need multiple async values, fetch them in parallel:

```typescript
// Good - parallel fetching
const [ipAddress, carrier, locationEnabled] = await Promise.all([
  DeviceInfoModule.getIpAddress(),
  DeviceInfoModule.getCarrier(),
  DeviceInfoModule.isLocationEnabled(),
]);

// Bad - sequential fetching
const ipAddress = await DeviceInfoModule.getIpAddress();
const carrier = await DeviceInfoModule.getCarrier();
const locationEnabled = await DeviceInfoModule.isLocationEnabled();
```

## Next Steps

- Check out the [API Reference](/api/) for all available methods and properties
- View [Advanced Usage Examples](/examples/advanced-usage) for more patterns
- Read the [Migration Guide](/api/migration) if coming from `react-native-device-info`
- Explore the [Type Definitions](/api/types) for full TypeScript support
