# Migration Guide

Migrating from `react-native-device-info` to `react-native-nitro-device-info`.

## Overview

`react-native-nitro-device-info` ships a **drop-in compatibility layer** that exposes the exact
`react-native-device-info` (RNDI) API surface — same function names, same signatures, same default
`DeviceInfo` object, same hooks. You import from `react-native-nitro-device-info/compat` instead of
`react-native-device-info`, and **your call sites stay unchanged**.

There are two ways to migrate. Pick based on how much you want to change:

| Path | Effort | What you get |
|------|--------|--------------|
| **Drop-in (recommended)** | One command — rewrite imports only | Zero code changes. RNDI's exact API, backed by Nitro/JSI. |
| **Native (optional)** | Manual rewrite of call sites | Direct property access + synchronous getters for maximum performance. |

Start with the drop-in path. Move individual call sites to the native API later if you want the
last bit of performance — the two can coexist.

## Drop-in Migration (recommended)

### 1. Install

```bash
# Install the new library + its peer dependency
npm install react-native-nitro-device-info react-native-nitro-modules
# (or: yarn add react-native-nitro-device-info react-native-nitro-modules)

# iOS
cd ios && pod install && cd ..
```

### 2. Run the codemod

The library bundles a codemod that rewrites every `react-native-device-info` import to
`react-native-nitro-device-info/compat`. It **only rewrites import specifiers** — it never touches
your call sites.

```bash
npx react-native-nitro-device-info migrate
# or target a specific directory:
npx react-native-nitro-device-info migrate src
```

It rewrites ES imports (default, named, namespace), re-exports, and CommonJS `require()`:

```typescript
// Before
import DeviceInfo from 'react-native-device-info';
import { getModel, useBatteryLevel } from 'react-native-device-info';

// After (rewritten automatically — call sites unchanged)
import DeviceInfo from 'react-native-nitro-device-info/compat';
import { getModel, useBatteryLevel } from 'react-native-nitro-device-info/compat';
```

Prefer to do it by hand? A project-wide find-and-replace of the import string
`'react-native-device-info'` → `'react-native-nitro-device-info/compat'` achieves the same result.

### 3. Remove the old dependency

```bash
npm uninstall react-native-device-info
```

### 4. Review the documented caveats

The compat layer covers **the entire RNDI API surface**. A small number of APIs return placeholder
values because they have no native equivalent in this library — see
[Compat Layer Caveats](#compat-layer-caveats) below. If your app doesn't use those APIs, you're done.

That's it — no call sites to change, no `await` to add or remove.

## Compat Layer Caveats

The compat layer is signature-compatible across the whole RNDI surface, with these documented
exceptions:

| API | Compat behavior | Why |
|-----|-----------------|-----|
| `getInstanceId()` / `getInstanceIdSync()` | Returns `'unknown'` | RNDI deprecated these (Firebase/GMS Instance ID is slated for removal). No native equivalent. |
| `getAppSetId()` | Returns `{ id: 'unknown', scope: -1 }` | Identical to RNDI's own value when the optional Play Services App Set dependency is absent. |
| `getUserAgentSync()` | Returns `''` | This library computes the user agent asynchronously (iOS WebView). Use the async `getUserAgent()` for a real value. |
| `getInstallReferrerSync()` | Returns `'unknown'` | The install referrer is only available asynchronously. Use the async `getInstallReferrer()`. |

Everything else maps to a real value. A few APIs differ in *shape* but are transparently converted
for you (e.g. `getAvailableLocationProviders()` returns RNDI's `{ gps: true, network: true }` map,
`getFreeDiskStorage(storageType?)` accepts and ignores the iOS storage-type argument, and the async
accessory hooks return RNDI's `{ loading, result }` shape).

## Native Migration (optional, for maximum performance)

If you want direct property access and synchronous getters instead of the compat shims, import
`DeviceInfoModule` from the package root and rewrite call sites using the tables below.

### Key Differences

**Architecture**

- **react-native-device-info**: TurboModule / Bridge (JSON serialization)
- **react-native-nitro-device-info**: Nitro HybridObject (JSI, zero overhead)

**Properties vs methods** — most RNDI methods become direct property accessors:

```typescript
// react-native-device-info        // native API
const deviceId = DeviceInfo.getDeviceId();   const deviceId = DeviceInfoModule.deviceId;
const brand = DeviceInfo.getBrand();         const brand = DeviceInfoModule.brand;
```

**Synchronous by default** — values that were async in RNDI are now sync:

```typescript
const uniqueId = DeviceInfoModule.uniqueId;            // sync property
const totalMemory = DeviceInfoModule.totalMemory;       // sync property
const batteryLevel = DeviceInfoModule.getBatteryLevel(); // sync method
const isTablet = DeviceInfoModule.isTablet;             // sync property
```

**Only I/O operations stay async**:

```typescript
const ipAddress = await DeviceInfoModule.getIpAddress();
const carrier = await DeviceInfoModule.getCarrier();
const installTime = await DeviceInfoModule.getFirstInstallTime();
```

### Quick Migration Reference

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

### Step-by-Step (native path)

> These steps assume you want the native API. For the zero-change path, use
> [Drop-in Migration](#drop-in-migration-recommended) instead.

#### 1. Install the New Library

```bash
# Remove old library
npm uninstall react-native-device-info

# Install new library
npm install react-native-nitro-device-info react-native-nitro-modules

# iOS
cd ios && pod install && cd ..
```

#### 2. Update Imports

Find and replace imports across your codebase:

```typescript
// Before
import DeviceInfo from 'react-native-device-info';

// After
import { DeviceInfoModule } from 'react-native-nitro-device-info';
```

#### 3. Update Module Name

Replace all `DeviceInfo` references with `DeviceInfoModule`:

```typescript
// Before
const brand = DeviceInfo.getBrand();

// After
const brand = DeviceInfoModule.brand; // Also changed to property
```

#### 4. Convert Method Calls to Properties

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

#### 5. Remove Unnecessary `await` Keywords

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

#### 6. Test Your Changes

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

**Drop-in path:** every RNDI hook is re-exported from the compat layer with RNDI's exact signature
(including the `{ loading, result }` shape for the async hooks). The codemod rewrites the import for
you; usage is unchanged:

```tsx
// Before
import { useBatteryLevel, useDeviceName } from 'react-native-device-info';

// After (rewritten to the compat subpath — usage identical)
import { useBatteryLevel, useDeviceName } from 'react-native-nitro-device-info/compat';

function BatteryWidget() {
  const batteryLevel = useBatteryLevel();        // number | null
  const { result: name } = useDeviceName();       // AsyncHookResult<string>
  return <Text>{name}: {batteryLevel}</Text>;
}
```

**Native path:** the package root exports 7 hooks directly, returning bare values (no
`AsyncHookResult` wrapper). Use these if you migrate call sites to the native API.

| react-native-device-info | Native root export | Notes |
|--------------------------|-------------------------------|-------|
| `useBatteryLevel()` | `useBatteryLevel()` | Identical (`number \| null`) |
| `useBatteryLevelIsLow()` | `useBatteryLevelIsLow()` | Identical |
| `usePowerState()` | `usePowerState()` | Identical |
| `useIsHeadphonesConnected()` | `useIsHeadphonesConnected()` | Returns `boolean` (compat wraps to `{ loading, result }`) |
| `useIsWiredHeadphonesConnected()` | `useIsWiredHeadphonesConnected()` | Returns `boolean` (compat wraps) |
| `useIsBluetoothHeadphonesConnected()` | `useIsBluetoothHeadphonesConnected()` | Returns `boolean` (compat wraps) |
| `useBrightness()` | `useBrightness()` | Identical (`number \| null`) |

RNDI's remaining hooks (`useFirstInstallTime`, `useDeviceName`, `useHasSystemFeature`,
`useIsEmulator`, `useManufacturer`) are available on the **compat path only**, where they return
RNDI's `AsyncHookResult<T>` shape.

See the [React Hooks Guide](/guide/react-hooks) for detailed hook documentation.

### Behavioral Changes (native path only)

These differences apply when you adopt the **native API** (`DeviceInfoModule`). The drop-in compat
layer preserves the original RNDI behavior, so none of these affect you on the drop-in path.

1. **Synchronous by default**: Most methods no longer return Promises
2. **Property accessors**: Some getters are now properties
3. **Module name**: Uses `DeviceInfoModule` instead of `DeviceInfo`
4. **Event listeners**: Raw battery/network state listeners are not exposed; use the provided React
   hooks (e.g. `useBatteryLevel`, `usePowerState`) for reactive monitoring instead. The compat layer
   re-exposes RNDI's hooks unchanged.

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

---

## Migrating from react-native-carrier-info

If you're using `react-native-carrier-info` for carrier information, you can consolidate into `react-native-nitro-device-info`.

### API Migration Reference

| react-native-carrier-info | react-native-nitro-device-info | Notes |
|---------------------------|-------------------------------|-------|
| `await CarrierInfo.allowsVOIP()` | `DeviceInfoModule.carrierAllowsVOIP` | Now sync property |
| `await CarrierInfo.carrierName()` | `DeviceInfoModule.getCarrierSync()` | Now sync method |
| `await CarrierInfo.isoCountryCode()` | `DeviceInfoModule.carrierIsoCountryCode` | Now sync property |
| `await CarrierInfo.mobileCountryCode()` | `DeviceInfoModule.mobileCountryCode` | Now sync property |
| `await CarrierInfo.mobileNetworkCode()` | `DeviceInfoModule.mobileNetworkCode` | Now sync property |
| `await CarrierInfo.mobileNetworkOperator()` | `DeviceInfoModule.mobileNetworkOperator` | Now sync property |

### Migration Example

**Before** (`react-native-carrier-info`):
```typescript
import CarrierInfo from 'react-native-carrier-info';

async function getCarrierDetails() {
  const carrierName = await CarrierInfo.carrierName();
  const allowsVOIP = await CarrierInfo.allowsVOIP();
  const isoCountryCode = await CarrierInfo.isoCountryCode();
  const mcc = await CarrierInfo.mobileCountryCode();
  const mnc = await CarrierInfo.mobileNetworkCode();
  const operator = await CarrierInfo.mobileNetworkOperator();

  return { carrierName, allowsVOIP, isoCountryCode, mcc, mnc, operator };
}
```

**After** (`react-native-nitro-device-info`):
```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function getCarrierDetails() {
  // All synchronous - no async/await needed!
  return {
    carrierName: DeviceInfoModule.getCarrierSync(),
    allowsVOIP: DeviceInfoModule.carrierAllowsVOIP,
    isoCountryCode: DeviceInfoModule.carrierIsoCountryCode,
    mcc: DeviceInfoModule.mobileCountryCode,
    mnc: DeviceInfoModule.mobileNetworkCode,
    operator: DeviceInfoModule.mobileNetworkOperator,
  };
}
```

### Key Benefits

1. **No async/await**: All carrier properties are synchronous
2. **Single dependency**: No need to install separate carrier-info package
3. **JSI performance**: Zero-overhead native access via Nitro Modules
4. **Unified API**: Carrier info alongside 80+ other device properties

### Platform Notes

- **iOS**: Uses `CTTelephonyNetworkInfo` and `CTCarrier` APIs
- **Android**: Uses `TelephonyManager` APIs
- **carrierAllowsVOIP**: Returns actual value on iOS, always `true` on Android (no equivalent API)
- **Empty strings**: All properties return `""` when no SIM card is present

## Need Help?

- [Complete API Reference](/api/device-info)
- [Type Definitions](/api/types)
- [Examples](/examples/basic-usage)
- [GitHub Issues](https://github.com/l2hyunwoo/react-native-nitro-device-info/issues)
