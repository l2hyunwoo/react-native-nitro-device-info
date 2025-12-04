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

Most methods are now **direct property accessors** for instant synchronous access:

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

Most properties are now **synchronous** for instant access (<1ms):

**Before** (everything async or method-based):
```typescript
const uniqueId = await DeviceInfo.getUniqueId();      // Async
const totalMemory = await DeviceInfo.getTotalMemory(); // Async
const batteryLevel = await DeviceInfo.getBatteryLevel(); // Async
const isTablet = DeviceInfo.isTablet();               // Sync method
```

**After** (most properties synchronous):
```typescript
const uniqueId = DeviceInfoModule.uniqueId;      // Sync property now!
const totalMemory = DeviceInfoModule.totalMemory; // Sync property now!
const batteryLevel = DeviceInfoModule.getBatteryLevel(); // Sync method now!
const isTablet = DeviceInfoModule.isTablet;      // Sync property
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
| `await DeviceInfo.getUniqueId()` | `DeviceInfoModule.uniqueId` | Now sync property |
| `DeviceInfo.getManufacturer()` | `DeviceInfoModule.manufacturer` | Now property |
| `DeviceInfo.isTablet()` | `DeviceInfoModule.isTablet` | Now property |

### System Resources

| react-native-device-info | `react-native-nitro-device-info` | Notes |
|---------------------------|--------------------------------|-------|
| `await DeviceInfo.getTotalMemory()` | `DeviceInfoModule.totalMemory` | Now sync property |
| `await DeviceInfo.getUsedMemory()` | `DeviceInfoModule.getUsedMemory()` | Now sync method |
| `await DeviceInfo.getTotalDiskCapacity()` | `DeviceInfoModule.totalDiskCapacity` | Now sync property |
| `await DeviceInfo.getFreeDiskStorage()` | `DeviceInfoModule.getFreeDiskStorage()` | Now sync method |

### Battery Information

| react-native-device-info | `react-native-nitro-device-info` | Notes |
|---------------------------|--------------------------------|-------|
| `await DeviceInfo.getBatteryLevel()` | `DeviceInfoModule.getBatteryLevel()` | Now sync method |
| `await DeviceInfo.getPowerState()` | `DeviceInfoModule.getPowerState()` | Now sync method |
| `await DeviceInfo.isBatteryCharging()` | `DeviceInfoModule.getIsBatteryCharging()` | Now sync method |

### Application Metadata

| react-native-device-info | `react-native-nitro-device-info` | Notes |
|---------------------------|--------------------------------|-------|
| `DeviceInfo.getVersion()` | `DeviceInfoModule.version` | Now property |
| `DeviceInfo.getBuildNumber()` | `DeviceInfoModule.buildNumber` | Now property |
| `DeviceInfo.getBundleId()` | `DeviceInfoModule.bundleId` | Now property |
| `DeviceInfo.getApplicationName()` | `DeviceInfoModule.applicationName` | Now property |
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

// After (no await needed, now sync properties/methods)
const uniqueId = DeviceInfoModule.uniqueId;
const totalMemory = DeviceInfoModule.totalMemory;
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
      <Text>Battery: {(batteryLevel * 100).toFixed(0)}%</Text>
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

  // Sync properties/methods - instant access, no state needed
  const deviceId = DeviceInfoModule.deviceId;
  const brand = DeviceInfoModule.brand;
  const uniqueId = DeviceInfoModule.uniqueId;
  const totalMemory = DeviceInfoModule.totalMemory;
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
      <Text>Battery: {(batteryLevel * 100).toFixed(0)}%</Text>
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

// New: <1ms total (synchronous properties + JSI)
const brand = DeviceInfoModule.brand;
const model = DeviceInfoModule.model;
const memory = DeviceInfoModule.totalMemory;
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

## React Hooks Migration

React hooks work as drop-in replacements with identical APIs:

### Hook Migration Table

| react-native-device-info | react-native-nitro-device-info | Notes |
|--------------------------|-------------------------------|-------|
| `useBatteryLevel()` | `useBatteryLevel()` | Identical |
| `useBatteryLevelIsLow()` | `useBatteryLevelIsLow()` | Identical |
| `usePowerState()` | `usePowerState()` | Identical |
| `useIsHeadphonesConnected()` | `useIsHeadphonesConnected()` | Identical |
| `useIsWiredHeadphonesConnected()` | `useIsWiredHeadphonesConnected()` | Identical |
| `useIsBluetoothHeadphonesConnected()` | `useIsBluetoothHeadphonesConnected()` | Identical |
| `useBrightness()` | `useBrightness()` | Identical |

### Hook Migration Example

```tsx
// Before (react-native-device-info)
import { useBatteryLevel, usePowerState } from 'react-native-device-info';

// After (react-native-nitro-device-info)
import { useBatteryLevel, usePowerState } from 'react-native-nitro-device-info';

// Usage remains exactly the same
function BatteryWidget() {
  const batteryLevel = useBatteryLevel();
  const powerState = usePowerState();

  return (
    <View>
      <Text>Battery: {batteryLevel !== null ? `${Math.round(batteryLevel * 100)}%` : 'Loading...'}</Text>
      <Text>State: {powerState.batteryState}</Text>
    </View>
  );
}
```

See the [React Hooks Guide](/guide/react-hooks) for detailed hook documentation.

## Breaking Changes

### Removed Methods

These methods from `react-native-device-info` are not available:

- Some niche Android-only methods may have different names
- Event listeners for battery/network state changes are not available. Use the provided React hooks (e.g., `useBatteryLevel`, `usePowerState`) for reactive state monitoring instead.

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

---

## Migrating from expo-device

If you're migrating from `expo-device`, many APIs have compatible alternatives in `react-native-nitro-device-info`.

### Key Differences

| Aspect | expo-device | react-native-nitro-device-info |
|--------|-------------|-------------------------------|
| Architecture | Expo Module API | Nitro Modules (JSI) |
| Sync/Async | Mixed (some async) | Mostly synchronous |
| Expo Dependency | Requires Expo | Works with bare React Native |
| Performance | Good | Excellent (<1ms for sync APIs) |

### API Migration Reference

| expo-device | react-native-nitro-device-info | Notes |
|-------------|-------------------------------|-------|
| `Device.brand` | `DeviceInfoModule.brand` | Same |
| `Device.manufacturer` | `DeviceInfoModule.manufacturer` | Same |
| `Device.modelName` | `DeviceInfoModule.model` | Different property name |
| `Device.modelId` | `DeviceInfoModule.deviceId` | Different property name |
| `Device.designName` | `DeviceInfoModule.device` | Android only |
| `Device.productName` | `DeviceInfoModule.product` | Android only |
| `Device.deviceYearClass` | `DeviceInfoModule.deviceYearClass` | Same |
| `Device.totalMemory` | `DeviceInfoModule.totalMemory` | Same |
| `Device.supportedCpuArchitectures` | `DeviceInfoModule.supportedAbis` | Android only |
| `Device.osName` | `DeviceInfoModule.systemName` | Different property name |
| `Device.osVersion` | `DeviceInfoModule.systemVersion` | Different property name |
| `Device.osBuildId` | `DeviceInfoModule.display` | Android only |
| `Device.osInternalBuildId` | `DeviceInfoModule.fingerprint` | Android only |
| `Device.osBuildFingerprint` | `DeviceInfoModule.fingerprint` | Android only |
| `Device.platformApiLevel` | `DeviceInfoModule.apiLevel` | Android only |
| `Device.deviceName` | `DeviceInfoModule.deviceName` | Same |
| `Device.DeviceType` | `DeviceInfoModule.deviceType` | Returns string enum |
| `Device.getDeviceTypeAsync()` | `DeviceInfoModule.deviceType` | Now sync |
| `Device.getUptimeAsync()` | `DeviceInfoModule.getUptime()` | Now sync, returns ms |
| `Device.isRootedExperimentalAsync()` | `DeviceInfoModule.isDeviceCompromised()` | Sync, broader detection |
| `Device.isSideLoadingEnabledAsync()` | `DeviceInfoModule.isSideLoadingEnabled()` | Now sync, Android only |

### Migration Example

**Before** (`expo-device`):
```typescript
import * as Device from 'expo-device';

async function getDeviceInfo() {
  const deviceType = await Device.getDeviceTypeAsync();
  const uptime = await Device.getUptimeAsync();
  const isRooted = await Device.isRootedExperimentalAsync();
  const canSideload = await Device.isSideLoadingEnabledAsync();

  return {
    brand: Device.brand,
    model: Device.modelName,
    yearClass: Device.deviceYearClass,
    totalMemory: Device.totalMemory,
    deviceType,
    uptime,
    isRooted,
    canSideload,
  };
}
```

**After** (`react-native-nitro-device-info`):
```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function getDeviceInfo() {
  // All synchronous - no async/await needed!
  return {
    brand: DeviceInfoModule.brand,
    model: DeviceInfoModule.model,
    yearClass: DeviceInfoModule.deviceYearClass,
    totalMemory: DeviceInfoModule.totalMemory,
    deviceType: DeviceInfoModule.deviceType,
    uptime: DeviceInfoModule.getUptime(),
    isRooted: DeviceInfoModule.isDeviceCompromised(),
    canSideload: DeviceInfoModule.isSideLoadingEnabled(),
  };
}
```

### APIs Not Available

These `expo-device` APIs do not have direct equivalents:

| expo-device API | Alternative |
|-----------------|-------------|
| `Device.isDevice` | Use `!DeviceInfoModule.isEmulator` |
| `Device.getPlatformFeaturesAsync()` | Not available |

### Platform-Specific Considerations

#### Uptime Behavior

- **expo-device**: Returns uptime in milliseconds (excludes deep sleep)
- **react-native-nitro-device-info**: Returns uptime in milliseconds (excludes deep sleep)
  - iOS: Uses `systemUptime`
  - Android: Uses `uptimeMillis()`
  - Both platforms return consistent "active time" matching expo-device behavior

#### Device Year Class

Both libraries use the same Facebook algorithm for calculating device year class based on RAM and CPU specifications. The year class represents an estimated year that the device's hardware was considered high-end.

#### Root/Jailbreak Detection

- **expo-device**: `isRootedExperimentalAsync()` - Experimental, basic checks
- **react-native-nitro-device-info**: `isDeviceCompromised()` - Comprehensive detection
  - Android: Checks su binaries, root apps, system properties, test-keys
  - iOS: Checks Cydia, jailbreak files, sandbox escape, suspicious paths

## Need Help?

- [Complete API Reference](/api/device-info)
- [Type Definitions](/api/types)
- [Examples](/examples/basic-usage)
- [GitHub Issues](https://github.com/l2hyunwoo/react-native-nitro-device-info/issues)
