# Migration Guide

Migrating from `react-native-device-info` to `react-native-nitro-device-info`.

## Overview

React Native Nitro Device Info maintains **80% API compatibility** with `react-native-device-info` while delivering superior performance through JSI. Most code can be migrated with minimal changes.

## Key Differences

### 1. Import Changes

**Before** (`react-native-device-info`):
```typescript
import DeviceInfo from 'react-native-device-info';
```

**After** (`react-native-nitro-device-info`):
```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
```

### 2. Module Name

The module is now called `DeviceInfoModule` instead of `DeviceInfo`:

```typescript
// Before
DeviceInfo.getBrand();

// After
DeviceInfoModule.getBrand();
```

### 3. Properties vs Methods

Some methods are now **direct property accessors** for instant synchronous access:

**Before**:
```typescript
const deviceId = DeviceInfo.getDeviceId(); // Method call
const brand = DeviceInfo.getBrand();       // Method call
const model = DeviceInfo.getModel();       // Method call
```

**After**:
```typescript
const deviceId = DeviceInfoModule.deviceId;  // Property access
const brand = DeviceInfoModule.brand;        // Property access
const model = DeviceInfoModule.model;        // Property access
```

### 4. Synchronous by Default

Most methods are now **synchronous** for instant access (<1ms):

**Before** (everything async or method-based):
```typescript
const uniqueId = await DeviceInfo.getUniqueId();      // Async
const totalMemory = await DeviceInfo.getTotalMemory(); // Async
const batteryLevel = await DeviceInfo.getBatteryLevel(); // Async
const isTablet = DeviceInfo.isTablet();               // Sync
```

**After** (most methods synchronous):
```typescript
const uniqueId = DeviceInfoModule.getUniqueId();      // Sync now!
const totalMemory = DeviceInfoModule.getTotalMemory(); // Sync now!
const batteryLevel = DeviceInfoModule.getBatteryLevel(); // Sync now!
const isTablet = DeviceInfoModule.isTablet();         // Still sync
```

### 5. Only I/O Operations Are Async

Network and file I/O operations remain asynchronous:

```typescript
// Still async - requires I/O
const ipAddress = await DeviceInfoModule.getIpAddress();
const carrier = await DeviceInfoModule.getCarrier();
const installTime = await DeviceInfoModule.getFirstInstallTime();
```

### 6. Architecture Difference

- **react-native-device-info**: Uses TurboModule/Bridge (JSON serialization)
- **`react-native-nitro-device-info`**: Uses Nitro HybridObject (JSI, zero overhead)

## Quick Migration Reference

### Device Information

| react-native-device-info | `react-native-nitro-device-info` | Notes |
|---------------------------|--------------------------------|-------|
| `DeviceInfo.getDeviceId()` | `DeviceInfoModule.deviceId` | Now a property |
| `DeviceInfo.getBrand()` | `DeviceInfoModule.brand` | Now a property |
| `DeviceInfo.getModel()` | `DeviceInfoModule.model` | Now a property |
| `DeviceInfo.getSystemName()` | `DeviceInfoModule.systemName` | Now a property |
| `DeviceInfo.getSystemVersion()` | `DeviceInfoModule.systemVersion` | Now a property |
| `await DeviceInfo.getUniqueId()` | `DeviceInfoModule.getUniqueId()` | Now sync |
| `DeviceInfo.getManufacturer()` | `DeviceInfoModule.getManufacturer()` | Same (sync) |
| `DeviceInfo.isTablet()` | `DeviceInfoModule.isTablet()` | Same (sync) |

### System Resources

| react-native-device-info | `react-native-nitro-device-info` | Notes |
|---------------------------|--------------------------------|-------|
| `await DeviceInfo.getTotalMemory()` | `DeviceInfoModule.getTotalMemory()` | Now sync |
| `await DeviceInfo.getUsedMemory()` | `DeviceInfoModule.getUsedMemory()` | Now sync |
| `await DeviceInfo.getTotalDiskCapacity()` | `DeviceInfoModule.getTotalDiskCapacity()` | Now sync |
| `await DeviceInfo.getFreeDiskStorage()` | `DeviceInfoModule.getFreeDiskStorage()` | Now sync |

### Battery Information

| react-native-device-info | `react-native-nitro-device-info` | Notes |
|---------------------------|--------------------------------|-------|
| `await DeviceInfo.getBatteryLevel()` | `DeviceInfoModule.getBatteryLevel()` | Now sync |
| `await DeviceInfo.getPowerState()` | `DeviceInfoModule.getPowerState()` | Now sync |
| `await DeviceInfo.isBatteryCharging()` | `DeviceInfoModule.isBatteryCharging()` | Now sync |

### Application Metadata

| react-native-device-info | `react-native-nitro-device-info` | Notes |
|---------------------------|--------------------------------|-------|
| `DeviceInfo.getVersion()` | `DeviceInfoModule.getVersion()` | Same (sync) |
| `DeviceInfo.getBuildNumber()` | `DeviceInfoModule.getBuildNumber()` | Same (sync) |
| `DeviceInfo.getBundleId()` | `DeviceInfoModule.getBundleId()` | Same (sync) |
| `DeviceInfo.getApplicationName()` | `DeviceInfoModule.getApplicationName()` | Same (sync) |
| `DeviceInfo.getReadableVersion()` | `DeviceInfoModule.readableVersion` | Now a property |

### Network & Connectivity

| react-native-device-info | `react-native-nitro-device-info` | Notes |
|---------------------------|--------------------------------|-------|
| `await DeviceInfo.getIpAddress()` | `await DeviceInfoModule.getIpAddress()` | Still async (I/O) |
| `await DeviceInfo.getMacAddress()` | `await DeviceInfoModule.getMacAddress()` | Still async (I/O) |
| `await DeviceInfo.getCarrier()` | `await DeviceInfoModule.getCarrier()` | Still async (I/O) |
| `await DeviceInfo.isLocationEnabled()` | `await DeviceInfoModule.isLocationEnabled()` | Still async (I/O) |

## Step-by-Step Migration

### 1. Install the New Library

```bash
# Remove old library
npm uninstall react-native-device-info

# Install new library
npm install react-native-nitro-device-info react-native-nitro-modules

# iOS
cd ios && pod install && cd ..
```

### 2. Update Imports

Find and replace imports across your codebase:

```typescript
// Before
import DeviceInfo from 'react-native-device-info';

// After
import { DeviceInfoModule } from 'react-native-nitro-device-info';
```

### 3. Update Module Name

Replace all `DeviceInfo` references with `DeviceInfoModule`:

```typescript
// Before
const brand = DeviceInfo.getBrand();

// After
const brand = DeviceInfoModule.brand; // Also changed to property
```

### 4. Convert Method Calls to Properties

Update method calls that are now properties:

```typescript
// Before
const deviceId = DeviceInfo.getDeviceId();
const brand = DeviceInfo.getBrand();
const model = DeviceInfo.getModel();
const systemName = DeviceInfo.getSystemName();
const systemVersion = DeviceInfo.getSystemVersion();
const readableVersion = DeviceInfo.getReadableVersion();

// After
const deviceId = DeviceInfoModule.deviceId;
const brand = DeviceInfoModule.brand;
const model = DeviceInfoModule.model;
const systemName = DeviceInfoModule.systemName;
const systemVersion = DeviceInfoModule.systemVersion;
const readableVersion = DeviceInfoModule.readableVersion;
```

### 5. Remove Unnecessary `await` Keywords

Remove `await` from methods that are now synchronous:

```typescript
// Before
const uniqueId = await DeviceInfo.getUniqueId();
const totalMemory = await DeviceInfo.getTotalMemory();
const batteryLevel = await DeviceInfo.getBatteryLevel();

// After (no await needed)
const uniqueId = DeviceInfoModule.getUniqueId();
const totalMemory = DeviceInfoModule.getTotalMemory();
const batteryLevel = DeviceInfoModule.getBatteryLevel();
```

### 6. Test Your Changes

Run your app and verify:
- All device info calls work correctly
- No runtime errors from async/sync changes
- TypeScript types are correct

## Complete Example

### Before (react-native-device-info)

```typescript
import React, { useEffect, useState } from 'react';
import DeviceInfo from 'react-native-device-info';

function DeviceInfoScreen() {
  const [deviceId, setDeviceId] = useState('');
  const [brand, setBrand] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [totalMemory, setTotalMemory] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    async function loadDeviceInfo() {
      // Everything was async or method-based
      const id = DeviceInfo.getDeviceId();
      const b = DeviceInfo.getBrand();
      const uid = await DeviceInfo.getUniqueId();
      const mem = await DeviceInfo.getTotalMemory();
      const bat = await DeviceInfo.getBatteryLevel();
      const ip = await DeviceInfo.getIpAddress();

      setDeviceId(id);
      setBrand(b);
      setUniqueId(uid);
      setTotalMemory(mem);
      setBatteryLevel(bat);
      setIpAddress(ip);
    }

    loadDeviceInfo();
  }, []);

  return (
    <View>
      <Text>Device: {brand} {deviceId}</Text>
      <Text>Unique ID: {uniqueId}</Text>
      <Text>Memory: {totalMemory}</Text>
      <Text>Battery: {batteryLevel * 100}%</Text>
      <Text>IP: {ipAddress}</Text>
    </View>
  );
}
```

### After (`react-native-nitro-device-info`)

```typescript
import React, { useEffect, useState } from 'react';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function DeviceInfoScreen() {
  const [ipAddress, setIpAddress] = useState('');

  // Sync properties - instant access, no state needed
  const deviceId = DeviceInfoModule.deviceId;
  const brand = DeviceInfoModule.brand;
  const uniqueId = DeviceInfoModule.getUniqueId();
  const totalMemory = DeviceInfoModule.getTotalMemory();
  const batteryLevel = DeviceInfoModule.getBatteryLevel();

  useEffect(() => {
    // Only async operations need useEffect
    DeviceInfoModule.getIpAddress().then(setIpAddress);
  }, []);

  return (
    <View>
      <Text>Device: {brand} {deviceId}</Text>
      <Text>Unique ID: {uniqueId}</Text>
      <Text>Memory: {totalMemory}</Text>
      <Text>Battery: {batteryLevel * 100}%</Text>
      <Text>IP: {ipAddress}</Text>
    </View>
  );
}
```

## Benefits of Migration

### 1. Performance Improvement

```typescript
// Old: ~5-10ms per call (async + bridge serialization)
const brand = await DeviceInfo.getBrand();
const model = await DeviceInfo.getModel();
const memory = await DeviceInfo.getTotalMemory();

// New: <1ms total (synchronous + JSI)
const brand = DeviceInfoModule.brand;
const model = DeviceInfoModule.model;
const memory = DeviceInfoModule.getTotalMemory();
```

### 2. Simpler Code

No need for `async`/`await` for simple getters:

```typescript
// Old - required async function
async function getDeviceInfo() {
  const brand = await DeviceInfo.getBrand();
  const model = await DeviceInfo.getModel();
  return `${brand} ${model}`;
}

// New - direct access
function getDeviceInfo() {
  return `${DeviceInfoModule.brand} ${DeviceInfoModule.model}`;
}
```

### 3. Better TypeScript Support

Full type definitions with excellent IntelliSense:

```typescript
import type { PowerState, BatteryState } from 'react-native-nitro-device-info';

const powerState: PowerState = DeviceInfoModule.getPowerState();
// TypeScript knows: powerState.batteryLevel, powerState.batteryState, powerState.lowPowerMode
```

### 4. Future-Proof Architecture

Built on React Native's New Architecture (Fabric + JSI) for long-term support.

## Breaking Changes

### Removed Methods

These methods from `react-native-device-info` are not available:

- Event listeners (use polling instead for battery/network state changes)
- Some niche Android-only methods may have different names

### Behavioral Changes

1. **Synchronous by default**: Most methods no longer return Promises
2. **Property accessors**: Some getters are now properties
3. **Module name**: Must use `DeviceInfoModule` instead of `DeviceInfo`

## Troubleshooting

### TypeScript Errors After Migration

If you see type errors after migration:

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
yarn install

# Restart TypeScript server in your IDE
```

### Runtime Errors

If you get "Cannot read property" errors:

1. Ensure `react-native-nitro-modules` is installed as peer dependency
2. Run `pod install` on iOS
3. Clean build (`yarn android` / `yarn ios` with clean)

### Missing Methods

If a method is not available:

1. Check the [API Reference](/api/device-info) for the correct method name
2. Some methods may have been renamed or consolidated
3. Open an issue on GitHub if you need a specific method

## Need Help?

- [Complete API Reference](/api/device-info)
- [Type Definitions](/api/types)
- [Examples](/examples/basic-usage)
- [GitHub Issues](https://github.com/l2hyunwoo/react-native-nitro-device-info/issues)
